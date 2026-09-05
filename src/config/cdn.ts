/**
 * CDN 资源基础 URL 配置
 *
 * 用法：
 *   1. 把资源上传到 Cloudflare R2 / 七牛 / OSS 后，得到一个公网地址
 *      例：https://cdn.your-domain.com
 *
 *   2. 部署时设置环境变量 VITE_CDN_BASE（推荐）
 *      或直接修改下方 CDN_BASE 常量
 *
 *   3. 构建后 dist 里的资源引用会变成 https://cdn.your-domain.com/audio/water.opus
 *      浏览器自动走 CDN，不再加载本地 dist/audio/* 文件
 *
 *   4. 关闭 CDN：把 CDN_BASE 留空 '' 即可，所有路径回退到本地 public/
 */

const envBase = (import.meta.env.VITE_CDN_BASE as string | undefined)?.replace(/\/+$/, '');

export const CDN_BASE = envBase || '';

/** 把资源路径拼接为 CDN URL */
export function assetUrl(relPath: string): string {
  if (!CDN_BASE) return relPath;
  // relPath 必须以 / 开头
  const p = relPath.startsWith('/') ? relPath : `/${relPath}`;
  return `${CDN_BASE}${p}`;
}

/** 单词 opus 音频路径 */
export function wordAudioUrl(word: string): string {
  return assetUrl(`/audio/${encodeURIComponent(word.toLowerCase())}.opus`);
}

/** 句子 mp3 音频路径（由 SentenceAudio 使用） */
export function sentenceAudioUrl(file: string): string {
  return assetUrl(`/audio/sentences/${file}`);
}