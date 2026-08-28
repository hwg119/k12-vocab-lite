import React, { useMemo } from 'react';
import { Word, Stage } from '../types';
import { STAGE_META } from '../data';
import { getStageColors } from '../utils/colors';
import { weeklyComment } from '../utils/weekly';
import { IconArrowLeft } from './Icons';

interface StatsViewProps {
  stage: Stage;
  words: Word[];
  learnedIds: Set<string>;
  mistakeIds: string[];
  dueCount: number;
  totalCorrect: number;
  totalAnswered: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  unitsCompleted: number;
  unitsTotal: number;
  achievementsCount: number;
  recentDays: { date: number; studyCount: number; correctCount: number; totalCount: number; accuracy: number }[];
  onGoHome: () => void;
}

/**
 * 数据周报 / 学习统计
 *
 * 三块：
 *   1. 顶部：本学段 4 类进度（已掌握 / 待复习 / 易错 / 未学习）
 *   2. 近 7 日柱状图（每日学习量 + 正确率提示线）
 *   3. 周报评语卡 + 总数据网格
 */
export const StatsView: React.FC<StatsViewProps> = ({
  stage,
  words,
  learnedIds,
  mistakeIds,
  dueCount,
  totalCorrect,
  totalAnswered,
  accuracy,
  currentStreak,
  longestStreak,
  unitsCompleted,
  unitsTotal,
  achievementsCount,
  recentDays,
  onGoHome,
}) => {
  const meta = STAGE_META[stage];
  const colors = getStageColors(stage);

  // 4 类互斥切分
  const total = words.length;
  const learned = learnedIds.size;
  // 易错词中未掌握的
  const mistakeUnlearned = mistakeIds.filter(id => !learnedIds.has(id)).length;
  // 待复习 = dueCount 中未掌握的部分（已掌握一般不再"待复习"）
  const dueUnlearned = Math.min(dueCount, total - learned); // 估算
  // 未学习 = 剩下的
  const unlearned = Math.max(0, total - learned - mistakeUnlearned - dueUnlearned);

  // 学习摘要统计
  const totalLearned = learned;
  const dailyAvg = recentDays.reduce((s, d) => s + d.studyCount, 0) / Math.max(recentDays.length, 1);

  const comment = useMemo(
    () => weeklyComment({
      accuracy,
      learnedCount: totalLearned,
      dailyAvg,
      currentStreak,
      longestStreak,
    }),
    [accuracy, totalLearned, dailyAvg, currentStreak, longestStreak],
  );

  const maxStudy = Math.max(...recentDays.map(d => d.studyCount), 1);

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in px-2">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          回首页
        </button>
        <h2 className="text-xl font-bold text-slate-800">{meta.title}学段 · 数据周报</h2>
        <div className="w-16"></div>
      </div>

      {/* 4 类进度 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Tile label="已掌握" value={learned} total={total} colorClass={stage} bar={learned / Math.max(total, 1)} />
        <Tile label="待复习" value={dueUnlearned} total={total} colorClass="amber" bar={dueUnlearned / Math.max(total, 1)} />
        <Tile label="易错词" value={mistakeUnlearned} total={total} colorClass="rose" bar={mistakeUnlearned / Math.max(total, 1)} />
        <Tile label="未学习" value={unlearned} total={total} colorClass="slate" bar={unlearned / Math.max(total, 1)} />
      </div>

      {/* 周柱状图 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">近 7 日学习节奏</h3>
        <div className="grid grid-cols-7 gap-2 items-end h-32">
          {recentDays.map((d, i) => {
            const heightPct = (d.studyCount / maxStudy) * 100;
            const day = new Date(d.date).getDate();
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="text-xs text-slate-400">{d.studyCount}</div>
                <div className="w-full bg-slate-100 rounded-md overflow-hidden flex-1 flex items-end">
                  <div
                    className={`w-full ${colors.bar} transition-all duration-500`}
                    style={{ height: `${heightPct}%`, minHeight: d.studyCount > 0 ? '4px' : '0px' }}
                    title={`${day} 日 - ${d.studyCount} 学习`}
                  ></div>
                </div>
                <div className="text-xs text-slate-500">{day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 周报评语 */}
      <div className={`bg-gradient-to-br ${colors.gradientLight} rounded-2xl p-6 mb-6 border ${colors.border}`}>
        <p className={`text-xs uppercase tracking-wider ${colors.textMuted} mb-2`}>Weekly Insight</p>
        <p className={`${colors.textMuted} text-base font-medium leading-relaxed`}>
          {comment}
        </p>
      </div>

      {/* 数据网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <NumberTile label="累计掌握" value={learned} />
        <NumberTile label="答题正确率" value={`${(accuracy * 100).toFixed(0)}%`} />
        <NumberTile label="累计答题" value={totalAnswered} />
        <NumberTile label="当前连续" value={currentStreak} suffix="天" />
        <NumberTile label="最长连续" value={longestStreak} suffix="天" />
        <NumberTile label="已通关单元" value={`${unitsCompleted}/${unitsTotal}`} />
        <NumberTile label="已解锁勋章" value={`${achievementsCount}/7`} />
        <NumberTile label="日均学习" value={Math.round(dailyAvg)} suffix="词" />
        <NumberTile label="总正确题数" value={totalCorrect} />
      </div>
    </div>
  );
};

function Tile({ label, value, total, colorClass, bar }: {
  label: string;
  value: number;
  total: number;
  colorClass: 'amber' | 'emerald' | 'rose' | 'indigo' | 'slate';
  bar: number;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  const colorBar: Record<typeof colorClass, string> = {
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    indigo: 'bg-indigo-500',
    slate: 'bg-slate-400',
  } as const;
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <p className="text-xs text-slate-500 uppercase">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{pct}%</p>
      <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${colorBar[colorClass]} transition-all duration-500`} style={{ width: `${Math.min(100, Math.round(bar * 100))}%` }}></div>
      </div>
    </div>
  );
}

function NumberTile({ label, value, suffix }: {
  label: string;
  value: number | string;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <p className="text-xs text-slate-500 uppercase">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">
        {value}
        {suffix && <span className="text-base text-slate-400 font-normal ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
