import { StudyDayRecord, ReviewFeedback } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function dayKey(ts: number): number {
  // 取当天 0 点（本地时区）的 timestamp 作为 key
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * 在已有打卡记录上登记一次新的活动：
 *   - 若今日已记录则累加 studyCount / correctCount / totalCount
 *   - 否则新增今日记录
 */
export function recordActivity(
  records: StudyDayRecord[],
  feedback: ReviewFeedback | 'quizAnswer',
  isCorrect: boolean,
  now: number = Date.now(),
): StudyDayRecord[] {
  const today = dayKey(now);
  const idx = records.findIndex(r => r.date === today);
  const next = [...records];

  const bump = isCorrect ? { correctCount: 1, totalCount: 1 } : { correctCount: 0, totalCount: 1 };

  if (idx === -1) {
    next.push({
      date: today,
      studyCount: feedback === 'quizAnswer' ? 0 : 1,
      correctCount: bump.correctCount,
      totalCount: bump.totalCount,
    });
  } else {
    const prev = next[idx];
    next[idx] = {
      ...prev,
      studyCount: feedback === 'quizAnswer' ? prev.studyCount : prev.studyCount + 1,
      correctCount: prev.correctCount + bump.correctCount,
      totalCount: prev.totalCount + bump.totalCount,
    };
  }

  return next;
}

/**
 * 计算最长连续打卡天数（按 dayKey 相邻）
 * 同时返回当前是否在 streak 中
 */
export function computeStreak(
  records: StudyDayRecord[],
  now: number = Date.now(),
): { longest: number; current: number } {
  if (records.length === 0) return { longest: 0, current: 0 };

  const days = [...records]
    .map(r => r.date)
    .sort((a, b) => a - b);

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] - days[i - 1] === MS_PER_DAY) {
      run += 1;
      if (run > longest) longest = run;
    } else if (days[i] === days[i - 1]) {
      // 同一天，忽略（已被上面去重）
    } else {
      run = 1;
    }
  }

  // 当前 streak：以今天或昨天为锚点向前回溯
  const today = dayKey(now);
  const yesterday = today - MS_PER_DAY;
  const lastDay = days[days.length - 1];

  let current = 0;
  if (lastDay === today || lastDay === yesterday) {
    // 从 lastDay 向前回溯连续
    current = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      if (days[i + 1] - days[i] === MS_PER_DAY) current += 1;
      else break;
    }
  }

  return { longest, current };
}

/** 累计答对的题数（所有天的总和） */
export function totalCorrect(records: StudyDayRecord[]): number {
  return records.reduce((s, r) => s + r.correctCount, 0);
}

/** 累计答题总数 */
export function totalAnswered(records: StudyDayRecord[]): number {
  return records.reduce((s, r) => s + r.totalCount, 0);
}

/** 累计整体正确率 0~1 */
export function overallAccuracy(records: StudyDayRecord[]): number {
  const t = totalAnswered(records);
  if (t === 0) return 0;
  return totalCorrect(records) / t;
}
