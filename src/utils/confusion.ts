import { Word } from '../types';

export interface ConfusionGroup {
  /** 形近/义近的配对（一般是 2~3 个） */
  members: Word[];
}

/**
 * 把同 confusionGroupId 的词归类到一起
 * 单独成组的（成员数 >= 2）才返回，否则视为无配对
 */
export function groupConfusionPairs(words: Word[]): ConfusionGroup[] {
  const map = new Map<string, Word[]>();
  for (const w of words) {
    if (!w.confusionGroupId) continue;
    if (!map.has(w.confusionGroupId)) map.set(w.confusionGroupId, []);
    map.get(w.confusionGroupId)!.push(w);
  }

  const out: ConfusionGroup[] = [];
  for (const [id, members] of map) {
    if (members.length >= 2) {
      // 排序便于 UI 稳定
      members.sort((a, b) => a.english.localeCompare(b.english));
      out.push({ members });
    } else {
      // 单独成组的丢弃（不影响 UI）
      // 也可选择保留并标记，但需求是"配对"，单独无意义
      // eslint-disable-next-line no-unused-vars
      id;
    }
  }
  return out.sort((a, b) => a.members[0].english.localeCompare(b.members[0].english));
}
