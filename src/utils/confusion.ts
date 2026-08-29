import { Word, SrsState } from '../types';
import { highlightDiff } from './diff';

export interface ConfusionGroup {
  /** 形近/义近的配对（一般是 2~3 个） */
  members: Word[];
  /** 字符级差异位置数（形近词差异字符数；义近组按 0 处理） */
  diffCount: number;
  /** 混淆风险评分（1-5），综合差异字符数、词长、公共后缀、已学比例计算 */
  confusionRisk: number;
  /** 组内成员中"最近一次复习"距今的天数（未学视为 Infinity） */
  daysSinceReview: number;
}

/** 计算一组词的形近差异字符数（取每词 diff=true 的位置数，再跨词取 max） */
function computeDiffCount(members: Word[]): number {
  if (members.length < 2) return 0;
  const diffs = highlightDiff(members.map(w => w.english));
  let max = 0;
  for (const arr of diffs) {
    let n = 0;
    for (const c of arr) if (c.diff) n++;
    if (n > max) max = n;
  }
  return max;
}

/**
 * 计算混淆风险评分（1-5），综合以下因子：
 *   1. diffCount：差异字符数（1→高风险，≥3→低风险）
 *   2. 词长：词越长越容易看错
 *   3. 公共后缀占比：共享后缀越长越容易混淆（如 -tion/-sion）
 *   4. 已学比例：已学的词才真正存在混淆风险
 *
 * 返回值 1-5 整数（四舍五入），5 = 最容易混淆。
 */
function computeConfusionRisk(
  members: Word[],
  diffCount: number,
  learnedIds?: Set<string>,
): number {
  if (members.length === 0) return 1;
  const maxLen = Math.max(...members.map(m => m.english.length));

  // 因子 1：差异字符数（核心）—— 1 处差异极易混淆，3+ 处则好区分
  const diffScore = diffCount <= 1 ? 4 : diffCount === 2 ? 2.5 : 1;

  // 因子 2：词长 —— 越长越容易看错
  const lenScore = maxLen <= 4 ? 0.5 : maxLen <= 7 ? 1 : maxLen <= 10 ? 1.5 : 2;

  // 因子 3：公共后缀占比 —— 共享部分越长越容易混淆
  const lowerWords = members.map(m => m.english.toLowerCase());
  let commonEndLen = 0;
  for (let len = 1; len <= maxLen; len++) {
    const suffix = lowerWords[0].slice(-len);
    if (lowerWords.every(w => w.slice(-len) === suffix)) commonEndLen = len;
    else break;
  }
  const suffixRatio = commonEndLen / maxLen;
  const suffixScore = suffixRatio >= 0.6 ? 2 : suffixRatio >= 0.4 ? 1.5 : suffixRatio >= 0.2 ? 1 : 0.5;

  // 因子 4：已学比例 —— 未学的词不存在混淆
  let learnedRatio = 1;
  if (learnedIds && learnedIds.size > 0) {
    const learned = members.filter(m => learnedIds.has(m.id)).length;
    learnedRatio = learned / members.length;
  }
  const learnScore = learnedRatio * 1;

  const raw = diffScore + lenScore + suffixScore + learnScore;
  // 归一到 1-5（raw 范围约 2~8.5）
  const normalized = Math.round(Math.min(5, Math.max(1, (raw - 2) / 1.5 + 1)));
  return normalized;
}

/**
 * 计算"距上次复习天数"：
 *   - 组内任一成员没有 SRS 记录 → 视为从未复习 → Infinity
 *   - 否则取组内"最近一次复习时间戳"中最大的那个，用 (now - max) / day
 */
function computeDaysSinceReview(
  members: Word[],
  srsMap: Record<string, SrsState> | undefined,
  now: number,
): number {
  if (!srsMap || Object.keys(srsMap).length === 0) return Infinity;
  let latest = -Infinity;
  let anyFound = false;
  for (const m of members) {
    const s = srsMap[m.id];
    if (!s || !s.lastReviewedAt) continue;
    anyFound = true;
    if (s.lastReviewedAt > latest) latest = s.lastReviewedAt;
  }
  if (!anyFound) return Infinity;
  const DAY = 24 * 60 * 60 * 1000;
  return Math.max(0, (now - latest) / DAY);
}

export interface GroupConfusionOptions {
  /** SRS 状态映射（可选），用于计算"距上次复习天数" */
  srsMap?: Record<string, SrsState>;
  /** 已学单词 ID 集合（可选），用于计算混淆风险中的已学比例 */
  learnedIds?: Set<string>;
  /** 当前时间戳（默认 Date.now），便于测试 */
  now?: number;
}

/**
 * 把同 confusionGroupId 的词归类到一起
 * 单独成组的（成员数 >= 2）才返回，否则视为无配对
 *
 * 可传入 SRS / learnedIds 上下文，扩展每组的元信息（diffCount / confusionRisk / daysSinceReview）。
 */
