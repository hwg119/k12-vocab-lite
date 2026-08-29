import React, { useMemo, useState } from 'react';
import { Word } from '../types';
import { groupConfusionPairs, highlightDiff } from '../utils';
import type { ConfusionGroup } from '../utils/confusion';
import { IconArrowLeft, IconSearch, IconX } from './Icons';

interface ConfusionViewProps {
  words: Word[];
  onGoHome: () => void;
  /** 进入学习模式（只学该配对里的词） */
  onStartPair: (queue: Word[]) => void;
}

/**
 * 易混词对比视图
 *
 * 布局（v2）：
 *   - 顶部：返回 + 标题 + 搜索框
 *   - 过滤栏：全部 / 仅 2 词组 / 仅 3 词组
 *   - 卡片网格：每组一张大卡片，词并排展示
 *   - 字符级差异高亮：形近词不同位置的字母用黄色背景标记
 */
export const ConfusionView: React.FC<ConfusionViewProps> = ({
  words,
  onGoHome,
  onStartPair,
}) => {
  const groups = useMemo<ConfusionGroup[]>(() => groupConfusionPairs(words), [words]);

  // 搜索 + 筛选
  const [keyword, setKeyword] = useState('');
  const [sizeFilter, setSizeFilter] = useState<'all' | '2' | '3+'>('all');

  const filtered = useMemo<ConfusionGroup[]>(() => {
    const kw = keyword.trim().toLowerCase();
    return groups.filter(g => {
      if (sizeFilter === '2' && g.members.length !== 2) return false;
      if (sizeFilter === '3+' && g.members.length < 3) return false;
      if (!kw) return true;
      return g.members.some(w =>
        w.english.toLowerCase().includes(kw) ||
        w.chinese.includes(kw)
      );
    });
  }, [groups, keyword, sizeFilter]);

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in px-2">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          回首页
        </button>
        <h2 className="text-xl font-bold text-slate-800">易混词对比</h2>
        <div className="w-16"></div>
      </div>

      {/* 搜索 + 筛选 */}
      {groups.length > 0 && (
        <div className="mb-4 space-y-2">
          {/* 搜索框 */}
          <div className="relative">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="搜索英文或中文..."
              className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <IconX className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* 筛选标签 */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">筛选：</span>
            {([
              { key: 'all', label: `全部 (${groups.length})` },
              { key: '2', label: `仅 2 词组 (${groups.filter(g => g.members.length === 2).length})` },
              { key: '3+', label: `3 词及以上 (${groups.filter(g => g.members.length >= 3).length})` },
            ] as const).map(opt => (
              <button
                key={opt.key}
                onClick={() => setSizeFilter(opt.key)}
                className={`px-3 py-1 rounded-full border transition-colors ${
                  sizeFilter === opt.key
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 列表 / 空态 */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <div className="text-4xl mb-3">🧩</div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">该学段暂无易混词配对</h3>
          <p className="text-slate-500 text-sm">
            形近/义近的单词会在数据里通过 <code className="bg-slate-100 px-1 rounded">confusionGroupId</code> 自动配对。
            词库种子数据已带部分配对，完整词库补齐后即可显示。
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <div className="text-2xl mb-2">🔍</div>
          <p className="text-slate-500 text-sm">没有匹配的易混词配对。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((g, i) => (
            <CompareCard
              key={`${g.members.map(m => m.id).join('-')}-${i}`}
              group={g}
              onStart={() => onStartPair(g.members)}
            />
          ))}
        </div>
      )}

      <div className="mt-6 text-xs text-slate-400 text-center">
        黄色高亮 = 形近词的差异字符 · 点击"进入学习"可专项攻克该组
      </div>
    </div>
  );
};

/**
 * 单个对照卡：成员并排展示，差异字符黄色高亮
 */
const CompareCard: React.FC<{
  group: ConfusionGroup;
  onStart: () => void;
}> = ({ group, onStart }) => {
  const diffs = useMemo(
    () => highlightDiff(group.members.map(w => w.english)),
    [group.members],
  );

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      {/* 头部：组号 + 学习入口 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
          配对 · {group.members.length} 词
        </span>
        <button
          onClick={onStart}
          className="text-xs font-medium text-indigo-600 hover:text-white hover:bg-indigo-600 px-2 py-1 rounded-md transition-colors border border-indigo-200"
        >
          进入学习 →
        </button>
      </div>

      {/* 并排展示 */}
      <div className="space-y-2">
        {group.members.map((w, idx) => (
          <div key={w.id} className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
            {/* 英文（差异高亮） */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-bold text-slate-800 text-lg leading-none">
                {diffs[idx].map((c, i) => (
                  <span
                    key={i}
                    className={c.diff ? 'bg-amber-200 text-slate-900 rounded px-0.5' : ''}
                    title={c.diff ? '差异字符' : undefined}
                  >
                    {c.ch}
                  </span>
                ))}
              </span>
              <span className="text-xs text-indigo-500 font-mono">{w.phonetic}</span>
            </div>
            {/* 中文 */}
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{w.chinese}</p>
          </div>
        ))}
      </div>
    </div>
  );
};