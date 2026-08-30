#!/usr/bin/env node
/**
 * 把 src/assets/word-images/*.png 批量压缩成 .webp
 *
 * 用法：
 *   node scripts/compress-images-to-webp.mjs [--quality 78] [--max-size 800] [--out DIR]
 *
 * 默认参数：
 *   --quality  78   (sharp webp 0-100，越大越接近原图；78 是经验值，肉眼几乎无差)
 *   --max-size 800  (长边像素上限；超过则等比缩放后再压缩，进一步省体积)
 *   --out      src/assets/word-images-webp/
 *
 * 设计：
 *   - 原 PNG 文件不动
 *   - 输出文件名 = 原 .png → .webp（同名同 stem）
 *   - 并发 4
 *   - 跳过已是 .webp/.jpg/.jpeg 命名的源（理论上目录里没有，但防御性写一下）
 *   - 完成后打印：总节省、压缩率、失败列表
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

const QUALITY = parseInt(arg('quality') || '78', 10);
const MAX_SIZE = parseInt(arg('max-size') || '800', 10);
const SRC_DIR = arg('src') || path.join(ROOT, 'src', 'assets', 'word-images');
const OUT_DIR = arg('out') || path.join(ROOT, 'src', 'assets', 'word-images-webp');
const CONCURRENCY = parseInt(arg('concurrency') || '4', 10);
const FORCE = process.argv.includes('--force');

if (!fs.existsSync(SRC_DIR)) {
  console.error(`✗ 源目录不存在：${SRC_DIR}`);
  process.exit(1);
}
fs.mkdirSync(OUT_DIR, { recursive: true });

const allFiles = fs
  .readdirSync(SRC_DIR)
  .filter(n => n.toLowerCase().endsWith('.png'))
  .map(n => path.join(SRC_DIR, n));

console.log(`源: ${SRC_DIR}`);
console.log(`输出: ${OUT_DIR}`);
console.log(`参数: quality=${QUALITY} max-size=${MAX_SIZE} concurrency=${CONCURRENCY}`);
console.log(`待处理 PNG: ${allFiles.length}`);

if (allFiles.length === 0) {
  console.log('没有可压缩的文件。');
  process.exit(0);
}

/** 压缩单张 */
async function compressOne(pngPath) {
  const base = path.basename(pngPath, path.extname(pngPath));
  const out = path.join(OUT_DIR, `${base}.webp`);
  if (!FORCE && fs.existsSync(out)) {
    return { status: 'skip', src: pngPath, out, srcSize: 0, outSize: 0 };
  }
  const srcSize = fs.statSync(pngPath).size;
  try {
    const pipe = sharp(pngPath, { failOn: 'none' })
      .rotate() // 修正 EXIF 方向
      .resize({
        width: MAX_SIZE,
        height: MAX_SIZE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY, effort: 4 });
    const buf = await pipe.toBuffer();
    fs.writeFileSync(out, buf);
    return { status: 'ok', src: pngPath, out, srcSize, outSize: buf.length };
  } catch (e) {
    return { status: 'fail', src: pngPath, out, srcSize, error: e.message || String(e) };
  }
}

/** 并发执行 */
async function runBatch(tasks) {
  const results = new Array(tasks.length);
  const queue = [...tasks.keys()];
  let done = 0;
  const worker = async () => {
    while (queue.length) {
      const i = queue.shift();
      if (i === undefined) break;
      results[i] = await compressOne(tasks[i]);
      done++;
      const r = results[i];
      const tag = r.status === 'ok' ? '✓' : r.status === 'skip' ? '·' : '✗';
      const sizeStr =
        r.status === 'ok' || r.status === 'skip'
          ? ` (${(r.srcSize / 1024).toFixed(0)}KB → ${(r.outSize / 1024).toFixed(0)}KB)`
          : r.status === 'fail'
            ? ` ${r.error}`
            : '';
      console.log(`  [${done}/${tasks.length}] ${tag} ${path.basename(r.src)}${sizeStr}`);
    }
  };
  const runners = [];
  for (let k = 0; k < Math.min(CONCURRENCY, tasks.length); k++) {
    runners.push(worker());
  }
  await Promise.all(runners);
  return results;
}

const t0 = Date.now();
const results = await runBatch(allFiles);
const stats = { ok: 0, skip: 0, fail: 0, srcTotal: 0, outTotal: 0 };
for (const r of results) {
  if (r.status === 'ok') {
    stats.ok++;
    stats.srcTotal += r.srcSize;
    stats.outTotal += r.outSize;
  } else if (r.status === 'skip') {
    stats.skip++;
  } else if (r.status === 'fail') {
    stats.fail++;
    stats.srcTotal += r.srcSize;
  }
}
const secs = ((Date.now() - t0) / 1000).toFixed(1);
const savedMB = ((stats.srcTotal - stats.outTotal) / 1024 / 1024).toFixed(2);
const pct =
  stats.srcTotal > 0 ? (((stats.srcTotal - stats.outTotal) / stats.srcTotal) * 100).toFixed(1) : '0';
console.log(
  `\n完成：成功 ${stats.ok}，跳过 ${stats.skip}，失败 ${stats.fail}，耗时 ${secs}s\n` +
    `总节省：${savedMB} MB（${pct}%）`,
);
if (stats.fail > 0) {
  console.log('失败列表：');
  for (const r of results) {
    if (r.status === 'fail') console.log(`  - ${path.basename(r.src)}: ${r.error}`);
  }
}