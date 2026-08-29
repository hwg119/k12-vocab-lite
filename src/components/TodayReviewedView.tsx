import React, { useMemo } from 'react';
import { Word, SrsState } from '../types';
import { wordKey } from '../utils';
import { IconArrowLeft, IconCheck, IconClock } from './Icons';

interface TodayReviewedViewProps {
  words: Word[];
  /** 今日已复习的 wordKey 列表（按复习顺序） */
  reviewedIds: string[];
  learnedIds: Set<string>;
  srsMap: Record<string, SrsState>;
  onGoHome: () => void;
  onMarkLearned: (wordOrId: Word | string) => void;
  onUnmarkLearned: (wordOrId: Word | string) => void;
}

export const TodayReviewedView: React.FC<TodayReviewedViewProps> = ({
  words,
  reviewedIds,
  learnedIds,
  srsMap,
  onGoHome,
  onMarkLearned,
  onUnmarkLearned,
}) => {
  // 按复习顺序取出单词（从 reviewedIds 映射到实际 Word 对象）
  const reviewedWords = useMemo(() => {
    const byKey = new Map<string, Word>();
    for (const w of words) {
      byKey.set(wordKey(w), w);
      byKey.set(w.id, w);
    }
    const result: Array<{ word: Word; lastReviewedAt: number; isLearned: boolean }> = [];
    const seen = new Set<string>();
    for (const id of reviewedIds) {
      const w = byKey.get(id);
      if (!w) continue;
      const k = wordKey(w);
      if (seen.has(k)) continue;
      seen.add(k);
      const srs = srsMap[k] ?? srsMap[w.id];
      result.push({
        word: w,
        lastReviewedAt: srs?.lastReviewedAt ?? 0,
        isLearned: learnedIds.has(k) || learnedIds.has(w.id),
      });
    }
    // 按复习时间倒序（最近复习的在前）
    result.sort((a, b) => b.lastReviewedAt - a.lastReviewedAt);
    return result;
  }, [words, reviewedIds, srsMap, learnedIds]);

  const masteredCount = reviewedWords.filter(r => r.isLearned).length;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[60vh] sm:min-h-[70vh] animate-fade-in w-full max-w-full self-stretch">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onGoHome}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <IconArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="font-bold text-base sm:text-lg text-slate-800">今日已复习</h2>
          </div>
          <span className="text-xs font-medium bg-emerald-100 px-2 py-1 rounded text-emerald-600">
            {reviewedWords.length} words
          </span>
        </div>
        {/* 统计条 */}
        <div className="mt-3 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <IconCheck className="w-3.5 h-3.5" />
            <span>已掌握 <b>{masteredCount}</b></span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600">
            <IconClock className="w-3.5 h-3.5" />
            <span>复习中 <b>{reviewedWords.length - masteredCount}</b></span>
          </div>
        </div>
      </div>

      {/* Word List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="divide-y divide-slate-50">
          {reviewedWords.map(({ word, lastReviewedAt, isLearned }) => (
            <div
              key={word.id}
              className="p-3 sm:p-4 hover:bg-slate-50 flex items-start justify-between gap-2 sm:gap-4 group transition-colors duration-200"
            >
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                  <span className="font-bold text-slate-800 text-base sm:text-lg break-all">{word.english}</span>
                  <span className="font-mono text-slate-400 text-xs sm:text-sm shrink-0">{word.phonetic}</span>
                </div>
                <div className="text-sm text-slate-600 mt-1 leading-relaxed break-words whitespace-pre-wrap">
                  {word.chinese}
                </div>
                {word.mnemonic && (
                  <div className="text-xs text-amber-700 mt-1 italic bg-amber-50 inline-block px-2 py-0.5 rounded border border-amber-100">
                    💡 {word.mnemonic}
                  </div>
                )}
                <div className="mt-1.5 text-[10px] text-slate-400">
                  {lastReviewedAt > 0 ? (
                    <span title={new Date(lastReviewedAt).toLocaleString()}>
                      上次复习 {formatTimeAgo(lastReviewedAt)}
                    </span>
                  ) : (
                    <span>今日新学</span>
                  )}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-center gap-1">
                {isLearned ? (
                  <button
                    onClick={() => onUnmarkLearned(word)}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 text-white hover:bg-rose-100 hover:text-rose-600 active:scale-90 rounded-full flex items-center justify-center transition-all shadow-sm"
                    title="取消已掌握"
                  >
                    <IconCheck />
                  </button>
                ) : (
                  <button
                    onClick={() => onMarkLearned(word)}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-200 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 active:scale-90 rounded-full flex items-center justify-center transition-all border border-slate-300"
                    title="标记已掌握"
                  >
                    <IconCheck />
                  </button>
                )}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                  isLearned
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  {isLearned ? '已掌握' : '复习中'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {reviewedWords.length === 0 && (
          <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
            <IconClock />
            <p>今日还没有复习记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}
