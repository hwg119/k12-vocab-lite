#!/usr/bin/env node
/**
 * 批量下载 Wikimedia 图片作为单词配图底库
 *
 * 数据源：
 *   - 首选：en.wiktionary.org /w/api.php?prop=pageimages （社区已选过的「最佳词义图」）
 *   - 回退：prop=images 列表里过滤（去掉 Wikipedia/Wiktionary logo、音频、图标等）
 *
 * 用法：
 *   node scripts/download-wiki-images.mjs [--stage senior|junior|primary] [--words apple,...] [--limit N] [--out DIR] [--proxy URL] [--curl-path PATH]
 *
 * 环境变量：
 *   HTTPS_PROXY  代理地址（国内下载 Wikimedia 必备），例如 http://127.0.0.1:7890
 *
 * 实现说明：
 *   - 用系统 curl.exe 处理 HTTPS+代理，避免 Node 内置 http/https 与 HTTP 代理兼容问题
 *   - 跨平台：如果指定 --curl-path 则优先使用，否则自动从 PATH 查找 curl
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const USER_AGENT = 'k12-vocab-lite/1.6 (image-builder; mailto:dev@example.local)';
const THUMB_SIZE = 800;
const CONCURRENCY = 4;
const RETRY = 2;

/** 命令行参数 */
function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const stage = arg('stage') || 'senior';
const wordsArg = arg('words');
const limit = parseInt(arg('limit') || '0', 10);
const outDir = arg('out') || path.join(ROOT, 'src', 'assets', 'word-images');
const proxy = arg('proxy') || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const curlPath = arg('curl-path') || (process.platform === 'win32' ? 'curl.exe' : 'curl');

const STAGE_FILE = { senior: 'senior.ts', junior: 'junior.ts', primary: 'primary.ts' }[stage];
if (!STAGE_FILE) {
  console.error(`✗ 未知学段：${stage}（可选 senior/junior/primary）`);
  process.exit(1);
}

/** 与 src/utils/wordImage.ts 保持一致的图片文件名 */
function imageFileKey(english) {
  return (
    english
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'word'
  );
}

/** 虚词过滤 */
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

/** 解析词库 .ts 文件为单词对象数组 */
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

/** 已知应当排除的图片关键词 */
const BAD_KEYWORDS = [
  'wikipedia-logo', 'wiktionary', 'wikimedia', 'wikidata',
  'padlock', 'lock-', 'crystal',
  '.ogg', '.wav', '.mp3', '.webm',
];

function isUsableImageTitle(title) {
  const lower = title.toLowerCase();
  if (!/\.(jpg|jpeg|png|svg)$/i.test(lower)) return false;
  if (BAD_KEYWORDS.some(k => lower.includes(k))) return false;
  return true;
}

/** 用 curl 跑一次 HTTP GET；返回 { status, body } */
function curlGet(url, accept = 'application/json') {
  const args = [
    '-sS',
    '-L',
    '--connect-timeout', '15',
    '--max-time', '30',
    '-H', `User-Agent: ${USER_AGENT}`,
    '-H', `Accept: ${accept}`,
    '-w', '\n__HTTP_STATUS__%{http_code}',
  ];
  if (proxy) args.push('--proxy', proxy);
  args.push(url);
  const res = spawnSync(curlPath, args, { encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 });
  if (res.error) return { status: 0, body: '', error: res.error.message };
  // spawnSync 的 res.status 是子进程退出码：0 = 成功，非 0 = 异常退出
  if (res.status !== 0) {
    return { status: 0, body: '', error: (res.stderr?.toString() || `curl exit ${res.status}`).trim() };
  }
  const out = res.stdout?.toString() || '';
  const m = out.match(/__HTTP_STATUS__(\d+)\s*$/);
  if (!m) return { status: 0, body: out, error: 'no status marker, tail=' + JSON.stringify(out.slice(-80)) };
  const status = parseInt(m[1], 10);
  const body = out.slice(0, m.index);
  return { status, body };
}

