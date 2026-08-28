import { Achievement, AchievementId, StudyDayRecord } from '../types';

/**
 * 成就检测 - 纯函数
 *
 * 设计原则：
 *   - 给定当前学习状态（learnedIds / srsMap / studyDays），返回已解锁的勋章
 *   - 解锁门槛沿用你提供的需求清单：
 *       入门萌新、词汇进阶 (100/500)、全词掌握、连续打卡 7/30 天
 *
 *   - 累计解锁到的学习计数阈值时自动产出，简化为：在 hooks 层每次提交反馈都重新评估并 set。
 */

export const ACHIEVEMENT_DEFS: Record<AchievementId, Omit<Achievement, 'unlockedAt'>> = {
  starter: {
    id: 'starter',
    title: '入门萌新',
    description: '迈出第一步，掌握第一个单词',
    icon: '🌱',
  },
  'vocab-100': {
    id: 'vocab-100',
    title: '词汇进阶',
    description: '累计掌握 100 个单词',
    icon: '📚',
  },
  'vocab-500': {
    id: 'vocab-500',
    title: '高频突破',
    description: '累计掌握 500 个单词',
    icon: '🎯',
  },
  frequency: {
    id: 'frequency',
    title: '正确率之王',
    description: '累计答题正确率达到 90% 以上',
    icon: '🏆',
  },
  completionist: {
    id: 'completionist',
    title: '学段全词掌握',
    description: '掌握本学段全部单词',
    icon: '👑',
  },
  'streak-7': {
    id: 'streak-7',
    title: '连续打卡 7 天',
    description: '保持一周学习习惯',
    icon: '🔥',
  },
  'streak-30': {
    id: 'streak-30',
    title: '连续打卡 30 天',
    description: '一个月不间断',
    icon: '💎',
  },
};

export interface AchievementContext {
  learnedCount: number;
  totalInStage: number;
  studyDays: StudyDayRecord[];
  longestStreak: number;
  overallAccuracy: number;
}

/**
 * 评估当前状态，返回已解锁的 Achievement 列表（按阈值递增排序）
 */
export function evaluateAchievements(ctx: AchievementContext): Achievement[] {
  const out: Achievement[] = [];
  const { learnedCount, totalInStage, longestStreak, overallAccuracy } = ctx;
  const now = Date.now();

  if (learnedCount >= 1) out.push({ ...ACHIEVEMENT_DEFS.starter, unlockedAt: now });
  if (learnedCount >= 100) out.push({ ...ACHIEVEMENT_DEFS['vocab-100'], unlockedAt: now });
  if (learnedCount >= 500) out.push({ ...ACHIEVEMENT_DEFS['vocab-500'], unlockedAt: now });
  if (overallAccuracy >= 0.9 && learnedCount >= 50) out.push({ ...ACHIEVEMENT_DEFS.frequency, unlockedAt: now });
  if (totalInStage > 0 && learnedCount >= totalInStage) out.push({ ...ACHIEVEMENT_DEFS.completionist, unlockedAt: now });
  if (longestStreak >= 7) out.push({ ...ACHIEVEMENT_DEFS['streak-7'], unlockedAt: now });
  if (longestStreak >= 30) out.push({ ...ACHIEVEMENT_DEFS['streak-30'], unlockedAt: now });

  return out;
}

/** 学段进度摘要 - 用于 Dashboard 周报与统计视图 */
export interface StageSummary {
  learnedCount: number;
  totalInStage: number;
  progressPct: number;
  mistakeCount: number;
  dueCount: number;
  longestStreak: number;
  currentStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  unitsCompleted: number;
  unitsTotal: number;
  achievements: Achievement[];
}
