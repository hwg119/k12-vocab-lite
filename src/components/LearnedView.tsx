import React, { memo, useEffect, useMemo, useState } from 'react';
import { Word, SrsState } from '../types';
import { wordKey } from '../utils';
import { IconArrowLeft, IconSearch, IconCheck } from './Icons';

/** 时间维度 - 基于"首次掌握时间 firstMasteredAt" */
type TimeFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'older';
/** 状态维度 - 基于"距上次复习天数" */
type StatusFilter = 'all' | 'recent' | 'soon' | 'overdue' | 'never';

interface LearnedViewProps {
  words: Word[];
  learnedIds: Set<string>;
  srsMap: Record<string, SrsState>;
  onGoHome: () => void;
  /** 取消"已掌握"标记 */
  onUnmarkLearned: (wordOrId: Word | string) => void;
  /**
   * 数据版本号：每次进入已掌握视图时由 App.tsx 自增传入；
   * 用户切换 chip / 搜索时也会自增。版本号变化时才重算已掌握列表，
   * 标记/取消标记本身不会触发刷新。
   */
  dataVersion: number;
}

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'today', label: '今日' },
  { key: 'yesterday', label: '昨日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'older', label: '更早' },
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '不限' },
  { key: 'recent', label: '近期复习' },
  { key: 'soon', label: '待巩固' },
  { key: 'overdue', label: '久未复习' },
  { key: 'never', label: '从未复习' },
];

/** 获取一天开始的时间戳（00:00:00） */
function dayStart(daysAgo: number = 0): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.getTime();
}

/** 周一 0 点（周日视为本周第 6 天，保持周一为起点） */
function weekStartTs(): number {
  const d = new Date();
  const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - dow);
  return d.getTime();
}

/** 本月 1 号 0 点 */
function monthStartTs(): number {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** 30 天前 0 点（用于"更早"上界） */
function thirtyDaysAgoTs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 30);
  return d.getTime();
}

/** 判断 firstMasteredAt 命中哪个时间 bucket（返回 null 表示不在任何具体 bucket，但仍是已掌握） */
function timeBucket(
  ts: number,
  today: number,
  yesterday: number,
  weekStart: number,
  monthStart: number,
  thirtyAgo: number,
): TimeFilter {
  if (ts >= today) return 'today';
  if (ts >= yesterday && ts < today) return 'yesterday';
  if (ts >= weekStart) return 'week';
  if (ts >= monthStart) return 'month';
  if (ts < thirtyAgo) return 'older';
  // 本月1号 ≤ ts < 30天前 0点：归属"本周/本月/更早"都包含它，但单独没 bucket
  // 这里落到 'week'（最近一周内），让"本周"包含最近7天的掌握
  return 'week';
}

/** 判断"距上次复习天数"命中哪个状态 bucket */
function statusBucket(lastReviewedAt: number, now: number): StatusFilter {
  if (lastReviewedAt === 0) return 'never';
  const days = (now - lastReviewedAt) / 86400000;
  if (days <= 7) return 'recent';
  if (days <= 30) return 'soon';
  return 'overdue';
}

