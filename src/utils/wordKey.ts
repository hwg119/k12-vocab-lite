import { Word } from '../types';

/**
 * 单词的稳定标识（用于 mistakeIds、learnedIds、srsMap 的 key）
 *
 * 设计原则：
 *   - 优先用 `english|chinese` 复合键，避免词库 id 重生成导致旧数据失效
 *   - 同英文单词如果有不同释义（例如 bank=银行/河岸），按释义分别记录
 *   - english/chinese 为空的极小概率情况下，fallback 到原 id
 *
 * 注意：mistakeIds 等历史数据可能存的是旧 id，新逻辑会同时尝试两种 key 匹配，
 * 见 `matchWordKey`。
 */

export function wordKey(w: Pick<Word, 'english' | 'chinese' | 'id'>): string {
  const en = (w.english || '').trim().toLowerCase();
  const zh = (w.chinese || '').trim();
  if (en && zh) return `w:${en}|${zh}`;
  if (en) return `w:${en}`;
  return `id:${w.id}`;
}

/**
 * 给定一个 Word 列表 + 候选 key（可能是旧 id 或旧 english），找出对应的 Word。
 * 返回 null 表示真的找不到（数据已删除）。
 */
export function matchWordKey(words: Word[], keyOrId: string): Word | null {
  if (!keyOrId) return null;
  // 1. 直接按 id 命中
  const byId = words.find(w => w.id === keyOrId);
  if (byId) return byId;
  // 2. 直接按 wordKey 命中
  const byKey = words.find(w => wordKey(w) === keyOrId);
  if (byKey) return byKey;
  // 3. 兼容旧数据：去掉前缀尝试（id:xxx → xxx）
  const stripped = keyOrId.replace(/^w:|^id:/, '');
  if (stripped && stripped !== keyOrId) {
    return matchWordKey(words, stripped);
  }
  return null;
}