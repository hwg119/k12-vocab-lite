import React, { useMemo, useState } from 'react';
import { Word, SrsState } from '../types';
import { wordKey } from '../utils';
import { IconArrowLeft, IconSearch, IconCheck } from './Icons';

type TimeFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'older';

interface LearnedViewProps {
  words: Word[];
  learnedIds: Set<string>;
  srsMap: Record<string, SrsState>;
  onGoHome: () => void;
}

const FILTERS: { key: TimeFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'today', label: '今日' },
  { key: 'yesterday', label: '昨日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'older', label: '一个月前' },
];

/** 获取一天开始的时间戳（00:00:00） */
function dayStart(daysAgo: number = 0): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.getTime();
}

export const LearnedView: React.FC<LearnedViewProps> = ({
  words,
  learnedIds,
  srsMap,
  onGoHome,
}) => {
  const [filter, setFilter] = useState<TimeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 筛选出已掌握的单词，并附带 lastReviewedAt
  const learnedWords = useMemo(() => {
    return words
      .filter(w => {
        const key = wordKey(w);
        return learnedIds.has(key) || learnedIds.has(w.id);
      })
      .map(w => {
        const key = wordKey(w);
        const srs = srsMap[key] ?? srsMap[w.id];
        return { word: w, lastReviewedAt: srs?.lastReviewedAt ?? 0 };
      });
  }, [words, learnedIds, srsMap]);

  // 按时间过滤
  const filteredWords = useMemo(() => {
    const today = dayStart(0);
    const yesterday = dayStart(1);
    const weekStart = dayStart(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
    const monthStart = (() => {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })();
    const oneMonthAgo = dayStart(30);

    return learnedWords
      .filter(({ lastReviewedAt }) => {
        if (filter === 'all') return true;
        // 未经过复习的词（手动标记）不参与时间段筛选
        if (lastReviewedAt === 0) return false;
        switch (filter) {
          case 'today': return lastReviewedAt >= today;
          case 'yesterday': return lastReviewedAt >= yesterday && lastReviewedAt < today;
          case 'week': return lastReviewedAt >= weekStart;
          case 'month': return lastReviewedAt >= monthStart;
          case 'older': return lastReviewedAt < oneMonthAgo;
          default: return true;
        }
      })
      .sort((a, b) => b.lastReviewedAt - a.lastReviewedAt);
  }, [learnedWords, filter]);

  // 搜索过滤
  const displayedWords = useMemo(() => {
    if (!searchTerm) return filteredWords;
    const term = searchTerm.toLowerCase();
    return filteredWords.filter(({ word }) =>
      word.english.toLowerCase().includes(term) || word.chinese.includes(term)
    );
  }, [filteredWords, searchTerm]);

  // 各过滤器的数量
  const counts = useMemo(() => {
    const today = dayStart(0);
    const yesterday = dayStart(1);
    const weekStart = dayStart(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
    const monthStart = (() => {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })();

    const c = { all: 0, today: 0, yesterday: 0, week: 0, month: 0, older: 0 };
    for (const { lastReviewedAt } of learnedWords) {
      c.all++;
      if (lastReviewedAt === 0) continue; // 未复习的不计入时间段
      if (lastReviewedAt >= today) c.today++;
      else if (lastReviewedAt >= yesterday) c.yesterday++;
      else if (lastReviewedAt >= weekStart) c.week++;
      else if (lastReviewedAt >= monthStart) c.month++;
      else c.older++;
    }
    return c;
  }, [learnedWords]);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-fade-in w-full max-w-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-100 bg-white sticky top-0 z-20 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onGoHome}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <IconArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="font-bold text-base sm:text-lg text-slate-800">已掌握</h2>
          </div>
          <span className="text-xs font-medium bg-emerald-100 px-2 py-1 rounded text-emerald-600">
            {learnedWords.length} words
          </span>
        </div>

        {/* 时间过滤 chips */}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={[
                'text-xs px-2.5 py-1 rounded-full border transition-colors',
                filter === f.key
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600',
              ].join(' ')}
            >
              {f.label}
              <span className="ml-1 opacity-70">{counts[f.key]}</span>
            </button>
          ))}
        </div>

        {/* 搜索 */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <IconSearch />
          </div>
          <input
            type="text"
            placeholder="Search words..."
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Word List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="divide-y divide-slate-50">
          {displayedWords.map(({ word, lastReviewedAt }) => (
            <div
              key={word.id}
              className="p-3 sm:p-4 hover:bg-slate-50 flex items-start justify-between gap-2 sm:gap-4 group transition-colors duration-200"
            >
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                  <span className="font-bold text-slate-800 text-base sm:text-lg break-all">{word.english}</span>
                  <span className="font-mono text-slate-400 text-xs sm:text-sm shrink-0">{word.phonetic}</span>
                </div>
                <div className="text-sm text-slate-600 mt-1 leading-relaxed break-words">{word.chinese}</div>
                {lastReviewedAt > 0 && (
                  <div className="text-[10px] text-slate-400 mt-1">
                    {formatTimeAgo(lastReviewedAt)}
                  </div>
                )}
              </div>
              <div className="shrink-0 flex flex-col items-center gap-1">
                <span className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <IconCheck />
                </span>
              </div>
            </div>
          ))}
        </div>

        {displayedWords.length === 0 && (
          <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
            <IconCheck />
            <p>{filter === 'all' ? '暂无已掌握的单词' : '该时间段暂无已掌握的单词'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/** 格式化时间为 "x 分钟前" / "x 小时前" / "x 天前" 等 */
function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  const months = Math.floor(days / 30);
  return `${months} 个月前`;
}