export function groupConfusionPairs(
  words: Word[],
  options: GroupConfusionOptions = {},
): ConfusionGroup[] {
  const { srsMap, learnedIds, now = Date.now() } = options;

  // 1. 先按显式 confusionGroupId 归类
  const map = new Map<string, Word[]>();
  for (const w of words) {
    if (!w.confusionGroupId) continue;
    if (!map.has(w.confusionGroupId)) map.set(w.confusionGroupId, []);
    map.get(w.confusionGroupId)!.push(w);
  }

  // 2. 对没有 confusionGroupId 的词，进行自动形近检测（结果按 words 引用缓存，命中即跳过 O(n²)）
  const ungrouped = words.filter(w => !w.confusionGroupId);
  let autoGroups = autoPairCache.get(words);
  if (!autoGroups) {
    autoGroups = detectSimilarPairs(ungrouped);
    autoPairCache.set(words, autoGroups);
  }

  // 3. 合并
  const all = [...map.values(), ...autoGroups];
  const result: ConfusionGroup[] = [];
  for (const members of all) {
    if (members.length >= 2) {
      members.sort((a, b) => a.english.localeCompare(b.english));
      const dc = computeDiffCount(members);
      result.push({
        members,
        diffCount: dc,
        confusionRisk: computeConfusionRisk(members, dc, learnedIds),
        daysSinceReview: computeDaysSinceReview(members, srsMap, now),
      });
    }
  }
  return result.sort((a, b) => a.members[0].english.localeCompare(b.members[0].english));
}

/**
 * 静态形近配对的内存缓存。
 *
 * 词库来自 WORDS_BY_STAGE（编译期常量，同一学段的 words 数组引用恒定），
 * 因此 detectSimilarPairs 的结果对该 words 引用是纯静态的——每次打开页面重算
 * O(n²) 纯属浪费。用 WeakMap 以 words 引用为键缓存，第二次起直接命中。
 *
 * 用 WeakMap 而非 localStorage：键挂引用、不占用 storage、数组不再被引用时自动 GC，
 * 只需在词库数据(引用)变化后自然失效，无需版本号/清理逻辑。
 */
const autoPairCache = new WeakMap<Word[], Word[][]>();

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
  //
  // 用"删一字符签名索引"取代 O(n²) 两两暴力比对，把候选词对压到几千条：
  //   - 同长：删掉某位置后得到相同串 → 候选
  //   - 相邻长度：长词删掉某字符后等于短词 → 候选
  // 注意签名只是"候选生成器"：两人可删掉不同位置撞同一签名（如 her→he 与 the→he），
  // 故每条候选边仍需 isEditDistanceAtMost1 复核（候选仅数千条，开销可忽略）。
  // 复核后结果集合与暴力比对完全一致。总体 O(词数 × 词长)，比扫描几十万次无关词对快一个数量级。
  const pairSet = new Set<string>();
  const pairs: Array<[Word, Word]> = [];
  const addEdge = (a: Word, b: Word) => {
    if (a.id === b.id) return;
    if (!isEditDistanceAtMost1(a.english, b.english)) return;
    const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
    if (pairSet.has(key)) return;
    pairSet.add(key);
    pairs.push([a, b]);
  };

  for (const len of lenList) {
    const bucket = buckets.get(len)!;

    // 同长：共享删一字符签名 ⇒ 删同一位置后得相同串 ⇒ Hamming ≤ 1（删除位置不同会误报，故仍复核）
    if (bucket.length >= 2) {
      const sigMap = new Map<string, Word[]>();
      for (const w of bucket) {
        for (let p = 0; p < len; p++) {
          const key = w.english.slice(0, p) + w.english.slice(p + 1);
          if (!sigMap.has(key)) sigMap.set(key, []);
          sigMap.get(key)!.push(w);
        }
      }
      for (const grp of sigMap.values()) {
        if (grp.length < 2) continue;
        for (let i = 0; i < grp.length; i++) {
          for (let j = i + 1; j < grp.length; j++) addEdge(grp[i], grp[j]);
        }
      }
    }

    // 跨相邻长度（短 bucket 长度 len，长 bucket 长度 len+1）：索引长词删一字符，去匹配短词
    const longer = buckets.get(len + 1);
    if (longer) {
      const sigMap = new Map<string, Word[]>();
      for (const w of longer) {
        for (let p = 0; p < w.english.length; p++) {
          const key = w.english.slice(0, p) + w.english.slice(p + 1);
          if (!sigMap.has(key)) sigMap.set(key, []);
          sigMap.get(key)!.push(w);
        }
      }
      for (const s of bucket) {
        const coll = sigMap.get(s.english);
        if (!coll) continue;
        for (const t of coll) addEdge(s, t);
      }
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
      const anchor = groups[groups.length - 1].find(x => isEditDistanceAtMost1(x.english, w.english));
      if (!anchor) continue;
      groups[groups.length - 1].push(w);
      used.add(w.id);
    }
  }

  return groups.filter(g => g.length >= 2);
}

/** 编辑距离是否 ≤1 的快速判定（O(L)），用于形近检测 */
function isEditDistanceAtMost1(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  // 保持 s 为较短者
  const s = a.length <= b.length ? a : b;
  const l = a.length <= b.length ? b : a;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < s.length && j < l.length) {
    if (s[i] === l[j]) {
      i++;
      j++;
    } else {
      if (++edits > 1) return false;
      if (s.length === l.length) {
        i++; // 替换
        j++;
      } else {
        j++; // 短串插入一字符（长串跳过）
      }
    }
  }
  edits += (s.length - i) + (l.length - j);
  return edits <= 1;
}