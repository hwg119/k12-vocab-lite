import { ReviewFeedback, SrsState, SpellingDim } from '../types';
import { shuffleArray } from './array';

/**
 * 间隔重复算法（SM2 简化版 - 二档反馈）
 *
 * 反馈语义：
 *   know    → 完整 SM2 进展，EF 微增
 *   unknown → 重置进度 + EF 扣减 + 错误次数 +1
 *
 * 设计要点：
 *   - 二档减少学生"模糊 vs 不认识"的纠结
 *   - 间隔起步 1 天，第二次复习 6 天，之后 round(prev_interval * EF)
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

/** 反馈信号 → SM2 质量评分 */
export const FEEDBACK_QUALITY: Record<ReviewFeedback, number> = {
  know: 5,
  unknown: 1,
};

/** 创建一个全新的 SRS 初始状态（dueAt=0 表示到期可立即复习） */
export function createInitialSrs(): SrsState {
  return {
    repetitions: 0,
    easeFactor: DEFAULT_EASE,
    intervalDays: 0,
    dueAt: 0,
    lastReviewedAt: 0,
    wrongCount: 0,
  };
}

/**
 * 应用一次复习反馈，返回新状态。
 * 纯函数：不修改输入对象。
 */
export function applyReview(
  prev: SrsState,
  feedback: ReviewFeedback,
  now: number = Date.now(),
): SrsState {
  let { repetitions, easeFactor, intervalDays, wrongCount } = prev;

  if (feedback === 'know') {
    // SM2 进展
    easeFactor = Math.min(3.0, easeFactor + 0.1);
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 6;
    else intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
    repetitions += 1;
  } else {
    // 'unknown' - 答错，重置进度并扣 EF
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.25);
    repetitions = 0;
    intervalDays = 1;
    wrongCount += 1;
  }

  return {
    repetitions,
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays,
    dueAt: now + intervalDays * MS_PER_DAY,
    lastReviewedAt: now,
    wrongCount,
  };
}

/** 当前是否到期（dueAt=0 视为新词，立即到期） */
export function isDue(state: SrsState | undefined, now: number = Date.now()): boolean {
  if (!state) return true;
  return state.dueAt === 0 || state.dueAt <= now;
}

/**
 * 从词库中按 SRS 优先级挑选待复习单词：
 *   1. 到期词优先（包括错词、新词）
 *   2. 然后从未学过的词里随机补充
 *   3. 最后补充远期未到期词
 * 返回不超过 limit 个的混合队列
 */
export function selectDueWords(
  words: { id: string }[],
  srsMap: Record<string, SrsState>,
  limit: number,
  now: number = Date.now(),
): string[] {
  const due: string[] = [];
  const fresh: string[] = [];
  const future: string[] = [];

  for (const w of words) {
    const state = srsMap[w.id];
    if (!state) {
      fresh.push(w.id);
    } else if (isDue(state, now)) {
      due.push(w.id);
    } else {
      future.push(w.id);
    }
  }

  const mixed = [
    ...shuffleArray(due),
    ...shuffleArray(fresh),
    ...shuffleArray(future),
  ];
  return mixed.slice(0, limit);
}

/**
 * 错词出本所需连续答对数（按累计错误次数分档）。
 * - 轻度(≤2)：1 次 → 即时出本，保留即时成就感
 * - 中度(3-5)：2 次 → 二次间隔巩固
 * - 重度(≥6)：3 次 → 三次间隔巩固，充分强化记忆
 */
export function graduationThreshold(wrongCount: number): number {
  if (wrongCount <= 2) return 1;
  if (wrongCount <= 5) return 2;
  return 3;
}

/**
 * 判断错词是否可出本：连续答对数已达该错次对应的阈值。
 * repetitions 即 SM2 中的连续答对数——每次 know 递增、unknown 重置为 0，
 * 因此天然反映"间隔复习中连续答对"的次数。
 */
export function shouldGraduateFromMistakes(state: SrsState): boolean {
  return state.repetitions >= graduationThreshold(state.wrongCount);
}

/**
 * 拼写维度的初始状态（可选，延后创建）
 */
export function createInitialSpelling(): SpellingDim {
  return { repetitions: 0, wrongCount: 0, dueAt: 0 };
}

/**
 * 应用一次拼写反馈（拼写训练·点选式），只更新拼写维度，不影响词义 SRS 进度。
 * - feedback === 'know'（拼写正确）→ 连续答对 +1，进入下一个间隔复习
 * - 其余（拼写错误，SpellingMode 传 unknown）→ 连续答对清零、错误 +1、次日复习
 */
export function applySpellingReview(
  prev: SpellingDim | undefined,
  feedback: ReviewFeedback,
  now: number = Date.now(),
): SpellingDim {
  const base = prev ?? createInitialSpelling();
  if (feedback === 'know') {
    const intervalDays = base.repetitions === 0 ? 1 : base.repetitions === 1 ? 3 : 6;
    return {
      repetitions: base.repetitions + 1,
      wrongCount: base.wrongCount,
      dueAt: now + intervalDays * MS_PER_DAY,
    };
  }
  return {
    repetitions: 0,
    wrongCount: base.wrongCount + 1,
    dueAt: now + MS_PER_DAY,
  };
}

/**
 * 拼写维度是否"拼写攻克"：拼写连续答对数已达该拼写错次对应的阈值。
 * 复用错词出本分档（wrongCount 越小所需答对数越少）。
 */
export function shouldGraduateSpelling(state: SrsState | undefined): boolean {
  const sp = state?.spelling;
  if (!sp || sp.repetitions === 0) return false;
  return sp.repetitions >= graduationThreshold(sp.wrongCount);
}

/** 错词排行：按 wrongCount 降序，取前 N 个 id */
export function pickMistakes(
  words: { id: string }[],
  srsMap: Record<string, SrsState>,
  limit: number,
): string[] {
  const ranked = words
    .map(w => ({ id: w.id, wrong: srsMap[w.id]?.wrongCount ?? 0 }))
    .filter(w => w.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong);
  return ranked.slice(0, limit).map(w => w.id);
}
