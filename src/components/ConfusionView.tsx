import React, { useMemo, useState } from 'react';
import { Word, SrsState } from '../types';
import { groupConfusionPairs, highlightDiff } from '../utils';
import type { ConfusionGroup } from '../utils/confusion';
import { IconArrowLeft, IconSearch, IconX } from './Icons';

interface ConfusionViewProps {
  words: Word[];
  onGoHome: () => void;
  /** 进入学习模式（只学该配对里的词） */
  onStartPair: (queue: Word[]) => void;
  /** 当前学段的 SRS 映射，用于计算"距上次复习天数" */
  srsMap?: Record<string, SrsState>;
  /** 已学单词 ID 集合，用于计算混淆风险中的已学比例 */
  learnedIds?: Set<string>;
}

/** 混淆风险筛选档位 */
type RiskBucket = 'all' | '1' | '2' | '3' | '4' | '5';
/** 差异字符数筛选档位 */
type DiffBucket = 'all' | '1' | '2' | '3+';
/** 复习间隔筛选档位 */
type ReviewBucket = 'all' | 'never' | 'week' | 'month' | 'older';

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
  srsMap,
  learnedIds,
}) => {
  const groups = useMemo<ConfusionGroup[]>(
    () => groupConfusionPairs(words, { srsMap, learnedIds }),
    [words, srsMap, learnedIds],
  );

  // 搜索 + 多维筛选
  const [keyword, setKeyword] = useState('');
  const [sizeFilter, setSizeFilter] = useState<'all' | '2' | '3+'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<RiskBucket>('all');
  const [diffFilter, setDiffFilter] = useState<DiffBucket>('all');
  const [reviewFilter, setReviewFilter] = useState<ReviewBucket>('all');

  /**
   * 混淆风险匹配：单一值精确匹配
   */
  const matchRisk = (risk: number, bucket: RiskBucket): boolean => {
    if (bucket === 'all') return true;
    return risk === Number(bucket);
  };

  /** 差异字符数匹配 */
  const matchDiff = (n: number, bucket: DiffBucket): boolean => {
    if (bucket === 'all') return true;
    if (bucket === '1') return n === 1;
    if (bucket === '2') return n === 2;
    return n >= 3;
  };

  /**
   * 复习间隔匹配：
   *   - never:  从未复习（daysSinceReview === Infinity）
   *   - week:   <= 7 天
   *   - month:  8 ~ 30 天
   *   - older:  > 30 天
   */
  const matchReview = (days: number, bucket: ReviewBucket): boolean => {
    if (bucket === 'all') return true;
    if (bucket === 'never') return !Number.isFinite(days);
    if (Number.isFinite(days)) {
      if (bucket === 'week') return days <= 7;
      if (bucket === 'month') return days > 7 && days <= 30;
      if (bucket === 'older') return days > 30;
    }
    return false;
  };

  /** 筛选维度 chip 计数（避免每帧多次全表扫描） */
  const chipCounts = useMemo(() => ({
    risk1: groups.filter(g => g.confusionRisk === 1).length,
    risk2: groups.filter(g => g.confusionRisk === 2).length,
    risk3: groups.filter(g => g.confusionRisk === 3).length,
    risk4: groups.filter(g => g.confusionRisk === 4).length,
    risk5: groups.filter(g => g.confusionRisk === 5).length,
    diff1: groups.filter(g => g.diffCount === 1).length,
    diff2: groups.filter(g => g.diffCount === 2).length,
    diff3: groups.filter(g => g.diffCount >= 3).length,
    reviewNever: groups.filter(g => !Number.isFinite(g.daysSinceReview)).length,
    reviewWeek: groups.filter(g => Number.isFinite(g.daysSinceReview) && g.daysSinceReview <= 7).length,
    reviewMonth: groups.filter(g => Number.isFinite(g.daysSinceReview) && g.daysSinceReview > 7 && g.daysSinceReview <= 30).length,
    reviewOlder: groups.filter(g => Number.isFinite(g.daysSinceReview) && g.daysSinceReview > 30).length,
  }), [groups]);

  const filtered = useMemo<ConfusionGroup[]>(() => {
    const kw = keyword.trim().toLowerCase();
    return groups.filter(g => {
      if (sizeFilter === '2' && g.members.length !== 2) return false;
      if (sizeFilter === '3+' && g.members.length < 3) return false;
      if (!matchRisk(g.confusionRisk, difficultyFilter)) return false;
      if (!matchDiff(g.diffCount, diffFilter)) return false;
      if (!matchReview(g.daysSinceReview, reviewFilter)) return false;
      if (!kw) return true;
      return g.members.some(w =>
        w.english.toLowerCase().includes(kw) ||
        w.chinese.includes(kw)
      );
    });
  }, [groups, keyword, sizeFilter, difficultyFilter, diffFilter, reviewFilter]);

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in px-2 self-stretch min-h-[60vh] sm:min-h-[70vh] flex flex-col">
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
          {/* 筛选标签 - 多行 */}
          <FilterRow label="词组">
            {([
              { key: 'all', label: `全部 (${groups.length})` },
              { key: '2', label: `仅 2 词 (${groups.filter(g => g.members.length === 2).length})` },
              { key: '3+', label: `3 词及以上 (${groups.filter(g => g.members.length >= 3).length})` },
            ] as const).map(opt => (
              <Chip
                key={opt.key}
                active={sizeFilter === opt.key}
                onClick={() => setSizeFilter(opt.key)}
                label={opt.label}
              />
            ))}
          </FilterRow>

          {/* 混淆风险 */}
          <FilterRow label="风险">
            {([
              { key: 'all', label: '全部' },
              { key: '1', label: `1 低 (${chipCounts.risk1})` },
              { key: '2', label: `2 (${chipCounts.risk2})` },
              { key: '3', label: `3 (${chipCounts.risk3})` },
              { key: '4', label: `4 (${chipCounts.risk4})` },
              { key: '5', label: `5 高 (${chipCounts.risk5})` },
            ] as const).map(opt => (
              <Chip
                key={opt.key}
                active={difficultyFilter === opt.key}
                onClick={() => setDifficultyFilter(opt.key)}
                label={opt.label}
              />
            ))}
          </FilterRow>

          {/* 差异字符数 */}
          <FilterRow label="差异字符">
            {([
              { key: 'all', label: '全部' },
              { key: '1', label: `1 处 (${chipCounts.diff1})` },
              { key: '2', label: `2 处 (${chipCounts.diff2})` },
              { key: '3+', label: `3+ 处 (${chipCounts.diff3})` },
            ] as const).map(opt => (
              <Chip
                key={opt.key}
                active={diffFilter === opt.key}
                onClick={() => setDiffFilter(opt.key)}
                label={opt.label}
              />
            ))}
          </FilterRow>

          {/* 复习间隔 */}
          <FilterRow label="上次复习">
            {([
              { key: 'all', label: '全部' },
              { key: 'never', label: `从未 (${chipCounts.reviewNever})` },
              { key: 'week', label: `本周 (${chipCounts.reviewWeek})` },
              { key: 'month', label: `一月内 (${chipCounts.reviewMonth})` },
              { key: 'older', label: `超过 30 天 (${chipCounts.reviewOlder})` },
            ] as const).map(opt => (
              <Chip
                key={opt.key}
                active={reviewFilter === opt.key}
                onClick={() => setReviewFilter(opt.key)}
                label={opt.label}
              />
            ))}
          </FilterRow>
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
        黄色高亮 = 形近词的差异字符 · 可按混淆风险/差异字符/复习间隔筛选 · 点击"进入学习"可专项攻克该组
      </div>
    </div>
  );
};