/** 用 curl 下载图片到本地文件；返回 boolean */
function curlDownload(url, destPath) {
  const tmp = destPath + '.part';
  const args = [
    '-sS',
    '-L',
    '--connect-timeout', '15',
    '--max-time', '60',
    '-H', `User-Agent: ${USER_AGENT}`,
    '-H', 'Accept: image/avif,image/webp,image/png,image/jpeg,image/svg+xml,image/*,*/*;q=0.8',
    '-o', tmp,
    '-w', '__HTTP_STATUS__%{http_code}\n__SIZE__%{size_download}\n__TYPE__%{content_type}',
  ];
  if (proxy) args.push('--proxy', proxy);
  args.push(url);
  const res = spawnSync(curlPath, args, { encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 });
  if (res.error || res.status !== 0) {
    try { fs.unlinkSync(tmp); } catch {}
    return { ok: false, reason: res.error?.message || `curl exit ${res.status}` };
  }
  const stdout = res.stdout?.toString() || '';
  // Windows curl 输出用 \r\n；用 \r?\n 兼容
  const m = stdout.match(/__HTTP_STATUS__(\d+)\r?\n__SIZE__(\d+)\r?\n__TYPE__([^\r\n]*)/);
  const status = m ? parseInt(m[1], 10) : 0;
  const size = m ? parseInt(m[2], 10) : 0;
  const ctype = m ? m[3].trim().toLowerCase() : '';
  if (status < 200 || status >= 300) {
    try { fs.unlinkSync(tmp); } catch {}
    return { ok: false, reason: `HTTP ${status}` };
  }
  if (size < 500) {
    try { fs.unlinkSync(tmp); } catch {}
    return { ok: false, reason: `too small: ${size}b` };
  }
  // 决定扩展名：优先信 content-type，否则前 8 字节
  let ext = null;
  if (ctype.includes('image/svg+xml')) ext = 'svg';
  else if (ctype.includes('image/png')) ext = 'png';
  else if (ctype.includes('image/jpeg')) ext = 'jpg';
  else if (ctype.includes('image/webp')) ext = 'webp';
  if (!ext) {
    // 二进制头校验
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
    if (isJpeg) ext = 'jpg';
    else if (isPng) ext = 'png';
    // 也可能是 SVG（<svg 或 <?xml）
    else if (buf.toString('utf8', 0, 5).includes('<?xml') || buf.toString('utf8', 0, 4).includes('<svg')) {
      ext = 'svg';
    }
  }
  if (!ext) {
    try { fs.unlinkSync(tmp); } catch {}
    return { ok: false, reason: 'unknown image type' };
  }
  // 把临时文件落盘为最终扩展名
  const finalPath = destPath.replace(/\.[a-z]+$/i, `.${ext}`);
  fs.renameSync(tmp, finalPath);
  return { ok: true, size, ext, finalPath };
}

