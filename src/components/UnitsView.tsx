import React from 'react';
import { Word, StudyUnit } from '../types';
import { STAGE_META } from '../data';
import { IconArrowLeft, IconLock, IconTrophy } from './Icons';

interface UnitsViewProps {
  stage: import('../types').Stage;
  units: StudyUnit[];
  words: Word[];
  learnedIds: Set<string>;
  onGoHome: () => void;
  /** 进入学习模式（仅该单元的单词） */
  onStartUnit: (queue: Word[]) => void;
}

/**
 * 闯关单元视图
 *
 * 布局：
 *   - 顶部：当前进度摘要
 *   - 网格：每行 4 个单元卡，3 类状态：
 *       🔒 已锁定（灰）；▶ 进行中（彩色 + 进度环）；✅ 已通关（金）
 *
 * 动效控制：仅学习卡可点击，避免误触已锁定的卡
 */
export const UnitsView: React.FC<UnitsViewProps> = ({
  stage,
  units,
  words,
  learnedIds,
  onGoHome,
  onStartUnit,
}) => {
  const meta = STAGE_META[stage];
  const colorClass = stage === 'primary' ? 'amber' : stage === 'junior' ? 'emerald' : 'indigo';

  const totalDone = units.filter(u => u.completed).length;
  const totalUnits = units.length;
  const firstOngoing = units.findIndex(u => !u.completed);

  const wordsById = new Map<string, Word>();
  for (const w of words) wordsById.set(w.id, w);

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
        <h2 className="text-xl font-bold text-slate-800">闯关 · {meta.title}英语</h2>
        <div className="w-16"></div>
      </div>

      {/* 顶部进度卡 */}
      <div className={`bg-gradient-to-br from-${colorClass}-500 to-${colorClass}-600 rounded-2xl p-6 text-white shadow-lg mb-6`}>
        <p className={`text-${colorClass}-100 text-xs uppercase tracking-wider`}>关卡进度</p>
        <div className="flex items-baseline gap-3 mt-1">
          <h3 className="text-3xl font-bold">{totalDone} / {totalUnits}</h3>
          <span className={`text-${colorClass}-100 text-sm`}>单元已通关</span>
        </div>
        <div className="mt-3 w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${totalUnits === 0 ? 0 : (totalDone / totalUnits) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 单元网格 */}
      {units.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-100">
          该学段暂无单元可闯。
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {units.map(unit => {
            const learnedInUnit = unit.wordIds.filter(id => learnedIds.has(id)).length;
            const progress = unit.wordIds.length === 0 ? 0 : learnedInUnit / unit.wordIds.length;
            const isCurrent = unit.index === firstOngoing;

            // 锁定、非当前、未完成 → 不可点击
            const locked = !unit.unlocked;
            const doneColor = unit.completed
              ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white border-amber-300'
              : locked
                ? 'bg-slate-100 text-slate-400 border-slate-200'
                : isCurrent
                  ? `bg-white border-${colorClass}-300 text-${colorClass}-700 shadow-${colorClass}-100`
                  : 'bg-white border-slate-200 text-slate-700';

            return (
              <button
                key={unit.index}
                disabled={locked}
                onClick={() => {
                  if (locked) return;
                  const queue = unit.wordIds
                    .map(id => wordsById.get(id))
                    .filter((w): w is Word => Boolean(w));
                  onStartUnit(queue);
                }}
                className={`relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${doneColor} ${
                  locked ? 'cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-lg active:scale-95'
                }`}
                aria-label={`Unit ${unit.index + 1}`}
              >
                {/* 头部 */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold font-mono">{String(unit.index + 1).padStart(2, '0')}</span>
                  {unit.completed ? (
                    <IconTrophy className="w-5 h-5" />
                  ) : locked ? (
                    <IconLock className="w-5 h-5" />
                  ) : isCurrent ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-current/10">▶ 当前</span>
                  ) : null}
                </div>
                {/* 进度 */}
                <div className="text-xs mb-1 opacity-80">
                  {learnedInUnit} / {unit.wordIds.length}
                </div>
                <div className={`w-full rounded-full h-1.5 ${unit.completed ? 'bg-white/40' : 'bg-black/10'}`}>
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${unit.completed ? 'bg-white' : `bg-${colorClass}-500`}`}
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  ></div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 说明 */}
      <div className="mt-6 text-xs text-slate-400 text-center">
        完成当前单元 80% 即解锁下一单元。点击可学习的单元即可进入专项闯关。
      </div>
    </div>
  );
};
