#!/usr/bin/env node
/**
 * 对 src/assets/word-images-webp/*.webp 中体积 > --max-kb 的图，再压一次压到 <= max-kb
 *
 * 策略：
 *   - 起始 quality 78，逐次 -5 直到 ≤ max-kb 或 quality 落到 25
 *   - 同时按 [max-size, max-size/1.2, max-size/1.5] 三档降采样尝试
 *   - 任一组合命中即覆盖写回原文件
 *
 * 用法：
 *   node scripts/shrunk-large-webp.mjs [--max-kb 20] [--max-size 800] [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function flag(name) {
  return process.argv.includes('--' + name);
}

const MAX_KB = parseInt(arg('max-kb') || '20', 10);
const MAX_SIZE = parseInt(arg('max-size') || '800', 10);
const TARGET_BYTES = MAX_KB * 1024;
const SRC_DIR = arg('src') || path.join(ROOT, 'src', 'assets', 'word-images-webp');
const CONCURRENCY = parseInt(arg('concurrency') || '4', 10);
const DRY_RUN = flag('dry-run');

if (!fs.existsSync(SRC_DIR)) {
  console.error(`✗ 目录不存在：${SRC_DIR}`);
  process.exit(1);
}

const all = fs
  .readdirSync(SRC_DIR)
  .filter(n => n.toLowerCase().endsWith('.webp'))
  .map(n => {
    const fp = path.join(SRC_DIR, n);
    return { name: n, path: fp, size: fs.statSync(fp).size };
  });

const targets = all.filter(f => f.size > TARGET_BYTES);
console.log(`目录: ${SRC_DIR}`);
console.log(`总数: ${all.length} | >${MAX_KB}KB: ${targets.length} | 总大小: ${(all.reduce((s,f)=>s+f.size,0)/1024/1024).toFixed(2)} MB`);
if (DRY_RUN) console.log('(dry-run 模式：不写文件)');

const QUALITY_LADDER = [78, 73, 68, 63, 58, 53, 48, 43, 38, 33, 28];
const SIZE_LADDER = [MAX_SIZE, Math.round(MAX_SIZE / 1.2), Math.round(MAX_SIZE / 1.5)];

/** Windows 上 sharp + antivirus 偶发 UNKNOWN error：写到临时目录，最后批量复制回去 */
function safeWrite(target, buf) {
  const tmpDir = path.join(path.dirname(target), '.shrunk-tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  const tmp = path.join(tmpDir, path.basename(target) + '.' + process.pid + '.tmp');
  fs.writeFileSync(tmp, buf);
  // 替换延迟到批处理结束后统一做
  pendingReplacements.push([tmp, target]);
}

const pendingReplacements = [];

/** 单图处理：尝试 (size, quality) 组合，直到结果 ≤ TARGET_BYTES 或用尽 */
async function shrinkOne(file) {
  const base = path.basename(file.path, path.extname(file.path));
  let bestBuf = null;
  let bestSize = Infinity;
  let bestCombo = { width: MAX_SIZE, quality: 28 };
  let tried = 0;
  for (const w of SIZE_LADDER) {
    for (const q of QUALITY_LADDER) {
      tried++;
      try {
        const buf = await sharp(file.path, { failOn: 'none' })
          .rotate()
          .resize({ width: w, height: w, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: q, effort: 6 })
          .toBuffer();
        if (buf.length <= TARGET_BYTES) {
          if (!DRY_RUN) safeWrite(file.path, buf);
          return {
            status: 'ok',
            name: file.name,
            origSize: file.size,
            newSize: buf.length,
            width: w,
            quality: q,
            tries: tried,
          };
        }
        if (buf.length < bestSize) {
          bestSize = buf.length;
          bestBuf = buf;
          bestCombo = { width: w, quality: q };
        }
      } catch (e) {
        // 继续下个组合
      }
    }
  }
  // 走到这里说明没命中 ≤ TARGET_BYTES，用最小的一版兜底写回（仍可能 >20KB，但比原图小）
  if (bestBuf) {
    if (!DRY_RUN) safeWrite(file.path, bestBuf);
    return {
      status: 'best',
      name: file.name,
      origSize: file.size,
      newSize: bestSize,
      width: bestCombo.width,
      quality: bestCombo.quality,
      tries: tried,
    };
  }
  return { status: 'fail', name: file.name, origSize: file.size, tries: tried };
}

async function runBatch(tasks) {
  const results = new Array(tasks.length);
  for (let i = 0; i < tasks.length; i++) {
    results[i] = await shrinkOne(tasks[i]);
    const r = results[i];
    const idx = i + 1;
    if (r.status === 'ok') {
      console.log(`  [${idx}/${tasks.length}] ✓ ${r.name} ${(r.origSize/1024).toFixed(1)}KB → ${(r.newSize/1024).toFixed(1)}KB (q=${r.quality} w=${r.width} ${r.tries}轮)`);
    } else if (r.status === 'best') {
      console.log(`  [${idx}/${tasks.length}] ◉ ${r.name} ${(r.origSize/1024).toFixed(1)}KB → ${(r.newSize/1024).toFixed(1)}KB (最小可用 q=${r.quality} w=${r.width} ${r.tries}轮)`);
    } else {
      console.log(`  [${idx}/${tasks.length}] ✗ ${r.name} (${r.tries}轮全失败)`);
    }
  }
  return results;
}

const t0 = Date.now();
const results = await runBatch(targets);

// 批处理结束后再统一替换原文件（避开 sharp 仍持有源文件句柄导致的 write 冲突）
let replaced = 0;
for (const [tmp, target] of pendingReplacements) {
  try {
    fs.copyFileSync(tmp, target);
    fs.unlinkSync(tmp);
    replaced++;
  } catch (e) {
    console.error(`  ✗ 替换失败 ${path.basename(target)}: ${e.message}`);
  }
}
// 清理临时目录
try {
  const tmpDir = path.join(SRC_DIR, '.shrunk-tmp');
  if (fs.existsSync(tmpDir)) {
    const remain = fs.readdirSync(tmpDir).filter(f => f.endsWith('.tmp'));
    if (remain.length === 0) fs.rmdirSync(tmpDir);
  }
} catch {}
console.log(`已替换 ${replaced} 个文件到原位`);
const stats = { ok: 0, best: 0, fail: 0, srcTotal: 0, outTotal: 0 };
for (const r of results) {
  if (r.status === 'ok') { stats.ok++; stats.srcTotal += r.origSize; stats.outTotal += r.newSize; }
  else if (r.status === 'best') { stats.best++; stats.srcTotal += r.origSize; stats.outTotal += r.newSize; }
  else { stats.fail++; }
}
const secs = ((Date.now() - t0) / 1000).toFixed(1);
const savedKB = ((stats.srcTotal - stats.outTotal) / 1024).toFixed(1);
const pct = stats.srcTotal > 0 ? (((stats.srcTotal - stats.outTotal) / stats.srcTotal) * 100).toFixed(1) : '0';
console.log(`\n完成：${stats.ok} 成功达标 + ${stats.best} 用最小版兜底 + ${stats.fail} 失败，耗时 ${secs}s`);
console.log(`总节省：${savedKB} KB（${pct}%）`);
if (stats.best > 0) {
  console.log(`提示：${stats.best} 张在 quality=28 + 最大降采样仍 >${MAX_KB}KB（可能是复杂细节图，已尽量压）`);
}