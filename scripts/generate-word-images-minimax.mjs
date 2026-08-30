#!/usr/bin/env node
/**
 * generate-word-images-minimax.mjs
 *
 * MiniMax image-01 API 批量生成单词配图（同步接口，一次调用直接出图）
 *
 * 用法：
 *   node scripts/generate-word-images-minimax.mjs [--stage senior|junior|primary] [--words apple,...] [--limit N] [--out DIR] [--key API_KEY] [--concurrency N]
 *
 * 环境变量：MINIMAX_API_KEY（或 --key 显式传入）
 *
 * 与 generate-word-images.mjs（阿里云 DashScope 版）接口一致，输出图片文件名也一致（wordImageFileKey），可互相替代。
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const API_BASE = 'https://api.minimaxi.com/v1/image_generation';
const USER_AGENT = 'k12-vocab-lite/1.6 (image-builder; mailto:dev@example.local)';
const ASPECT_RATIO = '1:1';
const CONCURRENCY = 4;
const RETRY = 2;
const STYLE =
  '扁平卡通插画风格，白色纯色背景，构图居中，简洁清晰，色彩明快，适合儿童英语单词卡片，画面中不要出现任何文字';

function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const stage = arg('stage') || 'senior';
const wordsArg = arg('words');
const limit = parseInt(arg('limit') || '0', 10);
const outDir = arg('out') || path.join(ROOT, 'src', 'assets', 'word-images');
const key = arg('key') || process.env.MINIMAX_API_KEY || '';
const concurrency = parseInt(arg('concurrency') || String(CONCURRENCY), 10);

const STAGE_FILE = { senior: 'senior.ts', junior: 'junior.ts', primary: 'primary.ts' }[stage];
if (!STAGE_FILE) {
  console.error(`✗ 未知学段：${stage}（可选 senior/junior/primary）`);
  process.exit(1);
}

if (!key) {
  console.error('✗ 未设置 MINIMAX_API_KEY。请设置环境变量或通过 --key 传入。');
  process.exit(1);
}

/** 与 src/utils/wordImage.ts 一致 */
function imageFileKey(english) {
  return (
    english
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'word'
  );
}

/** 虚词白名单（与 wordImage.ts 的 isPicturable 保持一致） */
const NON_PICTURABLE = new Set([
  'a', 'an', 'the',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
  'this', 'that', 'these', 'those', 'who', 'whom', 'whose', 'which', 'what',
  'some', 'any', 'no', 'each', 'every', 'both', 'all', 'few', 'many', 'much', 'several',
  'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'at',
  'before', 'behind', 'below', 'beneath', 'beside', 'besides', 'between', 'beyond',
  'but', 'by', 'down', 'during', 'except', 'for', 'from', 'in', 'inside', 'into', 'near',
  'of', 'off', 'on', 'onto', 'opposite', 'out', 'outside', 'over', 'past', 'per', 'round',
  'since', 'through', 'throughout', 'till', 'to', 'toward', 'towards', 'under',
  'underneath', 'until', 'unto', 'up', 'upon', 'with', 'within', 'without',
  'and', 'or', 'nor', 'so', 'yet', 'while', 'when', 'where', 'why', 'how', 'if',
  'because', 'although', 'though', 'even', 'unless', 'than', 'that', 'whether', 'as',
  'be', 'am', 'is', 'are', 'was', 'were', 'been', 'being', 'do', 'does', 'did', 'done',
  'have', 'has', 'had', 'will', 'would', 'shall', 'should', 'can', 'could', 'may',
  'might', 'must', 'need', 'ought', 'dare', 'there', 'here', 'then', 'than', 'not',
]);

function isPicturable(word) {
  const en = word.english.toLowerCase().trim();
  if (NON_PICTURABLE.has(en)) return false;
  const c = (word.chinese || '').trim();
  if (/^(art\.|prep\.|conj\.|pron\.|aux\.|interj\.|num\.)\b/.test(c)) return false;
  return true;
}

function loadWords(stageName) {
  const file = path.join(ROOT, 'src', 'data', STAGE_FILE);
  if (!fs.existsSync(file)) {
    console.error(`✗ 未找到词库文件：${file}`);
    process.exit(1);
  }
  const src = fs.readFileSync(file, 'utf8');
  const words = [];
  for (const line of src.split('\n')) {
    const m = line.match(
      /{\s*id: '([^']+)',\s*english: '([^']+)',[\s\S]*?chinese: '([^']*)'[\s\S]*?difficulty: (\d+)/,
    );
    if (m) words.push({ id: m[1], english: m[2], chinese: m[3], difficulty: +m[4] });
  }
  return words;
}

