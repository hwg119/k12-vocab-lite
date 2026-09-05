import React, { useState, useEffect } from 'react';
import { Word, SrsState, GraduatedRecord } from '../../types';
import { matchWordKey, graduationThreshold } from '../../utils';
import { useLocalStorage } from '../../hooks';
import { IconArrowLeft, IconTrash } from '../Icons';
import { WordImage } from '../WordImage';
import { WordAudio } from '../WordAudio';
import { SentenceAudio } from '../SentenceAudio';

const DAY = 24 * 60 * 60 * 1000;

/**
 * 综合"薄弱分数"，越高越靠前：
 *   w = wrongCount（错次权重 ×2）
 *   r = "最近 30 天是否被复习过"权重：
 *        最近 7 天复习过 → +3（最近在连续错，最当前）
 *        7~30 天前复习过 → +2
 *        30 天前/未复习过 → +1（陈年错词：权重低，照顾优先级）
 *   s = 拼写维度待练权重：
 *        拼写错过且未拼写达标 → +2（拼写也是现时瓶颈）
 */
function weaknessScore(item: {
  wrong: number;
  lastReviewedAt: number;
  spWrong: number;
  spRep: number;
}): number {
  const w = item.wrong * 2;
  const age = item.lastReviewedAt > 0 ? Date.now() - item.lastReviewedAt : Infinity;
  const r = age <= 7 * DAY ? 3 : age <= 30 * DAY ? 2 : 1;
  const s = item.spWrong > 0 && item.spRep < graduationThreshold(item.spWrong) ? 2 : 0;
  return w + r + s;
}

/**
 * 点式进度指示（最多 3 个点，超出取后段）。
 * - 完成的点用主色填充
 * - 当前的点用环形表示
 * - 未到的点用浅灰
 */
function ProgressDots({
  progress,
  total,
  color,
}: {
  progress: number;
  total: number;
  color: 'emerald' | 'amber' | 'indigo';
}) {
  const n = Math.min(total, 3);
  const filled = Math.min(progress, n);
  const palette: Record<typeof color, { bg: string; ring: string; empty: string }> = {
    emerald: { bg: 'bg-emerald-500', ring: 'ring-emerald-400', empty: 'bg-slate-200' },
    amber: { bg: 'bg-amber-500', ring: 'ring-amber-400', empty: 'bg-slate-200' },
    indigo: { bg: 'bg-indigo-500', ring: 'ring-indigo-400', empty: 'bg-slate-200' },
  };
  const c = palette[color];
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className={
            'w-1.5 h-1.5 rounded-full ' +
            (i < filled ? c.bg : i === filled && progress < total ? `bg-white ring-2 ${c.ring}` : c.empty)
          }
        />
      ))}
    </div>
  );
}

/**
 * 已攻克词条列表：与错词本条目同布局（音标 / 释义 / WordImage），右侧显示攻克时间。
 */
