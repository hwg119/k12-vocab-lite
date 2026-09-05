/**
 * 上传 public/ 资源到腾讯云 COS（国内 CDN，免费 50GB 标准存储 + 60GB CDN/月）
 *
 * 为什么选腾讯云 COS：
 *   - 国内节点 5-50ms 极速
 *   - 免费额度最大（够用几年）
 *   - COS 兼容 S3 协议，可用 AWS SDK
 *   - 上传后默认走 CDN 加速
 *
 * 使用步骤：
 *   1. 注册并实名腾讯云：https://console.cloud.tencent.com/
 *   2. 开通对象存储 COS：https://console.cloud.tencent.com/cos
 *   3. 创建存储桶：
 *      - 名称：k12-vocab-assets（自定义）
 *      - 地域：ap-guangzhou（广州，离你近）
 *      - 访问权限：公有读私有写
 *      - 其他默认
 *   4. 创建 API 密钥：
 *      控制台 → 访问管理 CAM → API 密钥管理 → 新建 → 记录 SecretId 和 SecretKey
 *   5. 配置 CORS（重要！）：
 *      COS 控制台 → 你的桶 → 安全管理 → CORS 设置 → 添加规则：
 *        来源 Origin: *
 *        操作 Methods: GET, HEAD
 *        允许 Headers: *
 *        超时 Max-Age: 600
 *   6. 设置环境变量运行：
 *      $env:TC_SECRET_ID="你的SecretId"
 *      $env:TC_SECRET_KEY="你的SecretKey"
 *      $env:TC_BUCKET="k12-vocab-assets-1300000000"（桶名带 APPID）
 *      $env:TC_REGION="ap-guangzhou"
 *      node scripts/upload-cos.mjs
 *
 *   7. 启用 CDN 加速（可选但强烈推荐）：
 *      COS 控制台 → 你的桶 → 域名管理 → 默认 CDN 加速域名 → 启用
 *      会得到一个 xxx.cos.ap-guangzhou.myqcloud.com 或 .file.myqcloud.com 域名
 *
 *   8. 构建时启用 CDN：
 *      $env:VITE_CDN_BASE="https://你的桶名-APPID.cos.ap-guangzhou.myqcloud.com"
 *      npx vite build
 */

import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// 上传源：本地目录相对 ROOT → 桶内 Key 前缀
const SOURCES = [
  { dir: path.resolve(ROOT, 'cdn-assets/audio'), prefix: 'audio' },                       // 单词发音 opus
  { dir: path.resolve(ROOT, 'src/assets/word-images-webp'), prefix: 'images' },            // 单词配图 webp
];

// ====== 腾讯云 COS 配置 ======
const SECRET_ID = process.env.TC_SECRET_ID || '';
const SECRET_KEY = process.env.TC_SECRET_KEY || '';
// COS 桶名格式：<BucketName>-<APPID>，例：k12-vocab-assets-1300000000
const BUCKET = process.env.TC_BUCKET || '';
const REGION = process.env.TC_REGION || 'ap-guangzhou';
// 公开访问 URL 模板（启用 CDN 加速后用这个）
const CDN_BASE = process.env.TC_CDN_BASE
  || `https://${BUCKET}.cos.${REGION}.myqcloud.com`;

if (!SECRET_ID || !SECRET_KEY || !BUCKET) {
  console.error('请设置环境变量 TC_SECRET_ID / TC_SECRET_KEY / TC_BUCKET');
  console.error('参考脚本顶部注释获取详细步骤');
  process.exit(1);
}

// COS 走 S3 兼容协议
const s3 = new S3Client({
  region: REGION,
  endpoint: `https://cos.${REGION}.myqcloud.com`,
  credentials: {
    accessKeyId: SECRET_ID,
    secretAccessKey: SECRET_KEY,
  },
  // COS 要求虚拟主机风格域名访问（腾讯云明确拒绝 path-style）
  forcePathStyle: false,
});

const MIME = {
  '.opus': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const CACHE_CONTROL = 'public, max-age=31536000, immutable'; // 1 年

async function uploadFile(relPath, absPath) {
  const ext = path.extname(absPath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  const body = fs.readFileSync(absPath);
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: relPath.replace(/\\/g, '/'),
    Body: body,
    ContentType: contentType,
    CacheControl: CACHE_CONTROL,
  });
  await s3.send(cmd);
  return { relPath, size: body.length };
}

async function walk(dir, baseRel = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = path.join(baseRel, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walk(abs, rel));
    } else {
      out.push({ rel, abs });
    }
  }
  return out;
}

async function main() {
  // 测试连通性
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
    console.log(`✓ 桶 ${BUCKET} 连通正常`);
  } catch (e) {
    console.error(`× 桶 ${BUCKET} 无法访问: ${e.message}`);
    console.error('请检查桶名格式（应带 APPID 后缀）和 SecretId/SecretKey');
    process.exit(1);
  }

  console.log(`\n上传 ${SOURCES.map(s => s.prefix).join(' + ')} -> COS bucket: ${BUCKET}`);
  console.log(`CDN 地址: ${CDN_BASE}`);

  const files = [];
  for (const s of SOURCES) {
    const list = await walk(s.dir);
    for (const f of list) {
      files.push({ key: `${s.prefix}/${f.rel.replace(/\\/g, '/')}`, abs: f.abs });
    }
  }
  console.log(`待上传文件: ${files.length}`);

  const start = Date.now();
  const concurrency = 10;
  let i = 0;
  let done = 0;
  let totalSize = 0;
  const errors = [];

  async function worker() {
    while (i < files.length) {
      const idx = i++;
      const f = files[idx];
      try {
        const r = await uploadFile(f.key, f.abs);
        totalSize += r.size;
        done++;
        if (done % 100 === 0 || done === files.length) {
          const dt = ((Date.now() - start) / 1000).toFixed(1);
          const speed = (totalSize / 1024 / 1024 / Math.max(1, (Date.now() - start) / 1000)).toFixed(2);
          console.log(`[${done}/${files.length}] ${dt}s, total ${(totalSize/1024/1024).toFixed(1)} MB (${speed} MB/s)`);
        }
      } catch (e) {
        errors.push({ file: f.key, err: String(e.message || e).slice(0, 100) });
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));

  console.log(`\n完成。共 ${done}/${files.length} 个文件，总大小 ${(totalSize/1024/1024).toFixed(1)} MB，用时 ${((Date.now()-start)/1000).toFixed(1)}s`);
  if (errors.length) {
    console.log(`失败: ${errors.length}`);
    errors.slice(0, 10).forEach(e => console.log('  -', e.file, e.err));
  }

  console.log(`\n下一步：在 COS 控制台启用「默认 CDN 加速域名」`);
  console.log(`然后设置环境变量并重新构建：`);
  console.log(`  $env:VITE_CDN_BASE="${CDN_BASE}"`);
  console.log(`  npx vite build`);
}

main().catch(e => { console.error(e); process.exit(1); });