/** 抓取某词的最佳图 URL；返回 { url } 或 null */
function fetchBestImageUrl(english) {
  const title = encodeURIComponent(english.toLowerCase());
  // 1) 首选：pageimages
  const piUrl =
    `https://en.wiktionary.org/w/api.php?action=query&format=json` +
    `&prop=pageimages&piprop=thumbnail|original` +
    `&pithumbsize=${THUMB_SIZE}&redirects=1&titles=${title}`;
  const piRes = curlGet(piUrl);
  if (piRes.status === 200 && piRes.body) {
    try {
      const pi = JSON.parse(piRes.body);
      const pages = pi?.query?.pages;
      if (pages) {
        for (const id of Object.keys(pages)) {
          const page = pages[id];
          if (page.thumbnail?.source) return { url: page.thumbnail.source };
          if (page.original?.source) return { url: page.original.source };
        }
      }
    } catch {}
  }
  // 2) 回退：images 列表
  const imgUrl =
    `https://en.wiktionary.org/w/api.php?action=query&format=json` +
    `&prop=images&imlimit=20&redirects=1&titles=${title}`;
  const imgRes = curlGet(imgUrl);
  if (imgRes.status !== 200 || !imgRes.body) return null;
  let img;
  try { img = JSON.parse(imgRes.body); } catch { return null; }
  const pages2 = img?.query?.pages;
  if (!pages2) return null;
  for (const id of Object.keys(pages2)) {
    const arr = pages2[id].images || [];
    const usable = arr.map(x => x.title).filter(isUsableImageTitle);
    if (usable.length === 0) continue;
    const iiUrl =
      `https://en.wiktionary.org/w/api.php?action=query&format=json` +
      `&prop=imageinfo&iiprop=url&iiurlwidth=${THUMB_SIZE}` +
      `&titles=${encodeURIComponent(usable[0])}`;
    const iiRes = curlGet(iiUrl);
    if (iiRes.status !== 200 || !iiRes.body) continue;
    let ii;
    try { ii = JSON.parse(iiRes.body); } catch { continue; }
    const iiPages = ii?.query?.pages;
    if (!iiPages) continue;
    for (const pid of Object.keys(iiPages)) {
      const info = iiPages[pid]?.imageinfo?.[0];
      if (info) return { url: info.thumburl || info.url };
    }
  }
  return null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** 处理单个词：探查 → 下载 → 落盘 */
async function processOne(word) {
  const en = word.english;
  const key = imageFileKey(en);
  // 已存在任一支持格式 → 跳过
  const exts = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
  for (const e of exts) {
    if (fs.existsSync(path.join(outDir, key + e))) return { status: 'skip' };
  }
  const dest = path.join(outDir, `${key}.png`);
  let info;
  try {
    info = fetchBestImageUrl(en);
  } catch (e) {
    return { status: 'fail', reason: `lookup: ${e.message || e}` };
  }
  if (!info) return { status: 'miss', reason: 'no image in wiktionary' };

  for (let attempt = 1; attempt <= RETRY + 1; attempt++) {
    const r = curlDownload(info.url, dest);
    if (r.ok) return { status: 'ok', url: info.url, size: r.size, ext: r.ext };
    if (attempt > RETRY) return { status: 'fail', reason: r.reason };
    await sleep(1500 * attempt);
  }
  return { status: 'fail', reason: 'unknown' };
}

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
      const tag = r.status === 'ok' ? '✓' : r.status === 'skip' ? '·' : r.status === 'miss' ? '○' : '✗';
      const sizeStr = r.size ? ` (${(r.size / 1024).toFixed(0)}KB)` : '';
      console.log(`  [${i}/${tasks.length}] ${tag} ${w.english}${sizeStr}${r.reason ? ' (' + r.reason + ')' : ''}`);
    }
  };
  const runners = [];
  for (let k = 0; k < Math.min(CONCURRENCY, tasks.length); k++) {
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

  console.log(`词库: ${stage} | 待尝试: ${words.length} | 输出: ${outDir}`);
  if (proxy) console.log(`代理: ${proxy}`);

  if (words.length === 0) {
    console.log('没有需要尝试的单词。');
    return;
  }

  const t0 = Date.now();
  const results = await runBatch(words);
  const counts = { ok: 0, skip: 0, miss: 0, fail: 0 };
  for (const r of results) counts[r.status]++;
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\n完成：成功 ${counts.ok}，跳过 ${counts.skip}，无图 ${counts.miss}，失败 ${counts.fail}，耗时 ${secs}s`);
  if (counts.miss > 0 || counts.fail > 0) {
    console.log('失败的词可直接重新运行本脚本续跑（已下载的会自动跳过）。');
  }
  // 输出无图/失败的清单
  const noImage = [];
  for (let i = 0; i < words.length; i++) {
    const r = results[i];
    if (r && (r.status === 'miss' || r.status === 'fail')) noImage.push(words[i].english);
  }
  if (noImage.length) {
    const listPath = path.join(outDir, '..', `_no-image-${stage}.txt`);
    fs.writeFileSync(listPath, noImage.join('\n'), 'utf8');
    console.log(`\n无图/失败清单已写入：${listPath}（共 ${noImage.length} 个词，可作为 AI 补图的输入）`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});