/**
 * 筛选行：左侧标签 + 右侧可换行的标签按钮组
 */
const FilterRow: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="flex items-start gap-2 flex-wrap">
    <span className="text-xs font-medium text-slate-500 mt-1.5 shrink-0 w-14">{label}</span>
    <div className="flex items-center gap-1.5 flex-wrap flex-1">
      {children}
    </div>
  </div>
);

/**
 * 筛选标签按钮
 */
const Chip: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={[
      'text-xs px-2.5 py-1 rounded-full border transition-colors',
      active
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600',
    ].join(' ')}
  >
    {label}
  </button>
);

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
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
            配对 · {group.members.length} 词
          </span>
          {group.diffCount > 0 && (
            <span className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
              差异 {group.diffCount} 处
            </span>
          )}
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
            风险 {group.confusionRisk} ★
          </span>
          {!Number.isFinite(group.daysSinceReview) ? (
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
              未复习
            </span>
          ) : (
            <span
              className={[
                'text-xs px-2 py-1 rounded-full border',
                group.daysSinceReview > 30
                  ? 'text-rose-600 bg-rose-50 border-rose-100'
                  : group.daysSinceReview > 7
                  ? 'text-amber-600 bg-amber-50 border-amber-100'
                  : 'text-emerald-600 bg-emerald-50 border-emerald-100',
              ].join(' ')}
              title={`距上次复习 ${Math.round(group.daysSinceReview)} 天`}
            >
              {group.daysSinceReview < 1
                ? '今天复习过'
                : `${Math.round(group.daysSinceReview)} 天前复习`}
            </span>
          )}
        </div>
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
            <p className="text-sm text-slate-600 mt-1 leading-relaxed break-words">{w.chinese}</p>
          </div>
        ))}
      </div>
    </div>
  );
};