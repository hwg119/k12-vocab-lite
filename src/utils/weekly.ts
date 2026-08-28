import { StudyDayRecord } from '../types';

const MS_DAY = 24 * 60 * 60 * 1000;

export interface DailySummary {
  date: number; // dayKey
  studyCount: number;
  correctCount: number;
  totalCount: number;
  accuracy: number;
}

function dayKey(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * 展开所有打卡记录为最近 N 天的每日摘要（按 dayKey 聚合，按日期升序）
 */
export function buildDailySummaries(
  records: StudyDayRecord[],
  days: number = 7,
  now: number = Date.now(),
): DailySummary[] {
  const today = dayKey(now);
  const buckets = new Map<number, DailySummary>();
  for (let i = 0; i < days; i++) {
    buckets.set(today - i * MS_DAY, {
      date: today - i * MS_DAY,
      studyCount: 0,
      correctCount: 0,
      totalCount: 0,
      accuracy: 0,
    });
  }

  for (const r of records) {
    if (buckets.has(r.date)) {
      const b = buckets.get(r.date)!;
      b.studyCount += r.studyCount;
      b.correctCount += r.correctCount;
      b.totalCount += r.totalCount;
    }
  }
  for (const b of buckets.values()) {
    b.accuracy = b.totalCount === 0 ? 0 : b.correctCount / b.totalCount;
  }

  return Array.from(buckets.values()).sort((a, b) => a.date - b.date);
}

/**
 * 周报评语 - 基于整体数据给出简短的鼓励
 * 不夹带游戏化/排名话术，贴合高中生语境
 */
export function weeklyComment(opts: {
  accuracy: number;
  learnedCount: number;
  dailyAvg: number;
  currentStreak: number;
  longestStreak: number;
}): string {
  const { accuracy, learnedCount, dailyAvg, currentStreak, longestStreak } = opts;

  if (learnedCount === 0) return '刚开始就很好，保持今日的节奏，下周再来看。';
  if (currentStreak >= 7) return `已连续打卡 ${currentStreak} 天，最长 ${longestStreak} 天。习惯比计划更重要。`;
  if (accuracy >= 0.9 && learnedCount >= 50) return `正确率 ${(accuracy * 100).toFixed(0)}%，记得再过一遍易错本。`;
  if (dailyAvg >= 30) return `日均 ${Math.round(dailyAvg)} 词，节奏稳定。`;
  if (learnedCount >= 100) return `已掌握 ${learnedCount} 词，下一阶段冲 200。`;
  return '继续每天背一点就好，词汇是日积月累。';
}
