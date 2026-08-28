import React from 'react';
import { Achievement, AchievementId } from '../types';
import { ACHIEVEMENT_DEFS } from '../utils';
import { IconArrowLeft, IconCheck } from './Icons';

interface AchievementsViewProps {
  achievements: Achievement[];
  learnedCount: number;
  totalInStage: number;
  currentStreak: number;
  longestStreak: number;
  onGoHome: () => void;
}

/**
 * 勋章墙视图
 *
 * 设计：
 *   - 网格展示所有候选勋章
 *   - 已解锁 → 实心彩色 + 闪光
 *   - 未解锁 → 灰度 + 显示达到目标
 */
export const AchievementsView: React.FC<AchievementsViewProps> = ({
  achievements,
  learnedCount,
  totalInStage,
  currentStreak,
  longestStreak,
  onGoHome,
}) => {
  const unlockedIds = new Set(achievements.map(a => a.id));
  const allIds = Object.keys(ACHIEVEMENT_DEFS) as AchievementId[];
  const unlocked = achievements.length;

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in px-2">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          回首页
        </button>
        <h2 className="text-xl font-bold text-slate-800">勋章墙</h2>
        <div className="w-16"></div>
      </div>

      {/* 当前统计 */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg mb-6">
        <p className="text-yellow-100 text-xs uppercase tracking-wider">Achievements</p>
        <div className="flex items-baseline gap-3 mt-1">
          <h3 className="text-3xl font-bold">{unlocked}</h3>
          <span className="text-yellow-100 text-sm">/ {allIds.length} 已解锁</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div>
            <div className="text-2xl font-bold">{learnedCount}</div>
            <div className="text-yellow-100 text-xs mt-1">已掌握</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="text-yellow-100 text-xs mt-1">当前连续</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{longestStreak}</div>
            <div className="text-yellow-100 text-xs mt-1">最长连续</div>
          </div>
        </div>
        <div className="mt-3 text-yellow-100 text-xs">
          学段总词 {totalInStage}
        </div>
      </div>

      {/* 网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {allIds.map(id => {
          const def = ACHIEVEMENT_DEFS[id];
          const got = unlockedIds.has(id);
          return (
            <div
              key={id}
              className={`relative rounded-2xl p-5 text-center transition-all duration-200 border ${
                got
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-sm hover:shadow-md'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              {/* 大图标 */}
              <div className={`text-5xl mb-2 ${got ? 'animate-fade-in' : 'grayscale'}`}>
                {def.icon}
              </div>
              <h3 className={`font-bold ${got ? 'text-slate-800' : 'text-slate-500'}`}>
                {def.title}
              </h3>
              <p className={`text-xs mt-1 ${got ? 'text-slate-600' : 'text-slate-400'}`}>
                {def.description}
              </p>
              {got && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <IconCheck className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-slate-400 text-center">
        完成每日学习、答题正确率达到目标即可解锁对应勋章。
      </div>
    </div>
  );
};
