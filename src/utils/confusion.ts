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
  // 1. 先按显式 confusionGroupId 归类
  const map = new Map<string, Word[]>();
  for (const w of words) {
    if (!w.confusionGroupId) continue;
    if (!map.has(w.confusionGroupId)) map.set(w.confusionGroupId, []);
    map.get(w.confusionGroupId)!.push(w);
  }

  // 2. 对没有 confusionGroupId 的词，进行自动形近检测
  const ungrouped = words.filter(w => !w.confusionGroupId);
  const autoGroups = detectSimilarPairs(ungrouped);

  // 3. 合并
  const all = [...map.values(), ...autoGroups];
  const result: ConfusionGroup[] = [];
  for (const members of all) {
    if (members.length >= 2) {
      members.sort((a, b) => a.english.localeCompare(b.english));
      result.push({ members });
    }
  }
  return result.sort((a, b) => a.members[0].english.localeCompare(b.members[0].english));
}

/**
 * 自动形近检测：找出长度差 ≤ 1、编辑距离 ≤ 1 的单词组
 *
 * 实现策略（避免 O(n²)）：
 *   1. 仅保留字母词，长度 3-12
 *   2. 按长度分桶（同一长度的桶里取编辑距离 ≤ 1 的对）
 *   3. 用 union-find 合并传递相似的组（a-b, b-c → a,b,c 一组）
 *
 * 适用场景举例：
 *   - adapt / adopt（长度 5，1 替换）
 *   - effect / affect（长度 6，1 替换）
 *   - quite / quiet（长度 5/6，1 删除）
 *   - their / there（长度 5，1 替换）
 *
 * 不适用场景（应当由显式 confusionGroupId 维护）：
 *   - accept / except（编辑距离 ≥ 4）
 */
function detectSimilarPairs(words: Word[]): Word[][] {
  // 过滤：只保留 3-12 字母的纯字母词
  const candidates = words.filter(w =>
    /^[a-z]+$/.test(w.english) && w.english.length >= 3 && w.english.length <= 12
  );
  if (candidates.length === 0) return [];

  // 按长度分桶
  const buckets = new Map<number, Word[]>();
  for (const w of candidates) {
    const len = w.english.length;
    if (!buckets.has(len)) buckets.set(len, []);
    buckets.get(len)!.push(w);
  }

  // 桶编号（用于跨桶连接长度差 = 1 的桶）
  const lenList = [...buckets.keys()].sort((a, b) => a - b);
  const lenToIdx = new Map<number, number>();
  lenList.forEach((l, i) => lenToIdx.set(l, i));

  // 找所有相似的对（同桶内 + 相邻桶）
  const pairs: Array<[Word, Word]> = [];
  for (let bi = 0; bi < lenList.length; bi++) {
    const lenA = lenList[bi];
    const bucketA = buckets.get(lenA)!;
    if (bucketA.length < 2) continue;
    // 桶内两两
    for (let i = 0; i < bucketA.length; i++) {
      for (let j = i + 1; j < bucketA.length; j++) {
        const a = bucketA[i].english;
        const b = bucketA[j].english;
        if (editDistance(a, b) <= 1) {
          pairs.push([bucketA[i], bucketA[j]]);
        }
      }
    }
    // 与下一个长度桶配对（差 1）
    const nextLen = lenA + 1;
    if (!buckets.has(nextLen)) continue;
    const bucketB = buckets.get(nextLen)!;
    for (const wa of bucketA) {
      for (const wb of bucketB) {
        if (editDistance(wa.english, wb.english) <= 1) {
          pairs.push([wa, wb]);
        }
      }
    }
  }

  if (pairs.length === 0) return [];

  // union-find 合并（迭代式避免栈爆）
  const parent = new Map<string, string>();
  // 初始化：每个词自己是 root
  for (const w of candidates) parent.set(w.id, w.id);
  const find = (id: string): string => {
    let cur = id;
    while (parent.get(cur) !== cur) cur = parent.get(cur)!;
    // 路径压缩
    let node = id;
    while (parent.get(node) !== cur) {
      const next = parent.get(node)!;
      parent.set(node, cur);
      node = next;
    }
    return cur;
  };
  const union = (a: Word, b: Word) => {
    const ra = find(a.id), rb = find(b.id);
    if (ra !== rb) parent.set(ra, rb);
  };
  for (const [a, b] of pairs) union(a, b);

  // 收集组（≥2 成员）
  const groups = new Map<string, Word[]>();
  for (const w of candidates) {
    const root = find(w.id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(w);
  }
  return [...groups.values()].filter(g => g.length >= 2);
}

/** Levenshtein 编辑距离（O(n*m)，仅对小字符串调用） */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 1) return 2;
  let prev = new Array(n + 1).fill(0).map((_, i) => i);
  let curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}