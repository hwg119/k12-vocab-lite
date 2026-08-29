import React, { useState, useCallback, useEffect, useMemo, useRef, Fragment } from 'react';
import { Word, ReviewFeedback } from '../../types';
import { IconArrowLeft, IconCheck, IconX } from '../Icons';
import { splitSyllables } from '../../utils/syllables';

interface SpellingModeProps {
  studyQueue: Word[];
  /** 拼写正确是否纳入连续答对毕业（易错词拼写训练专用） */
  onSubmit: (id: string, feedback: ReviewFeedback) => void;
  /** 易错词"毕业"庆祝提示（由 App 传入） */
  graduatedNotice?: { english: string; key: number } | null;
  onGoHome: () => void;
}

/**
 * 拼写默写模式（易错词主动回忆·点选式）
 *
 * 保留"主动回忆"记忆强度但降低门槛：
 * - 展示中文释义 + 音标，首字母（短词给 1 个、长词给 2 个）自动提示
 * - 词按音节分段展示，作为视觉脚手架
 * - 不弹键盘，从屏幕字母按钮按顺序点选填补，可撤销
 * 拼写正确 = know（推进连续答对/毕业），拼写错误 = unknown（重置）。
 */
export const SpellingMode: React.FC<SpellingModeProps> = ({
  studyQueue,
  onSubmit,
  graduatedNotice,
  onGoHome,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // 用户按顺序点选填入的字母（对应首字母之后的位置）
  const [picked, setPicked] = useState<string[]>([]);
  // 已被点击的按钮下标
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [result, setResult] = useState<'idle' | 'correct' | 'failed'>('idle');

  const [graduateToast, setGraduateToast] = useState<{ english: string } | null>(null);
  const lastNoticeKeyRef = useRef<number>(0);
  useEffect(() => {
    if (!graduatedNotice) return;
    if (graduatedNotice.key === lastNoticeKeyRef.current) return;
    lastNoticeKeyRef.current = graduatedNotice.key;
    setGraduateToast({ english: graduatedNotice.english });
    const t = setTimeout(() => setGraduateToast(null), 2800);
    return () => clearTimeout(t);
  }, [graduatedNotice]);

  const currentWord = studyQueue[currentIndex];
  const progress = studyQueue.length > 0 ? ((currentIndex + 1) / studyQueue.length) * 100 : 0;

  const wordLower = (currentWord?.english ?? '').toLowerCase().replace(/[^a-z]/g, '');
  // 首字母提示：短词 1 个，长词 2 个
  const fixedCount = wordLower.length <= 4 ? 1 : 2;
  const remaining = wordLower.slice(fixedCount);
  // 每字符所属音节段（用于填空区的分段提示）
  const segOf: number[] = useMemo(() => {
    const s = splitSyllables(currentWord?.english ?? '');
    const map: number[] = [];
    s.forEach((seg, si) => {
      for (let k = 0; k < seg.length; k++) map.push(si);
    });
    return map;
  }, [currentWord]);

  // 字母按钮区：目标字母打乱 + 少量干扰字母（增强再认）
  const buttons = useMemo(() => {
    const arr: { char: string }[] = [];
    for (const c of remaining) arr.push({ char: c });
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const present = new Set(remaining.split(''));
    const alpha = 'abcdefghijklmnopqrstuvwxyz';
    const want = wordLower.length <= 5 ? 1 : 2;
    let guard = 0;
    while (arr.length - remaining.length < want && guard++ < 60 && arr.length < 16) {
      const cand = alpha[Math.floor(Math.random() * 26)];
      if (!present.has(cand)) {
        arr.push({ char: cand });
        present.add(cand);
      }
    }
    return arr;
  }, [wordLower, remaining]);

  const reset = useCallback(() => {
    setPicked([]);
    setUsedIds([]);
    setResult('idle');
  }, []);

  const advance = useCallback(() => {
    if (currentIndex < studyQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onGoHome();
      return;
    }
    reset();
  }, [currentIndex, studyQueue.length, onGoHome, reset]);

  // 切换单词时重置
  useEffect(() => {
    reset();
  }, [currentIndex, reset]);

  const pick = useCallback(
    (i: number) => {
      if (result !== 'idle' || usedIds.includes(i)) return;
      setPicked(prev => [...prev, buttons[i].char]);
      setUsedIds(prev => [...prev, i]);
    },
    [result, usedIds, buttons]
  );

  const undo = useCallback(() => {
    if (result !== 'idle' || !usedIds.length) return;
    setPicked(prev => prev.slice(0, -1));
    setUsedIds(prev => prev.slice(0, -1));
  }, [result, usedIds]);

  const canCheck = remaining.length > 0 && picked.length === remaining.length;

  const check = useCallback(() => {
    if (!currentWord || !canCheck || result !== 'idle') return;
    const ok = picked.join('') === remaining;
    setResult(ok ? 'correct' : 'failed');
    onSubmit(currentWord.id, ok ? 'know' : 'unknown');
  }, [currentWord, picked, canCheck, result, remaining, onSubmit]);

  if (!currentWord) {
    return (
      <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto px-6 animate-fade-in">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <IconCheck className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">拼写训练完成</h2>
        <p className="text-slate-500 text-center mb-6">
          已过完全部拼写。拼错的词会留在易错本，明天按间隔巩固。
        </p>
        <button
          onClick={onGoHome}
          className="px-8 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200"
        >
          回首页
        </button>
      </div>
    );
  }

  const isCorrect = result === 'correct';
  const isFailed = result === 'failed';

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto w-full animate-fade-in px-6">
      {/* 毕业庆祝 toast */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        {graduateToast && (
          <div className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-300/40 animate-fade-in">
            <span className="text-xl">🎉</span>
            <span className="font-semibold">
              已攻克 <span className="font-bold">{graduateToast.english}</span>！移出易错本
            </span>
          </div>
        )}
      </div>

      {/* 顶部进度 + 返回 */}
      <div className="w-full max-w-md mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onGoHome}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <IconArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-slate-700 text-sm font-medium whitespace-nowrap">
            {currentIndex + 1} / {studyQueue.length}
          </span>
        </div>
        <p className="text-xs text-rose-500 font-medium text-center mt-1">
          拼写训练 · 按音节点选字母（首字母已给出）
        </p>
      </div>

      {/* 卡片：中文 + 音标 */}
      <div
        className={`bg-white rounded-2xl shadow-sm border transition-colors mb-5 w-full max-w-md ${
          isCorrect ? 'border-emerald-300' : isFailed ? 'border-rose-300' : 'border-slate-200'
        }`}
      >
        <div className="p-7 text-center">
          <div className="text-2xl font-bold text-slate-800 leading-relaxed break-words whitespace-pre-wrap">
            {currentWord.chinese}
          </div>
          {currentWord.phonetic && (
            <div className="mt-3 text-lg text-indigo-500 font-mono">{currentWord.phonetic}</div>
          )}
        </div>
      </div>

      {/* 填空区：音节分段 + 首字母提示 */}
      <div className="w-full max-w-md mb-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex flex-wrap justify-center items-center gap-1.5">
            {wordLower.split('').map((ch, j) => {
              const isFixed = j < fixedCount;
              const fill = isFixed ? ch : picked[j - fixedCount] || '';
              const segStart = j > 0 && segOf[j] !== segOf[j - 1];
              return (
                <Fragment key={j}>
                  {segStart && (
                    <div className="w-3 text-slate-300 text-xl font-light self-center">|</div>
                  )}
                  <div
                    className={`min-w-7 h-11 px-0.5 flex items-center justify-center rounded-lg border-b-4 text-xl font-bold ${
                      isFixed
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-600'
                        : fill
                          ? 'bg-white border-slate-300 text-slate-800 '
                          : 'border-dashed border-slate-300 text-transparent'
                    }`}
                  >
                    {fill || '·'}
                  </div>
                </Fragment>
              );
            })}
          </div>
          {result === 'idle' && (
            <p className="mt-3 text-center text-xs text-slate-400">
              从下方点选字母补全，点错可用 <span className="font-medium">撤销</span> 重排
            </p>
          )}
        </div>
      </div>

      {/* 判定反馈 */}
      <div className="w-full max-w-md min-h-[52px]">
        {isCorrect && (
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold animate-fade-in">
            <IconCheck className="w-5 h-5" /> 拼写正确！
          </div>
        )}
        {isFailed && (
          <div className="flex items-center justify-center gap-2 text-rose-600 font-semibold animate-fade-in">
            <IconX className="w-5 h-5" />
            正确拼写：<span className="font-bold">{currentWord.english}</span>
          </div>
        )}

        {result !== 'idle' && (
          <div className="mt-2 mb-3 bg-slate-50 rounded-xl p-4 animate-fade-in">
            {currentWord.exampleSentence && (
              <p className="text-sm text-slate-600 leading-relaxed break-words whitespace-pre-wrap italic">
                “{currentWord.exampleSentence}”
              </p>
            )}
            {currentWord.mnemonic && (
              <p className="text-xs text-amber-700 mt-2">💡 {currentWord.mnemonic}</p>
            )}
          </div>
        )}
      </div>

      {/* 字母按钮区 + 控制 */}
      {result === 'idle' ? (
        <>
          <div className="flex flex-wrap justify-center gap-2 max-w-md mb-5">
            {buttons.map((b, i) => (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={usedIds.includes(i)}
                className={`w-9 h-11 rounded-xl text-xl font-bold border transition-all duration-150 ${
                  usedIds.includes(i)
                    ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-default scale-90'
                    : 'bg-white border-slate-300 text-slate-700 shadow-sm hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 active:scale-95'
                }`}
              >
                {b.char}
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full max-w-md">
            <button
              onClick={undo}
              disabled={!usedIds.length}
              className={`px-4 py-3 rounded-xl font-semibold border transition-all duration-200 ${
                !usedIds.length
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              ← 撤销
            </button>
            <button
              onClick={check}
              disabled={!canCheck}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${
                canCheck
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              核对拼写{!canCheck && remaining.length > 0 && `（还差 ${remaining.length - picked.length} 个字母）`}
            </button>
          </div>
        </>
      ) : (
        <div className="w-full max-w-md mt-1">
          <button
            onClick={advance}
            className="w-full py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200"
          >
            {currentIndex < studyQueue.length - 1 ? '下一个' : '查看结果'}
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">可停留查看例句与助记</p>
        </div>
      )}
    </div>
  );
};