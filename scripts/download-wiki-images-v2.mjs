#!/usr/bin/env node
/**
 * download-wiki-images-v2.mjs
 *
 * v2 优化版（相比 v1 提速 10~20 倍）：
 *   - 批量 API：50 词/请求（v1 是 1 词/请求）
 *   - 单次调用 pageimages + images：省掉 v1 的「无图词回退 images」那次 API
 *   - 跳过已知无图模式（数字/星期/颜色等 Wiktionary 几乎从不配图的词）
 *   - 并发 6 个 worker（每 worker 处理一个 50 词批次）
 *
 * 用法：
 *   node scripts/download-wiki-images-v2.mjs --stage senior --proxy http://127.0.0.1:7890 [--input _no-image-senior.txt]
 *   # 默认从 src/assets/_no-image-<stage>.txt 读取词列表
 *   # 不传 --stage 时跑全部 _no-image-*.txt
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const USER_AGENT = 'k12-vocab-lite/1.6 (image-builder; mailto:dev@example.local)';
const THUMB_SIZE = 800;
const BATCH_SIZE = 50;          // 每批查询多少词
const WORKER_COUNT = 6;         // 并发 worker 数（每个 worker 串行处理批次）
const REQUEST_TIMEOUT = 30;
const RETRY = 2;

function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const stage = arg('stage');
const input = arg('input');     // 自定义词文件
const outDir = arg('out') || path.join(ROOT, 'src', 'assets', 'word-images');
const proxy = arg('proxy') || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';

/** 已知的"Wiktionary 几乎从不配图"的词集 */
const KNOWN_NO_IMAGE_PATTERNS = [
  /^(zero|one|two|three|four|five|six|seven|eight|nine|ten)$/,
  /^(eleven|twelve|thirteen|fifteen|fifteen|twenty|thirty|fifty|hundred|thousand)$/,
  /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|twelfth)$/,
  /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/,
  /^(January|February|March|April|May|June|July|August|September|October|November|December)$/,
  /^(red|blue|green|yellow|black|white|orange|pink|purple|brown|grey|gray)$/,
];
function isKnownNoImage(word) {
  const w = word.toLowerCase();
  return KNOWN_NO_IMAGE_PATTERNS.some(re => re.test(w));
}

const BAD_KEYWORDS = [
  'wikipedia-logo', 'wiktionary', 'wikimedia', 'wikidata',
  'padlock', 'lock-', 'crystal',
  '.ogg', '.wav', '.mp3', '.webm',
];
function isUsableTitle(title) {
  const lower = title.toLowerCase();
  if (!/\.(jpg|jpeg|png|svg)$/i.test(lower)) return false;
  if (BAD_KEYWORDS.some(k => lower.includes(k))) return false;
  return true;
}

function imageFileKey(en) {
  return en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'word';
}

/** 用 curl 跑一次 HTTP GET；返回 { status, body } */
function curlGet(url, accept = 'application/json') {
  const args = [
    '-sS', '-L',
    '--connect-timeout', '15',
    '--max-time', String(REQUEST_TIMEOUT),
    '-A', USER_AGENT,
    '-H', `Accept: ${accept}`,
    '-w', '\n__HTTP_STATUS__%{http_code}',
  ];
  if (proxy) args.push('--proxy', proxy);
  args.push(url);
  const res = spawnSync('curl.exe', args, { encoding: 'buffer', maxBuffer: 50 * 1024 * 1024 });
  if (res.error) return { status: 0, body: '', error: res.error.message };
  if (res.status !== 0) {
    return { status: 0, body: '', error: (res.stderr?.toString() || `curl exit ${res.status}`).trim() };
  }
  const out = res.stdout?.toString() || '';
  const m = out.match(/__HTTP_STATUS__(\d+)\s*$/);
  if (!m) return { status: 0, body: out, error: 'no status marker' };
  return { status: parseInt(m[1], 10), body: out.slice(0, m.index) };
}

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
  if (proxy) args.push('--proxy', proxy);
  args.push(url);
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
  if (size < 1500) {  // 1.5 KB 阈值：颜色方块/小图标 ~280b，正常图至少几 KB
    try { fs.unlinkSync(tmp); } catch {}
    return { ok: false, reason: `too small: ${size}b` };
  }
  // 校验头
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

