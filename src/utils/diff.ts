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
 * 找所有词的"最长公共后缀"长度。
 * 例：['aboard', 'beard', 'board'] → 3（"ard"）
 */
function commonSuffixLen(words: string[]): number {
  if (words.length === 0) return 0;
  const minLen = Math.min(...words.map(w => w.length));
  for (let len = minLen; len > 0; len--) {
    const suffix = words[0].slice(-len);
    if (words.every(w => w.slice(-len) === suffix)) return len;
  }
  return 0;
}

/**
 * 找所有词的"最长公共前缀"长度。
 * 例：['prefix_a', 'prefix_b'] → 7（"prefix_"）
 */
function commonPrefixLen(words: string[]): number {
  if (words.length === 0) return 0;
  const minLen = Math.min(...words.map(w => w.length));
  for (let len = minLen; len > 0; len--) {
    const prefix = words[0].slice(0, len);
    if (words.every(w => w.slice(0, len) === prefix)) return len;
  }
  return 0;
}

/**
 * 标记每个词的"差异字符位置"
 *
 * 设计：先找所有词的公共前缀/后缀，确认"无差异"区段；
 * 然后对中间区段按位置做差异对齐。
 * 这能解决 aboard / beard / board 这种
 * "末尾 3 字母相同、前缀各异" 的全词高亮问题。
 */
export function highlightDiff(englishWords: string[]): DiffChar[][] {
  const words = englishWords.map(onlyLetters);
  if (words.length === 0) return [];
  if (words.length === 1) {
    return [words[0].split('').map((ch, pos) => ({ ch, pos, diff: false }))];
  }

  // 步骤 1：先确定"公共前后缀"（跨所有词都相同的连续字符）
  const prefixLen = commonPrefixLen(words);
  const suffixLen = commonSuffixLen(words);

  // 步骤 2：找出"中间区段"的差异位置（仅对齐中间非公共部分）
  // 中间区段范围：[prefixLen, len - suffixLen)
  // 如果中间区段在某一位置上字符与其它任一词的中间不一致 → 差异位
  const diffPositions = new Set<number>();

  // 中间区段做"按位置"差异比对（处理 "adapt vs adopt" 这种替换）
  const midStart = prefixLen;
  const maxLen = Math.max(...words.map(w => w.length));
  const midEnd = maxLen - suffixLen;

  for (let pos = midStart; pos < midEnd; pos++) {
    const seen = new Set<string>();
    let hasGap = false;
    for (const w of words) {
      // 只算"中间区段"内的字符；超出该词中间区段的按 gap 处理
      const wMidEnd = w.length - suffixLen;
      const ch = (pos < w.length && pos < wMidEnd) ? w[pos] : undefined;
      seen.add(ch ?? '');
      if (ch === undefined) hasGap = true;
    }
    if (seen.size > 1 || hasGap) {
      diffPositions.add(pos);
    }
  }

  // 步骤 3：渲染每个词
  return words.map(w => {
    const out: DiffChar[] = [];
    for (let pos = 0; pos < w.length; pos++) {
      // 公共前缀/后缀内的字符 → NOT diff
      const inPrefix = pos < prefixLen;
      const inSuffix = pos >= w.length - suffixLen;
      out.push({
        ch: w[pos],
        pos,
        diff: !inPrefix && !inSuffix && diffPositions.has(pos),
      });
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