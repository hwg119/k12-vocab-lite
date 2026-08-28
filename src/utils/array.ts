/**
 * 工具：Fisher-Yates 洗牌 + 随机采样 + 块分割
 *
 * shuffleArray / sample 默认使用真随机；可通过传入 rng 变成
 * 确定性随机（基于种子的 PRNG），用于「分享挑战码」场景——双方
 * 使用同一 seed 即可还原完全相同的题目顺序与选项布局。
 */

/** 返回 [0,1) 区间的伪随机数 */
export type Rng = () => number;

/** Fisher-Yates 洗牌。可选传入 rng 实现确定性洗牌。 */
export function shuffleArray<T>(array: T[], rng: Rng = Math.random): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/** 从数组中随机选 count 个（确定性版本可传入 rng） */
export function sample<T>(array: T[], count: number, rng: Rng = Math.random): T[] {
  if (count >= array.length) {
    return shuffleArray(array, rng);
  }
  return shuffleArray(array, rng).slice(0, count);
}

/** mulberry32：轻量 32-bit PRNG，给定种子可复现 */
export function seededRng(seed: number): Rng {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 把字符串映射为 32-bit 无符号整数种子 */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/** 将数组分块 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}