/**
 * 一次批量查询最多 50 个词的 pageimages + images 列表
 * 返回 Map<wordLower, { thumbUrl?: string, imagesTitles?: string[] }>
 */
function batchLookup(words) {
  const titles = words.map(w => encodeURIComponent(w.toLowerCase())).join('|');
  // 单次 API 同时拿 pageimages 和 images 列表，省一次 API
  const url =
    `https://en.wiktionary.org/w/api.php?action=query&format=json` +
    `&prop=pageimages|images` +
    `&piprop=thumbnail&pithumbsize=${THUMB_SIZE}` +
    `&imlimit=20` +
    `&redirects=1` +
    `&titles=${titles}`;
  const r = curlGet(url);
  if (r.status !== 200) {
    return { error: `HTTP ${r.status} ${r.error || ''}`, data: new Map() };
  }
  let j;
  try { j = JSON.parse(r.body); } catch (e) {
    return { error: 'parse fail', data: new Map() };
  }
  // 处理 redirects（pageimages API 会跟着 redirect）
  const redirects = j.query?.redirects || [];
  const redirectMap = new Map();
  for (const r of redirects) redirectMap.set(r.to, r.from);

  const result = new Map();
  const pages = j.query?.pages || {};
  // pages 是 dict：pageid -> page
  // 每个 page 有 title、thumbnail、images（数组）等
  for (const id of Object.keys(pages)) {
    const p = pages[id];
    // 如果有 missing，跳过
    if (p.missing !== undefined) continue;
    const title = p.title;
    // 通过 redirects 反查：原词
    const fromRedirect = redirectMap.get(title) || title;
    const info = {};
    if (p.thumbnail?.source) info.thumbUrl = p.thumbnail.source;
    if (Array.isArray(p.images)) {
      info.imagesTitles = p.images.map(x => x.title).filter(isUsableTitle);
    }
    result.set(fromRedirect.toLowerCase(), info);
  }
  return { data: result };
}

/**
 * 处理一个词：优先 thumb，否则从 images 列表拿 imageinfo
 * 因为 imageinfo 又得 1 次 API，所以只在 thumb 不存在时才走这个分支
 */
async function resolveWord(word, info) {
  if (info.thumbUrl) {
    return info.thumbUrl;
  }
  if (info.imagesTitles && info.imagesTitles.length > 0) {
    const u =
      `https://en.wiktionary.org/w/api.php?action=query&format=json` +
      `&prop=imageinfo&iiprop=url&iiurlwidth=${THUMB_SIZE}` +
      `&titles=${encodeURIComponent(info.imagesTitles[0])}`;
    const r = curlGet(u);
    if (r.status === 200 && r.body) {
      try {
        const j = JSON.parse(r.body);
        for (const id of Object.keys(j.query?.pages || {})) {
          const ii = j.query.pages[id]?.imageinfo?.[0];
          if (ii) return ii.thumburl || ii.url;
        }
      } catch {}
    }
  }
  return null;
}

async function processWord(word, info) {
  const key = imageFileKey(word);
  const dest = path.join(outDir, `${key}.png`);
  if (fs.existsSync(dest)) return { status: 'skip' };
  const url = await resolveWord(word, info);
  if (!url) return { status: 'miss' };
  for (let attempt = 1; attempt <= RETRY + 1; attempt++) {
    const r = curlDownload(url, dest);
    if (r.ok) return { status: 'ok', size: r.size };
    if (attempt > RETRY) return { status: 'fail', reason: r.reason };
    await sleep(500 * attempt);
  }
  return { status: 'fail' };
}