function GraduatedSection({
  rows,
}: {
  rows: { rec: GraduatedRecord; word: Word | undefined }[];
}) {
  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          🏆
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">暂无攻克记录</h3>
        <p className="text-slate-500 text-sm">
          错词本里的词连续答对达标后，会自动沉淀到这里作为你的成就。
        </p>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {rows.map(({ rec, word }) => {
        const days = Math.max(0, Math.round((Date.now() - rec.graduatedAt) / DAY));
        const english = word?.english ?? rec.english;
        const phonetic = word?.phonetic ?? '';
        const chinese = word?.chinese ?? '';
        return (
          <li
            key={rec.key}
            className="bg-white rounded-xl border border-emerald-100 p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
          >
            <div className="flex-1 min-w-0 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-bold text-slate-800">{english || '(未命名)'}</span>
                  {phonetic ? (
                    <span className="text-xs text-indigo-500 font-mono">{phonetic}</span>
                  ) : null}
                  {english ? <WordAudio word={english} /> : null}
                </div>
                {chinese ? (
                  <p className="text-sm text-slate-500 mt-1 break-words leading-relaxed">{chinese}</p>
                ) : null}
                {word?.exampleSentence && (
                  <SentenceAudio word={word.english} fallbackSentence={word.exampleSentence} className="mt-0.5" />
                )}
              </div>
              {english ? (
                <WordImage
                  english={english}
                  alt={english}
                  className="w-10 h-10 rounded-lg bg-slate-100 shrink-0"
                  zoomable={false}
                />
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full whitespace-nowrap text-emerald-700 bg-emerald-50 border border-emerald-200">
                🏆 已攻克
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {days === 0 ? '今天攻克' : `${days} 天前攻克`}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

interface MistakesViewProps {
  words: Word[];
  mistakeIds: string[];
  srsMap: Record<string, SrsState>;
  /** 已攻克错词的累计计数（毕业沉淀） */
  graduatedCount?: number;
  /** 已攻克错词记录列表（按攻克时间倒序） */
  graduatedRecords?: GraduatedRecord[];
  onGoHome: () => void;
  /** 进入专项复习 - 直接复用 StudyMode 的队列模式 */
  onStartReview: (queue: Word[]) => void;
  /** 进入拼写默写 - 看中文主动拼出英文（不与到期挂钩，全量出题） */
  onStartSpelling: (queue: Word[]) => void;
  /** 一键清空错词（不弹窗，需要用户自己二次确认） */
  onClearMistakes: () => void;
}

/**
 * 错词本视图
 *
 * - 自动汇总本学段标记为「错词」的单词
 * - 按错误次数降序
 * - 支持"专项复习"按钮：把错词队列灌给学习模式
 * - 支持"清空错词"按钮：清空当前学段错词本
 */
export const MistakesView: React.FC<MistakesViewProps> = ({
  words,
  mistakeIds,
  srsMap,
  graduatedCount = 0,
  graduatedRecords = [],
  onGoHome,
  onStartReview,
  onStartSpelling,
  onClearMistakes,
}) => {
  // 二次确认态
  const [confirming, setConfirming] = useState(false);
  // 顶部 Tab：错词本 vs 已攻克
  const [tab, setTab] = useState<'mistakes' | 'graduated'>('mistakes');
  // 已攻克提示只显示一次：首次进入有已攻克时显示，之后永久隐藏
  const [dismissedGraduatedNotice, setDismissedGraduatedNotice] =
    useLocalStorage('vocab-dismissed-graduated-notice', false);
  // 首次进入时标记已见，下次不再提示
  useEffect(() => {
    if (graduatedCount > 0 && !dismissedGraduatedNotice) {
      setDismissedGraduatedNotice(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // 提取有效单词 + 错误次数（missing srsState 视为 0 次，但仍在 mistakeIds 中就算"错词"）
  // 支持多种 key 形式：
  //   - wordKey: 'w:english|chinese'
  //   - 历史 id 格式: 'wd_xxx'
  // 仅用当前学段词表解析：错词 id 均由本学段流程写入（wordKey+当前 id 双写），
  // 不合并 ALL_WORDS，避免解析到另一学段（junior/senior 大量同词条）的副本
  // 从而把外学段 id 引入本学段 srsMap（串读）。
  const allWords = words;

  const sortedWords = mistakeIds
    .map((id, idx) => {
      const w = matchWordKey(allWords, id);
      if (!w) return null;
      // srsMap 同时支持 key 和旧 id
      const srs = srsMap[id] ?? srsMap[w.id] ?? srsMap[`w:${w.english}|${w.chinese}`];
      const sp = srs?.spelling;
      return {
        word: w,
        wrong: srs?.wrongCount ?? 0,
        repetitions: srs?.repetitions ?? 0,
        dueAt: srs?.dueAt ?? 0,
        lastReviewedAt: srs?.lastReviewedAt ?? 0,
        consecutiveWrong: srs?.consecutiveWrong ?? 0,
        spWrong: sp?.wrongCount ?? 0,
        spRep: sp?.repetitions ?? 0,
        spDueAt: sp?.dueAt ?? 0,
        hasSpelling: !!sp,
        idx,
      };
    })
    .filter(
      (x): x is {
        word: Word;
        wrong: number;
        repetitions: number;
        dueAt: number;
        lastReviewedAt: number;
        consecutiveWrong: number;
        spWrong: number;
        spRep: number;
        spDueAt: number;
        hasSpelling: boolean;
        idx: number;
      } => x !== null,
    )
    // 薄弱优先排序：
    //   1) 错次权重 w（错得越多越优先）
    //   2) 最近连续错权重 r（30 天内最近一次复习越近越优先，未复习的词视为最薄弱）
    //   3) 拼写维度待练权重 s（spWrong>0 且未拼写达标 = 现时拼写瓶颈）
    // 综合分 = w*2 + r + s
    .sort((a, b) => {
      const scoreA = weaknessScore(a);
      const scoreB = weaknessScore(b);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return a.idx - b.idx;
    });

  const total = sortedWords.length;
  const now = Date.now();
  // 今日到期错词：dueAt=0（新错词）或已到复习期 → 间隔巩固的核心队列
  const dueQueue = sortedWords
    .filter(s => s.dueAt === 0 || s.dueAt <= now)
    .map(s => s.word);
  const dueCount = dueQueue.length;
  const reviewableQueue = sortedWords.map(s => s.word);
  // 拼写维度到期队列：仅统计已存在拼写记录且到期的词（拼写与词义两条线独立）
  const spellingDueQueue = sortedWords
    .filter(s => s.hasSpelling && (s.spDueAt === 0 || s.spDueAt <= now))
    .map(s => s.word);
  const spellingDueCount = spellingDueQueue.length;

  // 拼写优先级队列：优先未拼写过的，再拼写错得多的，最后其他
  const spellingPriorityQueue = sortedWords
    .slice()
    .sort((a, b) => {
      const aNever = a.spWrong === 0 && a.spRep === 0;
      const bNever = b.spWrong === 0 && b.spRep === 0;
      if (aNever && !bNever) return -1;
      if (!aNever && bNever) return 1;
      if (a.spWrong !== b.spWrong) return b.spWrong - a.spWrong;
      return a.idx - b.idx;
    })
    .map(s => s.word);

  // 已攻克视图：按 wordKey 在当前学段词表中找回 Word 对象（找不到的词也展示 english 文本兜底）
  const graduatedRows = graduatedRecords
    .map(rec => {
      const w = matchWordKey(allWords, rec.key) ?? allWords.find(x => x.id === rec.key);
      return { rec, word: w };
    });

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in px-2 self-stretch min-h-[60vh] sm:min-h-[70vh] flex flex-col">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          回首页
        </button>
        <h2 className="text-xl font-bold text-slate-800">复习</h2>
        <div className="w-16"></div>
      </div>

      {/* 顶部 Tab：复习 / 已攻克（默认复习） */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-4 self-stretch">
        <button
          type="button"
          onClick={() => setTab('mistakes')}
          className={
            'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ' +
            (tab === 'mistakes'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700')
          }
        >
          复习 <span className="ml-1 text-xs opacity-70">({total})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('graduated')}
          disabled={graduatedRecords.length === 0}
          className={
            'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1 ' +
            (tab === 'graduated'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700') +
            (graduatedRecords.length === 0 ? ' opacity-50 cursor-not-allowed' : '')
          }
        >
          🏆 已攻克 <span className="ml-1 text-xs opacity-70">({graduatedCount})</span>
        </button>
      </div>

      {tab === 'graduated' ? (
        /* 已攻克视图 */
        <GraduatedSection rows={graduatedRows} />
      ) : total === 0 ? (
        <>
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 mb-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🎯
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">暂无错词</h3>
            <p className="text-slate-500 text-sm">
              回答时标记"模糊"或"不认识"的词会自动收纳到这里，便于专项攻克。
            </p>
          </div>

          {/* 清空错词操作区（始终可见，让用户能主动清理残留脏数据） */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">管理复习</span>
              <span className="ml-2 text-xs text-slate-400">清空不会影响已掌握单词</span>
            </div>
            {confirming ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-500 animate-pulse">再次点击确认：</span>
                <button
                  onClick={() => { onClearMistakes(); setConfirming(false); }}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-md transition-colors"
                >
                  是的，清空
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
              >
                <IconTrash className="w-4 h-4" />
                清空错词
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* 统计卡片 + 专项复习按钮 */}
          <div className="bg-gradient-to-br from-rose-100 to-rose-50 rounded-2xl p-6 text-rose-900 shadow-sm border border-rose-100 mb-4">
            <p className="text-rose-500 text-xs uppercase tracking-wider">Mistakes Collection</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-4xl font-bold">{total}</h3>
              <span className="text-rose-400 text-sm">words to tackle</span>
            </div>
            {graduatedCount > 0 && !dismissedGraduatedNotice ? (
              <p className="mt-1 text-xs text-emerald-700 font-medium">
                🏆 已攻克 <span className="font-bold">{graduatedCount}</span> 个错词
              </p>
            ) : null}
            {dueCount > 0 ? (
              <button
                onClick={() => onStartReview(dueQueue)}
                className="mt-4 w-full py-2.5 bg-white text-rose-600 font-semibold rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                开始复习今日到期的 {dueCount} 个错词
              </button>
            ) : null}
            <button
              onClick={() => onStartReview(reviewableQueue)}
              className="mt-2 w-full py-2.5 bg-white text-rose-600 font-semibold rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              复习全部 {total} 个错词
            </button>
            {spellingDueCount > 0 ? (
              <button
                onClick={() => onStartSpelling(spellingDueQueue)}
                className="mt-3 w-full py-2.5 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all duration-200"
              >
                ✍️ 今日拼写到期 {spellingDueCount} 个 · 先巩固
              </button>
            ) : null}
            <button
              onClick={() => onStartSpelling(spellingPriorityQueue)}
              className="mt-2 w-full py-2.5 bg-white text-rose-600 font-semibold rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              ✍️ 拼写训练全部 {total} 个
            </button>
          </div>

          {/* 清空错词操作区（明显位置） */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">管理复习</span>
              <span className="ml-2 text-xs text-slate-400">清空不会影响已掌握单词</span>
            </div>
            {confirming ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-500 animate-pulse">再次点击确认：</span>
                <button
                  onClick={() => { onClearMistakes(); setConfirming(false); }}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-md transition-colors"
                >
                  是的，清空
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
              >
                <IconTrash className="w-4 h-4" />
                清空错词
              </button>
            )}
          </div>

          {/* 列表 */}
          <ul className="space-y-2">
            {sortedWords.map(({ word, wrong, repetitions, spWrong, spRep, consecutiveWrong }) => {
              const threshold = graduationThreshold(wrong);
              const progress = Math.min(repetitions, threshold);
              const spThreshold = graduationThreshold(spWrong);
              const spProgress = Math.min(spRep, spThreshold);
              return (
                <li
                  key={word.id}
                  className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-800">{word.english}</span>
                        {consecutiveWrong >= 3 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-rose-600 bg-rose-100 rounded border border-rose-200 leading-none">
                            轰炸
                          </span>
                        )}
                        <span className="text-xs text-indigo-500 font-mono">{word.phonetic}</span>
                        <WordAudio word={word.english} />
                      </div>
                      <p className="text-sm text-slate-500 mt-1 break-words leading-relaxed">{word.chinese}</p>
                      {word.mnemonic && (
                        <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                          💡 {word.mnemonic}
                        </p>
                      )}
                      {word.exampleSentence && (
                        <SentenceAudio
                          word={word.english}
                          fallbackSentence={word.exampleSentence}
                          className="mt-0.5"
                        />
                      )}
                    </div>
                    <WordImage
                      english={word.english}
                      alt={word.english}
                      className="w-10 h-10 rounded-lg bg-slate-100 shrink-0"
                      zoomable={false}
                    />
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-mono text-rose-600 bg-rose-50 rounded-full border border-rose-100">
                      ×{wrong}
                    </span>
                    {threshold > 1 ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <ProgressDots progress={progress} total={threshold} color={progress >= threshold ? 'emerald' : 'amber'} />
                          <span
                            className={
                              'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full whitespace-nowrap ' +
                              (progress >= threshold
                                ? 'text-emerald-600 bg-emerald-50 border border-emerald-200'
                                : 'text-amber-600 bg-amber-50 border border-amber-200')
                            }
                          >
                            ⚑ 巩固 {progress}/{threshold}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 leading-tight">
                          {progress >= threshold
                            ? '已满足 · 再答对即可出本'
                            : `再答对 ${threshold - progress} 次出本`}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-1.5">
                      <ProgressDots progress={spProgress} total={spThreshold} color={spProgress >= spThreshold ? 'emerald' : 'indigo'} />
                      <span
                        className={
                          'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full whitespace-nowrap ' +
                          (spProgress >= spThreshold
                            ? 'text-emerald-600 bg-emerald-50 border border-emerald-200'
                            : 'text-indigo-600 bg-indigo-50 border border-indigo-200')
                        }
                      >
                        ✎ 拼写 {spProgress}/{spThreshold}
                      </span>
                    </div>
                    {spProgress < spThreshold ? (
                      <span className="text-[10px] text-slate-400 leading-tight">
                        拼写再对 {spThreshold - spProgress} 次
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};
