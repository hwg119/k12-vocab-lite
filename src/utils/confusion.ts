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
 * 自动形近检测：找出长度差 ≤ 1、编辑距离 ≤ 1 的"小型"配对
 *
 * 设计要点（避免 union-find 链式传递导致"巨型团"）：
 *   1. 仅保留字母词，长度 3-12
 *   2. 按长度分桶 + 跨相邻长度桶取编辑距离 ≤ 1 的对
 *   3. 用"贪心分组 + 容量限制"取代 union-find：
 *      - 每对 (a, b) 优先尝试合并已有组（如果 a、b 都空闲）
 *      - 否则新建一个 2 成员组
 *      - 已分配到组的成员直接跳过（避免通过中间词 a→b→c 形成长链）
 *   4. 组内上限 3 个成员，溢出忽略
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

  const lenList = [...buckets.keys()].sort((a, b) => a - b);

  // 收集所有形近对（同桶 + 相邻桶），按字典序去重
  const pairSet = new Set<string>();
  const pairs: Array<[Word, Word]> = [];
  const consider = (a: Word, b: Word) => {
    if (editDistance(a.english, b.english) > 1) return;
    const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
    if (pairSet.has(key)) return;
    pairSet.add(key);
    pairs.push([a, b]);
  };
  for (let bi = 0; bi < lenList.length; bi++) {
    const lenA = lenList[bi];
    const bucketA = buckets.get(lenA)!;
    if (bucketA.length < 2) continue;
    // 桶内两两
    for (let i = 0; i < bucketA.length; i++) {
      for (let j = i + 1; j < bucketA.length; j++) {
        consider(bucketA[i], bucketA[j]);
      }
    }
    // 与下一个长度桶
    const nextLen = lenA + 1;
    if (!buckets.has(nextLen)) continue;
    const bucketB = buckets.get(nextLen)!;
    for (const wa of bucketA) {
      for (const wb of bucketB) consider(wa, wb);
    }
  }

  if (pairs.length === 0) return [];

  // 贪心分组：每个成员最多出现在一个组里；组容量上限 3
  const MAX_GROUP = 3;
  const used = new Set<string>();
  const groups: Word[][] = [];

  for (const [a, b] of pairs) {
    if (used.has(a.id) || used.has(b.id)) continue;
    groups.push([a, b]);
    used.add(a.id);
    used.add(b.id);
    // 尝试扩展：找第三个成员 c，且与 a 或 b 形近，且 a、b 当前都还"仅与 c 共享一组"
    for (const w of candidates) {
      if (used.has(w.id)) continue;
      if (groups[groups.length - 1].length >= MAX_GROUP) break;
      // 选取"已加入组成员" 中某个 word 作为锚点，要求锚点与 w 形近
      const anchor = groups[groups.length - 1].find(x => editDistance(x.english, w.english) <= 1);
      if (!anchor) continue;
      groups[groups.length - 1].push(w);
      used.add(w.id);
    }
  }

  return groups.filter(g => g.length >= 2);
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