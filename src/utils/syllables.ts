const isVowel = (ch: string) => /[aeiouy]/.test(ch);

function hasVowelAfter(str: string, start: number) {
  for (let k = start; k < str.length; k++) {
    if (isVowel(str[k])) return true;
  }
  return false;
}

/**
 * 将英文单词拆成近似音节，用于拼写训练的"按音节分段"提示。
 *
 * 采用通用的"元音核心 + 左右辅音归属"启发式：
 * - 每个元音核心（含双元音）为一个音节
 * - 开音节优先：连续辅音间切分，单辅音归本音节、双辅音留一个给下一音节
 * - 结尾的孤立元音 / silent e 并入前一音节
 *
 * 不是词典级精确，但对中小学常见词分段良好，仅作视觉脚手架。
 */
export function splitSyllables(word: string): string[] {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 2) return [word];

  const syl: string[] = [];
  let i = 0;
  const n = w.length;

  while (i < n) {
    let seg = '';
    // 前导辅音（第一个音节通常含一个，后续音节的前导辅音由上一轮留出）
    while (i < n && !isVowel(w[i])) {
      seg += w[i];
      i++;
    }
    // 元音核心
    while (i < n && isVowel(w[i])) {
      seg += w[i];
      i++;
    }
    // 尾随辅音
    const trailStart = i;
    let c = 0;
    while (i < n && !isVowel(w[i])) {
      i++;
      c++;
    }
    if (c > 0) {
      if (hasVowelAfter(w, i)) {
        // 后面还有元音：多辅音留一个给下一音节，单辅音保守归本音节
        const keep = c > 1 ? c - 1 : c;
        seg += w.slice(trailStart, trailStart + keep);
        i = trailStart + keep;
      } else {
        seg += w.slice(trailStart, trailStart + c);
      }
    }
    syl.push(seg);
  }

  // 结尾孤立元音（如 silent e）并入前一音节
  if (syl.length >= 2 && syl[syl.length - 1].length === 1 && isVowel(syl[syl.length - 1][0])) {
    const last = syl.pop() as string;
    syl[syl.length - 1] += last;
  }

  return syl;
}