/** 用 curl 调 MiniMax image_generation（POST + JSON）
 *  写临时 body 文件 + --data-binary @file，规避 Node spawnSync 不接受 buffer 输入的限制
 */
function minimaxCall(prompt) {
  const body = JSON.stringify({
    model: 'image-01',
    prompt,
    aspect_ratio: ASPECT_RATIO,
    n: 1,
    response_format: 'url', // 返回 URL，避免 base64 写盘膨胀
    prompt_optimizer: false,
  });
  // 强制绝对路径 + 用 OS 原生路径分隔符（Windows 上 path.join 输出反斜杠）
  const tmpFile = path.resolve(outDir, `_req-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.tmp`);
  try {
    fs.writeFileSync(tmpFile, body, 'utf8');
    const args = [
      '-sS', '-L',
      '--connect-timeout', '15',
      '--max-time', '120',
      '-X', 'POST',
      API_BASE,
      '-H', 'Content-Type: application/json',
      '-H', `Authorization: Bearer ${key}`,
      '-H', `User-Agent: ${USER_AGENT}`,
      '--data-binary', `@${tmpFile}`,
      '-w', '\n__HTTP_STATUS__%{http_code}',
    ];
    const res = spawnSync('curl.exe', args, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    if (res.error) return { status: 0, body: '', error: res.error.message };
    if (res.status !== 0) {
      return { status: 0, body: '', error: (res.stderr || `curl exit ${res.status}`).trim() };
    }
    const out = res.stdout || '';
    const m = out.match(/__HTTP_STATUS__(\d+)\s*$/);
    if (!m) return { status: 0, body: out, error: 'no status marker' };
    return { status: parseInt(m[1], 10), body: out.slice(0, m.index) };
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

/** 从响应里抽出图片 URL
 *  MiniMax image_generation 响应结构（常见几种）：
 *  - { data: { image_urls: [url1, url2] } }    // success
 *  - { data: { image_base64: [...] } }        // response_format=base64
 *  - { base_resp: { status_code: 0, ... }, data: { image_urls: [...] } }
 *  - 直接顶层 image_urls
 */
function extractImageUrl(jsonBody) {
  try {
    const j = JSON.parse(jsonBody);
    // 先看 base_resp 是否有错
    if (j?.base_resp?.status_code && j.base_resp.status_code !== 0) {
      return null;
    }
    const candidates = [
      j?.data?.image_urls,
      j?.image_urls,
      j?.data?.images,
      j?.images,
    ];
    for (const c of candidates) {
      if (Array.isArray(c) && c.length > 0) {
        const v = c[0];
        if (typeof v === 'string' && /^https?:\/\//.test(v)) return v;
        if (v && typeof v === 'object' && typeof v.url === 'string') return v.url;
      }
    }
  } catch {}
  return null;
}

/** 下载图片到本地（复用 wiki 脚本的 curlDownload 思路） */
function curlDownload(url, destPath) {
  const tmp = destPath + '.part';
  const args = [
    '-sS', '-L',
    '--connect-timeout', '15',
    '--max-time', '60',
    '-A', USER_AGENT,
    '-H', 'Accept: image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8',
    '-o', tmp,
    '-w', '__HTTP_STATUS__%{http_code}\r\n__SIZE__%{size_download}',
  ];
  const res = spawnSync('curl.exe', args, { encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 });
  if (res.error || res.status !== 0) {
    try { fs.unlinkSync(tmp); } catch {}
    return { ok: false, reason: res.error?.message || `curl exit ${res.status}` };
  }
  const stdout = res.stdout?.toString() || '';
  const m = stdout.match(/__HTTP_STATUS__(\d+)\r?\n__SIZE__(\d+)/);
  const status = m ? parseInt(m[1], 10) : 0;
  const size = m ? parseInt(m[2], 10) : 0;
  if (status < 200 || status >= 300) {
    try { fs.unlinkSync(tmp); } catch {}
    return { ok: false, reason: `HTTP ${status}` };
  }
  if (size < 1500) {
    try { fs.unlinkSync(tmp); } catch {}
    return { ok: false, reason: `too small: ${size}b` };
  }
  const buf = Buffer.alloc(8);
  let fd;
  try {
    fd = fs.openSync(tmp, 'r');
    fs.readSync(fd, buf, 0, 8, 0);
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch {}
    return { ok: false, reason: `read fail: ${e.message || e}` };
  } finally {
    if (fd) try { fs.closeSync(fd); } catch {}
  }
  const head0 = buf[0], head1 = buf[1];
  const isJpeg = head0 === 0xff && head1 === 0xd8;
  const isPng = head0 === 0x89 && head1 === 0x50;
  if (!isJpeg && !isPng) {
    try { fs.unlinkSync(tmp); } catch {}
    return { ok: false, reason: 'not jpeg/png' };
  }
  fs.renameSync(tmp, destPath);
  return { ok: true, size };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** 处理单个词 */
async function processOne(word) {
  const en = word.english;
  const key = imageFileKey(en);
  const dest = path.join(outDir, `${key}.png`);
  if (fs.existsSync(dest)) return { status: 'skip' };

  const prompt = `一张英语单词卡片的插画，主题：${en}（${word.chinese || ''}）。${STYLE}`;

  let url;
  let lastErr = '';
  for (let attempt = 1; attempt <= RETRY + 1; attempt++) {
    const r = minimaxCall(prompt);
    if (r.status === 200 && r.body) {
      url = extractImageUrl(r.body);
      if (url) break;
      lastErr = `parse: ${r.body.slice(0, 300)}`;
    } else {
      lastErr = `HTTP ${r.status} ${r.error || ''} body=${(r.body || '').slice(0, 200)}`;
    }
    if (attempt <= RETRY) await sleep(1000 * attempt);
  }
  if (!url) return { status: 'fail', reason: lastErr };

  const dl = curlDownload(url, dest);
  if (!dl.ok) return { status: 'fail', reason: dl.reason };
  return { status: 'ok', size: dl.size };
}

// 调试钩子
const DEBUG_FIRST_ONLY = process.env.DEBUG_FIRST === '1';

/** 并发执行 */
async function runBatch(tasks) {
  const queue = [...tasks.keys()];
  let i = 0;
  const results = new Array(tasks.length);
  const worker = async () => {
    while (queue.length) {
      const idx = queue.shift();
      if (idx === undefined) break;
      const w = tasks[idx];
      const r = await processOne(w);
      results[idx] = r;
      i++;
      const tag = r.status === 'ok' ? '✓' : r.status === 'skip' ? '·' : '✗';
      const sizeStr = r.size ? ` (${(r.size / 1024).toFixed(0)}KB)` : '';
      console.log(`  [${i}/${tasks.length}] ${tag} ${w.english}${sizeStr}${r.reason ? ' (' + r.reason + ')' : ''}`);
    }
  };
  const runners = [];
  for (let k = 0; k < Math.min(concurrency, tasks.length); k++) {
    runners.push(worker());
  }
  await Promise.all(runners);
  return results;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  let words;
  if (wordsArg) {
    const wanted = wordsArg.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    words = loadWords(stage).filter(w => wanted.includes(w.english.toLowerCase()));
    const missing = wanted.filter(w => !words.some(x => x.english.toLowerCase() === w));
    if (missing.length) console.warn(`⚠ 词库中未找到：${missing.join(', ')}`);
  } else {
    words = loadWords(stage);
  }

  words = words.filter(isPicturable);
  if (limit > 0) words = words.slice(0, limit);

  console.log(`词库: ${stage} | 待生成: ${words.length} 张 | 输出: ${outDir}`);
  console.log(`模型: MiniMax image-01 | 比例: ${ASPECT_RATIO} | 并发: ${concurrency}`);

  if (words.length === 0) {
    console.log('没有需要生成的单词。');
    return;
  }

  const t0 = Date.now();
  const results = await runBatch(words);
  const counts = { ok: 0, skip: 0, fail: 0 };
  for (const r of results) counts[r.status]++;
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\n完成：成功 ${counts.ok}，跳过 ${counts.skip}，失败 ${counts.fail}，耗时 ${secs}s`);
  // 估算费用
  const cost = counts.ok * 0.025; // ¥0.025/张
  console.log(`估算费用：¥${cost.toFixed(2)}（按 ¥0.025/张 计）`);

  if (counts.fail > 0) {
    console.log('失败的词可直接重新运行本脚本续跑（已生成的会自动跳过）。');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});