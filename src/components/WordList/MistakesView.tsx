import React from 'react';
import { Word, SrsState } from '../../types';
import { IconArrowLeft } from '../Icons';

interface MistakesViewProps {
  words: Word[];
  mistakeIds: string[];
  srsMap: Record<string, SrsState>;
  onGoHome: () => void;
  /** 进入专项复习 - 直接复用 StudyMode 的队列模式 */
  onStartReview: (queue: Word[]) => void;
}

/**
 * 易错生词本视图
 *
 * - 自动汇总本学段标记为「易错」的单词
 * - 按错误次数降序
 * - 支持"专项复习"按钮：把易错词队列灌给学习模式
 */
export const MistakesView: React.FC<MistakesViewProps> = ({
  words,
  mistakeIds,
  srsMap,
  onGoHome,
  onStartReview,
}) => {
  // 按错误次数降序 + 提取有效单词
  const sortedWords = mistakeIds
    .map(id => {
      const w = words.find(x => x.id === id);
      if (!w) return null;
      const srs = srsMap[id];
      return { word: w, wrong: srs?.wrongCount ?? 0 };
    })
    .filter((x): x is { word: Word; wrong: number } => x !== null && x.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong);

  const total = sortedWords.length;
  const reviewableQueue = sortedWords.map(s => s.word);

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in px-2">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          Back Home
        </button>
        <h2 className="text-xl font-bold text-slate-800">易错生词本</h2>
        <div className="w-16"></div>
      </div>

      {total === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🎯
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">暂无易错词</h3>
          <p className="text-slate-500 text-sm">
            回答时标记"模糊"或"不认识"的词会自动收纳到这里，便于专项攻克。
          </p>
        </div>
      ) : (
        <>
          {/* 统计卡片 + 专项复习按钮 */}
          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg mb-6">
            <p className="text-rose-100 text-xs uppercase tracking-wider">Mistakes Collection</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-4xl font-bold">{total}</h3>
              <span className="text-rose-200 text-sm">words to tackle</span>
            </div>
            <button
              onClick={() => onStartReview(reviewableQueue)}
              className="mt-4 w-full py-2.5 bg-white text-rose-600 font-semibold rounded-lg hover:bg-rose-50 transition-colors"
            >
              开始专项复习
            </button>
          </div>

          {/* 列表 */}
          <ul className="space-y-2">
            {sortedWords.map(({ word, wrong }) => (
              <li
                key={word.id}
                className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-800">{word.english}</span>
                    <span className="text-xs text-indigo-500 font-mono">{word.phonetic}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{word.chinese}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-mono text-rose-600 bg-rose-50 rounded-full border border-rose-100">
                    ×{wrong}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
