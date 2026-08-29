import React, { useMemo, useState } from 'react';
import { Word, SrsState } from '../../types';
import { ALL_WORDS } from '../../data';
import { matchWordKey, graduationThreshold } from '../../utils';
import { IconArrowLeft, IconTrash } from '../Icons';

interface MistakesViewProps {
  words: Word[];
  mistakeIds: string[];
  srsMap: Record<string, SrsState>;
  onGoHome: () => void;
  /** 进入专项复习 - 直接复用 StudyMode 的队列模式 */
  onStartReview: (queue: Word[]) => void;
  /** 进入拼写默写 - 看中文主动拼出英文（不与到期挂钩，全量出题） */
  onStartSpelling: (queue: Word[]) => void;
  /** 一键清空错词（不弹窗，需要用户自己二次确认） */
  onClearMistakes: () => void;
}

/**
 * 易错生词本视图
 *
 * - 自动汇总本学段标记为「易错」的单词
 * - 按错误次数降序
 * - 支持"专项复习"按钮：把易错词队列灌给学习模式
 * - 支持"清空错词"按钮：清空当前学段易错本
 */
export const MistakesView: React.FC<MistakesViewProps> = ({
  words,
  mistakeIds,
  srsMap,
  onGoHome,
  onStartReview,
  onStartSpelling,
  onClearMistakes,
}) => {
  // 二次确认态
  const [confirming, setConfirming] = useState(false);
  // 提取有效单词 + 错误次数（missing srsState 视为 0 次，但仍在 mistakeIds 中就算"易错"）
  // 支持多种 key 形式：
  //   - 新格式 wordKey: 'w:english|chinese'
  //   - 旧 id 格式: 'wd_xxx'
  // 先用当前学段查；若找不到，回退到所有学段的合并词表
  const allWords = useMemo<Word[]>(() => [...words, ...ALL_WORDS], [words]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    console.log('[MistakesView] mistakeIds总数:', mistakeIds.length, '当前学段词数:', words.length);
    if (mistakeIds.length > 0) {
      console.log('[MistakesView] mistakeIds 前 10:', mistakeIds.slice(0, 10));
      console.log('[MistakesView] 当前学段首 3 个 wordKey:', words.slice(0, 3).map(w => ({ id: w.id, key: `w:${w.english}|${w.chinese}` })));
    }
    try {
      for (const stage of ['primary', 'junior', 'senior']) {
        const raw = window.localStorage.getItem(`k12-vocab-mistakes-${stage}`);
        if (raw) console.log(`[MistakesView] localStorage ${stage}:`, raw.slice(0, 200));
      }
    } catch {}
    return null;
  }, [mistakeIds.length]);

  const sortedWords = mistakeIds
    .map((id, idx) => {
      const w = matchWordKey(allWords, id);
      if (!w) return null;
      // srsMap 同时支持 key 和旧 id
      const srs = srsMap[id] ?? srsMap[w.id] ?? srsMap[`w:${w.english}|${w.chinese}`];
      return {
        word: w,
        wrong: srs?.wrongCount ?? 0,
        repetitions: srs?.repetitions ?? 0,
        dueAt: srs?.dueAt ?? 0,
        idx,
      };
    })
    .filter(
      (x): x is { word: Word; wrong: number; repetitions: number; dueAt: number; idx: number } =>
        x !== null,
    )
    // 主排序：错次多 → 少；同错次：先加入 mistakeIds 的在前
    .sort((a, b) => (b.wrong - a.wrong) || (a.idx - b.idx));

  const total = sortedWords.length;
  const now = Date.now();
  // 今日到期错词：dueAt=0（新错词）或已到复习期 → 间隔巩固的核心队列
  const dueQueue = sortedWords
    .filter(s => s.dueAt === 0 || s.dueAt <= now)
    .map(s => s.word);
  const dueCount = dueQueue.length;
  const reviewableQueue = sortedWords.map(s => s.word);

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
        <h2 className="text-xl font-bold text-slate-800">易错生词本</h2>
        <div className="w-16"></div>
      </div>

      {total === 0 ? (
        <>
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 mb-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🎯
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">暂无易错词</h3>
            <p className="text-slate-500 text-sm">
              回答时标记"模糊"或"不认识"的词会自动收纳到这里，便于专项攻克。
            </p>
          </div>

          {/* 清空错词操作区（始终可见，让用户能主动清理残留脏数据） */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">管理错词本</span>
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
            {dueCount > 0 ? (
              <button
                onClick={() => onStartReview(dueQueue)}
                className="mt-4 w-full py-2.5 bg-white text-rose-600 font-semibold rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                开始复习今日到期的 {dueCount} 个易错词
              </button>
            ) : null}
            <button
              onClick={() => onStartReview(reviewableQueue)}
              className="mt-2 w-full py-2 text-rose-500 hover:text-rose-700 text-sm underline underline-offset-4 transition-colors"
            >
              复习全部 {total} 个错词
            </button>
            <button
              onClick={() => onStartSpelling(reviewableQueue)}
              className="mt-3 w-full py-2.5 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all duration-200"
            >
              ✍️ 拼写默写训练（看中文 · 拼出英文）
            </button>
          </div>

          {/* 清空错词操作区（明显位置） */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">管理错词本</span>
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
            {sortedWords.map(({ word, wrong, repetitions }) => {
              const threshold = graduationThreshold(wrong);
              const progress = Math.min(repetitions, threshold);
              return (
                <li
                  key={word.id}
                  className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-slate-800">{word.english}</span>
                      <span className="text-xs text-indigo-500 font-mono">{word.phonetic}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 break-words leading-relaxed">{word.chinese}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-mono text-rose-600 bg-rose-50 rounded-full border border-rose-100">
                      ×{wrong}
                    </span>
                    {threshold > 1 ? (
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
