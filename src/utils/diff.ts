/**
 * 单词差异高亮工具
 *
 * 输入：一个 ConfusionGroup（同组词，形近/义近）
 * 输出：每个词的"字符级差异片段"
 *
 * 算法（diff-by-position）：
 *   - 取所有词的英文（lowercase）
 *   - 对每个位置 i，统计该位置出现的字符集
 *   - 如果该位置的字符在所有词中都相同 → 公共字符
 *   - 如果存在差异 → 在第一个词上标记，其他词也标记对应位置
 *
 * 返回结构：
 *   DiffChar = { ch: string; pos: number; diff: boolean }
 *   renderDiff(word) => DiffChar[]
 */

export interface DiffChar {
  ch: string;
  pos: number;
  diff: boolean;
}

/** 取所有词英文（lowercase、过滤非字母） */
function onlyLetters(w: string): string {
  return (w || '').toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * 标记每个词的"差异字符位置"
 *
 * 设计：先按"位置"找差异（适合单替换：adapt vs adopt）。
 * 长度不同时（quite vs quiet），短的词末尾按"插入"标记差异。
 */
export function highlightDiff(englishWords: string[]): DiffChar[][] {
  const words = englishWords.map(onlyLetters);
  if (words.length === 0) return [];
  if (words.length === 1) return [words[0].split('').map((ch, pos) => ({ ch, pos, diff: false }))];

  const maxLen = Math.max(...words.map(w => w.length));

  // 步骤 1：对每个位置 i，统计该位置上唯一字符集合
  // 任意两个词在该位置的字符不同 → 差异位
  const diffPositions = new Set<number>();
  for (let pos = 0; pos < maxLen; pos++) {
    const seenAtPos = new Set<string>();
    let hasGap = false;
    for (const w of words) {
      const ch = w[pos]; // undefined 表示该词到此位置已结束（短词）
      seenAtPos.add(ch ?? '');
      if (ch === undefined) hasGap = true;
    }
    // 如果该位置上有不同字符、或有词缺失 → 算差异
    if (seenAtPos.size > 1 || hasGap) {
      diffPositions.add(pos);
    }
  }

  // 步骤 2：对每个词，渲染成字符列表，差异位标记
  return words.map(w => {
    const out: DiffChar[] = [];
    for (let pos = 0; pos < w.length; pos++) {
      out.push({ ch: w[pos], pos, diff: diffPositions.has(pos) });
    }
    return out;
  });
}

/**
 * 简化版：返回每对词之间的"替换位置集合"（不含插入/删除标记）
 * 用于"复习模式"显示差异提示
 */
export function pairDiffPositions(a: string, b: string): Set<number> {
  const wa = onlyLetters(a);
  const wb = onlyLetters(b);
  const out = new Set<number>();
  const len = Math.max(wa.length, wb.length);
  for (let i = 0; i < len; i++) {
    if (wa[i] !== wb[i]) out.add(i);
  }
  return out;
}