export const LearnedView: React.FC<LearnedViewProps> = ({
  words,
  learnedIds,
  srsMap,
  onGoHome,
  onUnmarkLearned,
  dataVersion,
}) => {
  const [timeFilter, setTimeFilterRaw] = useState<TimeFilter>('all');
  const [statusFilter, setStatusFilterRaw] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTermRaw] = useState('');
  /** 本地"强制重算"版本号：仅在用户切换 chip / 搜索 / 进入视图时自增 */
  const [localVersion, setLocalVersion] = useState(dataVersion);
  /** chip / 搜索变更时同步刷新列表（标记/取消标记不走这里） */
  const setTimeFilter = (v: TimeFilter) => { setTimeFilterRaw(v); setLocalVersion(x => x + 1); };
  const setStatusFilter = (v: StatusFilter) => { setStatusFilterRaw(v); setLocalVersion(x => x + 1); };
  const setSearchTerm = (v: string) => { setSearchTermRaw(v); setLocalVersion(x => x + 1); };
  /**
   * 本地"覆盖集"：记录用户在本视图内手动取消/标记的 wordKey。
   * 渲染时优先用本集合判定"是否已掌握"——保证点击立即看到图标变化，
   * 同时不触发 learnedItems 重算（仍是用户切换 chip / 重新进入才重算）。
   */
  const [overrideLearned, setOverrideLearned] = useState<Set<string>>(() => new Set(learnedIds));

  /**
   * 外部 dataVersion 变化（即重新进入本视图）→ 用最新 learnedIds 重置 override，
   * 这样视图内的手动覆盖不会跨会话/跨次进入保留。
   * 注意：仅依赖 dataVersion，不依赖 learnedIds——避免每次标记/取消触发副作用。
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setOverrideLearned(new Set(learnedIds)); }, [dataVersion]);

  // 一次性把已掌握词 + 全部派生字段算出来（bucket 已归类，省得筛选时再算）
  const learnedItems = useMemo(() => {
    const now = Date.now();
    const today = dayStart(0);
    const yesterday = dayStart(1);
    const weekStart = weekStartTs();
    const monthStart = monthStartTs();
    const thirtyAgo = thirtyDaysAgoTs();

    const items: Array<{
      word: Word;
      firstMasteredAt: number;
      lastReviewedAt: number;
      time: TimeFilter;
      status: StatusFilter;
    }> = [];

    for (const w of words) {
      const key = wordKey(w);
      if (!learnedIds.has(key) && !learnedIds.has(w.id)) continue;
      const srs = srsMap[key] ?? srsMap[w.id];
      const firstMasteredAt = srs?.firstMasteredAt ?? srs?.lastReviewedAt ?? 0;
      const lastReviewedAt = srs?.lastReviewedAt ?? 0;
      items.push({
        word: w,
        firstMasteredAt,
        lastReviewedAt,
        time: timeBucket(firstMasteredAt, today, yesterday, weekStart, monthStart, thirtyAgo),
        status: statusBucket(lastReviewedAt, now),
      });
    }
    // 默认按"首次掌握时间"倒序（最近掌握的在前）
    items.sort((a, b) => b.firstMasteredAt - a.firstMasteredAt);
    return items;
  // 注意：故意不依赖 learnedIds / srsMap。
  // 标记/取消标记不会触发此重算；只在 dataVersion（外部进入）或
  // localVersion（用户主动切换 chip / 搜索）变化时才重算。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, dataVersion, localVersion]);

  // 顶部徽章显示的总数：所有已掌握词
  const totalLearned = learnedItems.length;

  // 各 chip 角标计数
  // 时间 chip 数字：在当前状态 chip 下的子集数（默认 'all'）
  // 状态 chip 数字：在当前时间 chip 下的子集数（默认 'all'）
  const timeCounts = useMemo(() => {
    const c: Record<TimeFilter, number> = {
      all: 0, today: 0, yesterday: 0, week: 0, month: 0, older: 0,
    };
    for (const it of learnedItems) {
      // "全部"永远 = 总数
      c.all++;
      // 当前状态 chip 下的子集
      if (statusFilter === 'all' || it.status === statusFilter) {
        c[it.time]++;
      }
    }
    return c;
  }, [learnedItems, statusFilter]);

  const statusCounts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: 0, recent: 0, soon: 0, overdue: 0, never: 0,
    };
    for (const it of learnedItems) {
      c.all++;
      if (timeFilter === 'all' || it.time === timeFilter) {
        c[it.status]++;
      }
    }
    return c;
  }, [learnedItems, timeFilter]);

  // 实际过滤 + 搜索
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return learnedItems.filter(it => {
      if (timeFilter !== 'all' && it.time !== timeFilter) return false;
      if (statusFilter !== 'all' && it.status !== statusFilter) return false;
      if (term) {
        const w = it.word;
        if (!w.english.toLowerCase().includes(term) && !w.chinese.includes(term)) {
          return false;
        }
      }
      return true;
    });
  }, [learnedItems, timeFilter, statusFilter, searchTerm]);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[60vh] sm:min-h-[70vh] animate-fade-in w-full max-w-full self-stretch">
      {/* Header: 标题 + 返回 + 当前命中数 / 总数 */}
      <div className="p-3 sm:p-4 border-b border-slate-100 bg-white">
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
            {filteredItems.length} / {totalLearned} words
          </span>
        </div>
      </div>

      {/* Word List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        {/* 过滤区：滚动时 sticky 置顶 */}
        <div className="sticky top-0 z-20 p-3 sm:p-4 border-b border-slate-100 bg-white/95 backdrop-blur-sm space-y-2 sm:space-y-3">
          {/* 行 1：时间维度（首次掌握时间） */}
          <div className="space-y-1">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">掌握于</div>
            <div className="flex flex-wrap gap-1.5">
              {TIME_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setTimeFilter(f.key)}
                  className={[
                    'text-xs px-2.5 py-1 rounded-full border transition-colors',
                    timeFilter === f.key
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600',
                  ].join(' ')}
                >
                  {f.label}
                  <span className="ml-1 opacity-70">{timeCounts[f.key]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 行 2：状态维度（距上次复习） */}
          <div className="space-y-1">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">复习状态</div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map(f => {
                const active = statusFilter === f.key;
                const idle = `${STATUS_IDLE_BG[f.key]} ${STATUS_IDLE_TEXT[f.key]} ${STATUS_IDLE_BORDER[f.key]} ${STATUS_HOVER_BORDER[f.key]} ${STATUS_HOVER_TEXT[f.key]}`;
                const on = `${STATUS_ACTIVE_BG[f.key]} ${STATUS_ACTIVE_TEXT[f.key]} ${STATUS_ACTIVE_BORDER[f.key]}`;
                return (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    className={[
                      'text-xs px-2.5 py-1 rounded-full border transition-colors',
                      active ? on : idle,
                    ].join(' ')}
                  >
                    {f.label}
                    <span className="ml-1 opacity-70">{statusCounts[f.key]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 搜索 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <IconSearch />
            </div>
            <input
              type="text"
              placeholder="搜索已掌握单词..."
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 列表 */}
        <div className="divide-y divide-slate-50">
          {filteredItems.map(it => (
            <LearnedRow
              key={it.word.id}
              item={it}
              isLearnedNow={overrideLearned.has(wordKey(it.word))}
              onUnmark={onUnmarkLearned}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
            <IconCheck />
            <p>{emptyText(timeFilter, statusFilter, searchTerm)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

/** 状态维度 chip + 列表徽章的统一样式（Tailwind JIT 需要完整静态类名，每个维度单独一张表） */
const STATUS_ACTIVE_BG: Record<StatusFilter, string> = {
  all: 'bg-indigo-600',
  recent: 'bg-emerald-600',
  soon: 'bg-amber-500',
  overdue: 'bg-rose-600',
  never: 'bg-slate-700',
};
const STATUS_ACTIVE_TEXT: Record<StatusFilter, string> = {
  all: 'text-white',
  recent: 'text-white',
  soon: 'text-white',
  overdue: 'text-white',
  never: 'text-white',
};
const STATUS_ACTIVE_BORDER: Record<StatusFilter, string> = {
  all: 'border-indigo-600',
  recent: 'border-emerald-600',
  soon: 'border-amber-500',
  overdue: 'border-rose-600',
  never: 'border-slate-700',
};
const STATUS_IDLE_BG: Record<StatusFilter, string> = {
  all: 'bg-white', recent: 'bg-white', soon: 'bg-white', overdue: 'bg-white', never: 'bg-white',
};
const STATUS_IDLE_TEXT: Record<StatusFilter, string> = {
  all: 'text-slate-600',
  recent: 'text-emerald-700',
  soon: 'text-amber-700',
  overdue: 'text-rose-700',
  never: 'text-slate-600',
};
const STATUS_IDLE_BORDER: Record<StatusFilter, string> = {
  all: 'border-slate-200',
  recent: 'border-emerald-200',
  soon: 'border-amber-200',
  overdue: 'border-rose-200',
  never: 'border-slate-300',
};
const STATUS_HOVER_BORDER: Record<StatusFilter, string> = {
  all: 'hover:border-indigo-300',
  recent: 'hover:border-emerald-400',
  soon: 'hover:border-amber-400',
  overdue: 'hover:border-rose-400',
  never: 'hover:border-slate-400',
};
const STATUS_HOVER_TEXT: Record<StatusFilter, string> = {
  all: 'hover:text-indigo-600',
  recent: 'hover:text-emerald-700',
  soon: 'hover:text-amber-700',
  overdue: 'hover:text-rose-700',
  never: 'hover:text-slate-700',
};

const STATUS_BADGE_BG: Record<StatusFilter, string> = {
  all: 'bg-slate-100',
  recent: 'bg-emerald-50',
  soon: 'bg-amber-50',
  overdue: 'bg-rose-50',
  never: 'bg-slate-100',
};
const STATUS_BADGE_TEXT: Record<StatusFilter, string> = {
  all: 'text-slate-500',
  recent: 'text-emerald-700',
  soon: 'text-amber-700',
  overdue: 'text-rose-700',
  never: 'text-slate-600',
};
const STATUS_BADGE_BORDER: Record<StatusFilter, string> = {
  all: 'border-slate-200',
  recent: 'border-emerald-200',
  soon: 'border-amber-200',
  overdue: 'border-rose-200',
  never: 'border-slate-200',
};
const STATUS_BADGE_LABEL: Record<StatusFilter, string> = {
  all: '不限',
  recent: '近期',
  soon: '待巩固',
  overdue: '久未复习',
  never: '手动',
};

const StatusBadge: React.FC<{ status: StatusFilter }> = ({ status }) => {
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${STATUS_BADGE_BG[status]} ${STATUS_BADGE_TEXT[status]} ${STATUS_BADGE_BORDER[status]}`}>
      {STATUS_BADGE_LABEL[status]}
    </span>
  );
};

/** 列表项类型（与父组件的 items[] 元素对齐） */
type LearnedItem = {
  word: Word;
  firstMasteredAt: number;
  lastReviewedAt: number;
  time: TimeFilter;
  status: StatusFilter;
};

/** 单条列表项 - 抽出来用 React.memo，避免 1000 条列表全量 re-render */
const LearnedRow = memo(
  ({
    item,
    isLearnedNow,
    onUnmark,
  }: {
    item: LearnedItem;
    isLearnedNow: boolean;
    onUnmark: (w: Word | string) => void;
  }) => {
    const { word, firstMasteredAt, lastReviewedAt, status } = item;
    return (
      <div className="p-3 sm:p-4 hover:bg-slate-50 flex items-start justify-between gap-2 sm:gap-4 group transition-colors duration-200">
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-bold text-slate-800 text-base sm:text-lg break-all">{word.english}</span>
            <span className="font-mono text-slate-400 text-xs sm:text-sm shrink-0">{word.phonetic}</span>
          </div>
          <div className="text-sm text-slate-600 mt-1 leading-relaxed break-words">{word.chinese}</div>
          {isLearnedNow && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[10px] text-slate-400">
              {firstMasteredAt > 0 && (
                <span title={new Date(firstMasteredAt).toLocaleString()}>
                  掌握于 {formatDateShort(firstMasteredAt)}
                </span>
              )}
              {lastReviewedAt > 0 && (
                <>
                  <span className="text-slate-300">·</span>
                  <span title={new Date(lastReviewedAt).toLocaleString()}>
                    上次复习 {formatTimeAgo(lastReviewedAt)}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-center gap-1.5">
          {isLearnedNow ? (
            <>
              <button
                onClick={() => onUnmark(word)}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 text-white hover:bg-rose-100 hover:text-rose-600 active:scale-90 rounded-full flex items-center justify-center transition-all shadow-sm"
                title="取消已掌握"
              >
                <IconCheck />
              </button>
              <StatusBadge status={status} />
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  /* 已取消状态点击无动作，如需重新标记请进入「完整词典」 */
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center"
                title="已取消"
              >
                <IconCheck />
              </button>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-slate-50 text-slate-400 border-slate-200">
                未掌握
              </span>
            </>
          )}
        </div>
      </div>
    );
  },
  /**
   * 自定义比较：item 引用变化（如父级 useMemo 重算后元素换了引用）→ 浅对比关键字段；
   * isLearnedNow / onUnmark 引用变了也接受（onUnmark 在 App.tsx 不是稳定 ref，但每次只会让 1 行重渲一次）。
   */
  (a, b) => {
    if (a.isLearnedNow !== b.isLearnedNow) return false;
    const wa = a.item.word, wb = b.item.word;
    if (wa.id !== wb.id) return false;
    if (wa.english !== wb.english || wa.chinese !== wb.chinese || wa.phonetic !== wb.phonetic) return false;
    if (a.item.firstMasteredAt !== b.item.firstMasteredAt) return false;
    if (a.item.lastReviewedAt !== b.item.lastReviewedAt) return false;
    if (a.item.status !== b.item.status) return false;
    return true;
  },
);

function emptyText(time: TimeFilter, status: StatusFilter, term: string): string {
  if (term) return '没有匹配的已掌握单词';
  if (time !== 'all' && status !== 'all') return '该时间段与状态下暂无已掌握单词';
  if (time !== 'all') return '该时间段暂无已掌握单词';
  if (status !== 'all') return '该状态下暂无已掌握单词';
  return '暂无已掌握的单词';
}

/** 短日期：MM-DD（跨年显示 YYYY-MM-DD） */
function formatDateShort(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const nowY = new Date().getFullYear();
  return nowY === y ? `${m}-${day}` : `${y}-${m}-${day}`;
}

/** 距今多久 */
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