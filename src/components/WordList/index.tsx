import React, { memo, useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Word } from '../../types';
import { IconSearch, IconCheck } from '../Icons';
import { WordImage } from '../WordImage';
import { WordAudio } from '../WordAudio';
import { useDebounce, useDebouncedCallback } from '../../hooks';
import { wordKey } from '../../utils';

interface WordListProps {
  words: Word[];
  learnedIds: Set<string>;
  onMarkAsLearned: (wordOrId: Word | string) => void;
  /** 取消"已掌握"标记 */
  onUnmarkLearned?: (wordOrId: Word | string) => void;
  title: string;
  showMarkButton?: boolean;
  /**
   * 数据版本号：每次进入词典时由 App.tsx 自增传入；
   * 用户切换 markFilter / 搜索时也会自增。版本号变化时才重算列表/计数，
   * 标记/取消标记本身不会触发刷新。
   */
  dataVersion?: number;
}

/** 词典里的标记过滤维度 */
type MarkFilter = 'all' | 'learned' | 'unlearned';
const MARK_FILTERS: { key: MarkFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'learned', label: '已掌握' },
  { key: 'unlearned', label: '未掌握' },
];

const ITEMS_PER_PAGE = 50;

export const WordList: React.FC<WordListProps> = ({
  words,
  learnedIds,
  onMarkAsLearned,
  onUnmarkLearned,
  title,
  showMarkButton = true,
  dataVersion = 0,
}) => {
  const [searchTerm, setSearchTermRaw] = useState('');
  const [markFilter, setMarkFilterRaw] = useState<MarkFilter>('all');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  /** 本地"强制重算"版本号：仅在用户切换 chip / 搜索 / 进入视图时自增 */
  const [localVersion, setLocalVersion] = useState(dataVersion);
  /** chip / 搜索变更时：重置本地覆盖集（与最新 learnedIds 对齐）+ 触发列表重算 */
  const setMarkFilter = (v: MarkFilter) => { setMarkFilterRaw(v); setOverrideLearned(new Set(learnedIds)); setLocalVersion(x => x + 1); };
  const setSearchTerm = (v: string) => { setSearchTermRaw(v); setOverrideLearned(new Set(learnedIds)); setLocalVersion(x => x + 1); };
  /**
   * 本地"覆盖集"：用户在本视图内手动标记/取消的 wordKey。
   * 渲染时优先用本集合判定"是否已掌握"——保证点击立即看到图标变化，
   * 不触发列表 / counts 重算（仍是切换 chip / 搜索 / 重新进入才重算）。
   */
  const [overrideLearned, setOverrideLearned] = useState<Set<string>>(() => new Set(learnedIds));
  /**
   * dataVersion 变化（即重新进入本视图）→ 用最新 learnedIds 重置 override。
   * 不依赖 learnedIds，避免每次标记/取消触发副作用。
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setOverrideLearned(new Set(learnedIds)); }, [dataVersion]);
  /** 本地判定"是否已掌握"（覆盖集优先） */
  const isLearnedLocally = useCallback(
    (w: Word) => overrideLearned.has(wordKey(w)) || overrideLearned.has(w.id),
    [overrideLearned],
  );

  // 判断单条词是否"已掌握"（兼容 wordKey + legacy id）
  // 注意：故意只依赖 localVersion（用户主动操作时自增），不依赖 learnedIds：
  // 这样标记/取消标记本身不会触发列表重算。
  const isWordLearned = useCallback(
    (w: Word) => learnedIds.has(wordKey(w)) || learnedIds.has(w.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [localVersion],
  );

  const markCounts = useMemo(() => {
    let learned = 0;
    for (const w of words) if (isWordLearned(w)) learned++;
    return { all: words.length, learned, unlearned: words.length - learned };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, localVersion]);

  const filteredWords = useMemo(() => {
    const lowerTerm = debouncedSearchTerm.toLowerCase();
    return words.filter(w => {
      if (markFilter === 'learned' && !isWordLearned(w)) return false;
      if (markFilter === 'unlearned' && isWordLearned(w)) return false;
      if (!lowerTerm) return true;
      return (
        w.english.toLowerCase().includes(lowerTerm) ||
        w.chinese.includes(lowerTerm)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, debouncedSearchTerm, markFilter, localVersion]);

  const visibleWords = useMemo(() => {
    return filteredWords.slice(0, displayCount);
  }, [filteredWords, displayCount]);

  const hasMore = displayCount < filteredWords.length;

  // 加载更多单词
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => {
        const next = Math.min(prev + ITEMS_PER_PAGE, filteredWords.length);
        return next;
      });
      setIsLoading(false);
    }, 100);
  }, [isLoading, hasMore, filteredWords.length]);

  // 使用防抖优化滚动处理函数，避免频繁触发
  const handleScroll = useDebouncedCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollBottom = scrollTop + clientHeight;
    // 当滚动到距离底部 100px 时触发加载
    const threshold = scrollHeight - 100;
    
    if (scrollBottom >= threshold) {
      loadMore();
    }
  }, 100);

  // 搜索词 / 标记过滤变化时重置
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
    if (listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }
  }, [debouncedSearchTerm, markFilter]);

  // 初始加载时，如果内容不够填充容器，自动加载更多
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;

    // 检查是否需要加载更多
    const checkAndLoadMore = () => {
      const { scrollHeight, clientHeight } = container;
      // 如果内容高度小于容器高度，且还有更多数据，则加载更多
      if (scrollHeight <= clientHeight && hasMore && !isLoading) {
        loadMore();
      }
    };

    // 延迟检查，确保 DOM 已更新
    const timer = setTimeout(checkAndLoadMore, 100);
    return () => clearTimeout(timer);
  }, [visibleWords.length, hasMore, isLoading, loadMore]);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[60vh] sm:min-h-[70vh] animate-fade-in w-full max-w-full self-stretch">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-100 bg-white sticky top-0 z-20 space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base sm:text-lg text-slate-800">{title}</h2>
          <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-500">
            {filteredWords.length} words
          </span>
        </div>
        {/* 标记状态过滤 chips */}
        <div className="flex flex-wrap gap-1.5">
          {MARK_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setMarkFilter(f.key)}
              className={[
                'text-xs px-2.5 py-1 rounded-full border transition-colors',
                markFilter === f.key
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600',
              ].join(' ')}
            >
              {f.label}
              <span className="ml-1 opacity-70">{markCounts[f.key]}</span>
            </button>
          ))}
        </div>
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
      <div 
        ref={listContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
      >
        <div className="divide-y divide-slate-50">
          {visibleWords.map((word) => (
            <WordListRow
              key={word.id}
              word={word}
              isLearnedNow={isLearnedLocally(word)}
              showMarkButton={showMarkButton}
              onMarkAsLearned={onMarkAsLearned}
              onUnmarkLearned={onUnmarkLearned}
              setOverrideLearned={setOverrideLearned}
            />
          ))}
        </div>
        
        {/* 加载指示器 */}
        {hasMore && (
          <div className="p-4 text-center">
            {isLoading ? (
              <>
                <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 mt-2">Loading more...</p>
              </>
            ) : (
              <button
                onClick={loadMore}
                className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Load More ({filteredWords.length - displayCount} remaining)
              </button>
            )}
          </div>
        )}
        
        {/* 全部加载完成提示 */}
        {!hasMore && filteredWords.length > 0 && (
          <div className="p-4 text-center">
            <p className="text-xs text-slate-400">
              All {filteredWords.length} words loaded
            </p>
          </div>
        )}
        
        {filteredWords.length === 0 && (
          <div className="p-10 text-center text-slate-400 flex flex-col items-center gap-2">
            <IconSearch />
            <p>
              {markFilter === 'learned'
                ? '暂无已掌握单词'
                : markFilter === 'unlearned'
                  ? '暂无未掌握单词'
                  : `No words found matching "${debouncedSearchTerm}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 单条列表项 - 用 React.memo + 自定义 areEqual，避免 1000+ 词列表每次 setOverrideLearned 全量重渲。
 * 关键：areEqual 必须正确处理 isLearnedNow / word 字段变化；不比较函数引用 prop。
 */
const WordListRow = memo(
  ({
    word,
    isLearnedNow,
    showMarkButton,
    onMarkAsLearned,
    onUnmarkLearned,
    setOverrideLearned,
  }: {
    word: Word;
    isLearnedNow: boolean;
    showMarkButton: boolean;
    onMarkAsLearned: (w: Word | string) => void;
    onUnmarkLearned?: (w: Word | string) => void;
    setOverrideLearned: React.Dispatch<React.SetStateAction<Set<string>>>;
  }) => {
    const wordK = wordKey(word);
    return (
      <div
        data-leaned={isLearnedNow ? '1' : '0'}
        className="p-3 sm:p-4 hover:bg-slate-50 flex items-start justify-between gap-2 sm:gap-4 group transition-colors duration-200"
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap min-w-0">
              <span className="font-bold text-slate-800 text-base sm:text-lg break-all">{word.english}</span>
              <span className="font-mono text-slate-400 text-xs sm:text-sm shrink-0">{word.phonetic}</span>
            </div>
            <WordAudio word={word.english} />
            <WordImage
              english={word.english}
              alt={word.english}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-100 shrink-0"
              zoomable={false}
            />
          </div>
          <div className="text-sm text-slate-600 mt-1 leading-relaxed break-words">{word.chinese}</div>
          {word.mnemonic && (
            <div className="text-xs text-amber-700 mt-1 italic bg-amber-50 inline-block px-2 py-0.5 rounded border border-amber-100">
              💡 {word.mnemonic}
            </div>
          )}
        </div>
        {isLearnedNow ? (
          <div className="shrink-0 flex flex-col items-center gap-1">
            <button
              onClick={() => {
                onUnmarkLearned?.(word);
                setOverrideLearned(prev => {
                  const next = new Set(prev);
                  next.delete(wordK);
                  if (word.id && word.id !== wordK) next.delete(word.id);
                  return next;
                });
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 text-white hover:bg-rose-100 hover:text-rose-600 active:scale-90 rounded-full flex items-center justify-center transition-all shadow-sm"
              title="取消已掌握"
            >
              <IconCheck />
            </button>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide hidden sm:block">Mastered</span>
          </div>
        ) : (
          showMarkButton && (
            <button
              onClick={() => {
                onMarkAsLearned(word);
                setOverrideLearned(prev => {
                  const next = new Set(prev);
                  next.add(wordK);
                  if (word.id && word.id !== wordK) next.add(word.id);
                  return next;
                });
              }}
              className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-slate-200 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 active:scale-90 rounded-full flex items-center justify-center transition-all border border-slate-300"
              title="标记已掌握"
            >
              <IconCheck />
            </button>
          )
        )}
      </div>
    );
  },
  // 自定义 areEqual：忽略函数引用 prop 的变化（每次 re-render 引用都变），
  // 但要求 isLearnedNow / word 字段变化时正确触发更新。
  // 关键：返回 true 表示"相等，跳过更新"；返回 false 表示"不等，更新"。
  (a, b) => {
    if (a.isLearnedNow !== b.isLearnedNow) return false;
    if (a.showMarkButton !== b.showMarkButton) return false;
    const wa = a.word, wb = b.word;
    if (wa.id !== wb.id) return false;
    if (wa.english !== wb.english || wa.chinese !== wb.chinese || wa.phonetic !== wb.phonetic) return false;
    if (wa.mnemonic !== wb.mnemonic) return false;
    return true;
  },
);
