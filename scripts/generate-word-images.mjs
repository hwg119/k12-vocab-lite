#!/usr/bin/env node
/**
 * 批量生成单词配图脚本（阿里云 通义万相 wanx2.1-t2i-turbo）
 *
 * 用法：
 *   node scripts/generate-word-images.mjs [--stage senior|junior|primary] [--words apple,machine,...] [--limit N] [--out DIR] [--key API_KEY]
 *
 * 说明：
 *   - 默认从 src/data/senior.ts 读取高中词库，自动过滤虚词（与 src/utils/wordImage.ts 一致）
 *   - --words 指定具体单词（英文，逗号分隔）时，只生成这些词，适合小批试效果
 *   - --limit N 限定最多生成 N 张
 *   - 已存在的图片会跳过（断点续跑）
 *   - 输出文件名：{english 小写、非字母数字转连字符}.png，与 wordImage.ts 的 wordImageFileKey 一致
 *
 * 环境变量：DASHSCOPE_API_KEY
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const API_KEY = process.env.DASHSCOPE_API_KEY || '';
const MODEL = 'wanx2.1-t2i-turbo';
const SIZE = '1024*1024';
const CONCURRENCY = 2;
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
const size = arg('size') || SIZE;
const model = arg('model') || MODEL;
const outDir = arg('out') || path.join(ROOT, 'src', 'assets', 'word-images');
const key = arg('key') || API_KEY;

if (!key) {
  console.error(
    '✗ 未设置 API Key。请先执行（Windows PowerShell）：\n' +
      '  $env:DASHSCOPE_API_KEY="sk-xxx"\n' +
      '  node scripts/generate-word-images.mjs ...\n' +
      '或通过 --key sk-xxx 传入。',
  );
  process.exit(1);
}

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

/** 虚词过滤（与 wordImage.ts 的 isPicturable 保持一致） */
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

/** 生成图片：提交任务 + 轮询 + 下载，返回本地文件路径 */
async function generateOne(english, chinese, filePath) {
  const prompt = `一张英语单词卡片的插画，主题：${english}（${chinese}）。${STYLE}`;
  const submit = await fetch(
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model,
        input: { prompt },
        parameters: { size, n: 1 },
      }),
    },
  );
  if (!submit.ok) {
    const text = await submit.text();
    throw new Error(`提交失败 ${submit.status}: ${text.slice(0, 300)}`);
  }
  const data = await submit.json();
  const taskId = data.output?.task_id;
  if (!taskId) throw new Error(`未拿到 task_id: ${JSON.stringify(data).slice(0, 300)}`);

  // 轮询任务状态
  let url;
  for (let i = 0; i < 60; i++) {
    await sleep(3000);
    const res = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) continue;
    const j = await res.json();
    const status = j.output?.task_status;
    if (status === 'SUCCEEDED') {
      url = j.output?.results?.[0]?.url;
      break;
    }
    if (status === 'FAILED' || status === 'CANCELED' || status === 'UNKNOWN') {
      throw new Error(`任务失败: ${status} ${JSON.stringify(j.output).slice(0, 300)}`);
    }
  }
  if (!url) throw new Error(`任务超时: ${english}`);

  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`下载图片失败 ${imgRes.status}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(filePath, buf);
  return filePath;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** 带重试的包装 */
async function generateWithRetry(english, chinese, filePath) {
  for (let attempt = 1; attempt <= RETRY + 1; attempt++) {
    try {
      await generateOne(english, chinese, filePath);
      return true;
    } catch (err) {
      console.error(`  ✗ ${english} 第 ${attempt} 次失败: ${err.message}`);
      if (attempt > RETRY) return false;
      await sleep(2000 * attempt);
    }
  }
  return false;
}

/** 并发执行生成任务 */
async function runBatch(tasks) {
  let done = 0;
  let ok = 0;
  let fail = 0;
  const results = new Array(tasks.length);
  const worker = async idx => {
    const t = tasks[idx];
    const filePath = path.join(outDir, `${imageFileKey(t.english)}.png`);
    if (fs.existsSync(filePath)) {
      results[idx] = 'skip';
      done++;
      ok++;
      console.log(`  - ${t.english} 已存在，跳过`);
      return;
    }
    const success = await generateWithRetry(t.english, t.chinese, filePath);
    results[idx] = success ? 'ok' : 'fail';
    if (success) ok++;
    else fail++;
    done++;
    console.log(`  [${done}/${tasks.length}] ${success ? '✓' : '✗'} ${t.english} → ${path.basename(filePath)}`);
  };
  const queue = [...tasks.keys()];
  const runners = [];
  for (let i = 0; i < Math.min(CONCURRENCY, tasks.length); i++) {
    runners.push(
      (async () => {
        while (queue.length) {
          const idx = queue.shift();
          if (idx === undefined) break;
          await worker(idx);
        }
      })(),
    );
  }
  await Promise.all(runners);
  return { ok, fail };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  let words;
  if (wordsArg) {
    const wanted = wordsArg.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    words = loadWords(stage).filter(w => wanted.includes(w.english.toLowerCase()));
    const missing = wanted.filter(
      w => !words.some(x => x.english.toLowerCase() === w),
    );
    if (missing.length) console.warn(`⚠ 词库中未找到：${missing.join(', ')}`);
  } else {
    words = loadWords(stage);
  }

  // 过滤虚词
  words = words.filter(isPicturable);
  if (limit > 0) words = words.slice(0, limit);

  console.log(`词库: ${stage} | 待生成: ${words.length} 张 | 输出: ${outDir}`);
  console.log(`模型: ${model} | 尺寸: ${size}`);

  if (words.length === 0) {
    console.log('没有需要生成的单词。');
    return;
  }

  const t0 = Date.now();
  const { ok, fail } = await runBatch(words);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n完成：成功 ${ok}，失败 ${fail}，耗时 ${secs}s`);
  if (fail > 0) {
    console.log('失败的单词可直接重新运行本脚本续跑（已生成的会自动跳过）。');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