/** worker: 串行处理一批词 */
async function worker(workerId, queue, results) {
  while (queue.length) {
    const batch = queue.shift();
    if (!batch) break;
    const t0 = Date.now();
    // 1) 一次 API 查全部
    const { error, data: lookup } = batchLookup(batch.words);
    if (error) {
      // 整批失败，把每个词标 fail
      for (const w of batch.words) {
        results.set(w, { status: 'fail', reason: error });
      }
      console.log(`  [w${workerId}] batch fail: ${error}`);
      continue;
    }
    // 2) 处理每个词
    for (const w of batch.words) {
      // 已知无图模式直接跳过 API
      if (isKnownNoImage(w)) {
        results.set(w, { status: 'skip-known' });
        continue;
      }
      const info = lookup.get(w.toLowerCase()) || {};
      const r = await processWord(w, info);
      results.set(w, r);
    }
    const ms = Date.now() - t0;
    let ok = 0, skip = 0, miss = 0, fail = 0;
    for (const w of batch.words) {
      const r = results.get(w);
      if (!r) continue;
      if (r.status === 'ok') ok++;
      else if (r.status === 'skip' || r.status === 'skip-known') skip++;
      else if (r.status === 'miss') miss++;
      else fail++;
    }
    console.log(`  [w${workerId}] batch ${batch.idx} done in ${ms}ms: ok=${ok} skip=${skip} miss=${miss} fail=${fail}`);
  }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  let words;
  if (input) {
    const file = path.isAbsolute(input) ? input : path.join(ROOT, input);
    words = fs.readFileSync(file, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    console.log(`从 ${file} 加载 ${words.length} 词`);
  } else if (stage) {
    const file = path.join(ROOT, 'src', 'assets', `_no-image-${stage}.txt`);
    if (!fs.existsSync(file)) {
      console.error(`✗ 未找到 ${file}`);
      process.exit(1);
    }
    words = fs.readFileSync(file, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    console.log(`从 ${file} 加载 ${words.length} 词`);
  } else {
    // 默认：跑所有 _no-image-*.txt
    words = [];
    for (const f of fs.readdirSync(path.join(ROOT, 'src', 'assets'))) {
      if (/^_no-image-.*\.txt$/.test(f)) {
        const arr = fs.readFileSync(path.join(ROOT, 'src', 'assets', f), 'utf8')
          .split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        words = words.concat(arr);
      }
    }
    if (words.length === 0) {
      console.error('✗ 未找到任何 _no-image-*.txt');
      process.exit(1);
    }
    console.log(`从所有 _no-image-*.txt 共加载 ${words.length} 词`);
  }

  // 去重
  const seen = new Set();
  const uniqWords = [];
  for (const w of words) {
    const k = w.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    uniqWords.push(w);
  }

  // 切批
  const batches = [];
  for (let i = 0; i < uniqWords.length; i += BATCH_SIZE) {
    batches.push({ idx: batches.length, words: uniqWords.slice(i, i + BATCH_SIZE) });
  }
  console.log(`共 ${batches.length} 批（每批 ${BATCH_SIZE} 词），${WORKER_COUNT} 个并发 worker`);

  // worker 共享一个 queue（避免争抢）
  const queue = batches.slice();
  const results = new Map();
  const runners = [];
  for (let i = 0; i < WORKER_COUNT; i++) {
    runners.push(worker(i, queue, results));
  }
  const t0 = Date.now();
  await Promise.all(runners);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  // 汇总
  const counts = { ok: 0, skip: 0, miss: 0, fail: 0 };
  for (const r of results.values()) counts[r.status]++;
  console.log(`\n完成：成功 ${counts.ok}，跳过 ${counts.skip}，无图 ${counts.miss}，失败 ${counts.fail}，耗时 ${secs}s`);

  // 输出"无图/失败"清单
  const failList = [];
  for (const [w, r] of results) {
    if (r.status === 'miss' || r.status === 'fail') failList.push(w);
  }
  if (failList.length) {
    const stageKey = stage || 'all';
    const listPath = path.join(ROOT, 'src', 'assets', `_no-image-${stageKey}.txt`);
    fs.writeFileSync(listPath, failList.join('\n'), 'utf8');
    console.log(`\n无图/失败清单已写入：${listPath}（共 ${failList.length} 词）`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});