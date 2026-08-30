import { Word } from '../types';

/**
 * 单词配图服务（离线版）：读取打包进应用的本地插画资源（webp 优化版）。
 *
 * - PNG 源母版：src/assets/word-images/*.png（由 scripts/generate-word-images.mjs
 *   与 scripts/download-wiki-images.mjs 写入，仅作为压缩脚本输入）
 * - WebP 优化版：src/assets/word-images-webp/*.webp（由
 *   scripts/compress-images-to-webp.mjs 生成，已显著减小 68% 体积）
 *
 * 本模块只 glob webp，原 PNG 不进 bundle、不进 PWA precache，避免重复打包。
 * 命名约定：{english 小写、非字母数字转连字符}.webp，如 apple.webp / machine.webp。
 */

const images = import.meta.glob('../assets/word-images-webp/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

/** 英文 → 规范化图片文件名（小写、非字母数字变连字符） */
export function wordImageFileKey(english: string): string {
  return (
    english
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'word'
  );
}

/** 返回单词配图 URL；无配图返回 undefined */
export function getWordImage(english: string): string | undefined {
  const key = wordImageFileKey(english);
  const entry = Object.entries(images).find(([p]) => {
    const base = p.split('/').pop() || '';
    const stem = base.replace(/\.webp$/i, '');
    return stem === key;
  });
  return entry?.[1];
}

/** 无法配图的虚词白名单（冠词/介词/连词/代词/助动词等，配图易误导或无意义） */
const NON_PICTURABLE: ReadonlySet<string> = new Set([
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

/**
 * 判断单词是否"可配图"：
 *  - 英文命中虚词白名单 → 否
 *  - 中文释义以典型虚词词性标记开头（art./prep./conj./pron./aux./interj.）→ 否
 *  - 其余 → 是
 */
export function isPicturable(word: Word): boolean {
  const en = word.english.toLowerCase().trim();
  if (NON_PICTURABLE.has(en)) return false;
  const c = (word.chinese || '').trim();
  if (/^(art\.|prep\.|conj\.|pron\.|aux\.|interj\.|num\.)\b/.test(c)) return false;
  return true;
}
