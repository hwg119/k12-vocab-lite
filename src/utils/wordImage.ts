import { Word } from '../types';
import { CDN_BASE } from '../config/cdn';

/**
 * 单词配图（CDN 专用）：图片以 {key}.webp 上传到 COS 桶 /images/，
 * App 运行时通过 CDN URL 加载。构建时不再用 import.meta.glob 打包，
 * 从而把 ~11.6MB 配图从 APK 中剔除。
 *
 * - 未配置 CDN_BASE（本地预览）时返回 undefined → 组件不渲染配图
 * - CDN 上缺失的图由 WordImage 组件的 onError 自动隐藏
 * 命名约定：{english 小写、非字母数字转连字符}.webp，如 apple.webp / a-lot.webp
 */

/** 英文 → 规范化图片文件名（小写、非字母数字变连字符） */
export function wordImageFileKey(english: string): string {
  return (
    english
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'word'
  );
}

/** 返回单词配图 URL；未配置 CDN 时返回 undefined（组件据此不渲染配图） */
export function getWordImage(english: string): string | undefined {
  if (!CDN_BASE) return undefined;
  return `${CDN_BASE}/images/${wordImageFileKey(english)}.webp`;
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
