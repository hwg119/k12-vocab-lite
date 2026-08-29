import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Word, ReviewFeedback } from '../../types';
import { IconArrowLeft, IconCheck, IconX } from '../Icons';

interface SpellingModeProps {
  studyQueue: Word[];
  /** 拼写正确是否纳入连续答对毕业（易错词拼写训练专用） */
  onSubmit: (id: string, feedback: ReviewFeedback) => void;
  /** 易错词"毕业"庆祝提示（由 App 传入） */
  graduatedNotice?: { english: string; key: number } | null;
  onGoHome: () => void;
}

/**
 * 拼写默写模式（易错词主动回忆）
 *
 * 与学习模式相反：展示中文释义 + 音标 → 用户主动输入英文拼写，
 * 拼写正确 = know（推进连续答对/毕业），拼写错误 = unknown（重置）。
 */
export const SpellingMode: React.FC<SpellingModeProps> = ({
  studyQueue,
  onSubmit,
  graduatedNotice,
  onGoHome,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  // 'idle' | 'correct' | 'failed'
  const [result, setResult] = useState<'idle' | 'correct' | 'failed'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

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

  /** 归一化：转小写、去首尾空格，忽略大小写与首尾标点差异 */
  const normalize = useCallback((s: string) => s.trim().toLowerCase(), []);

  const advance = useCallback(() => {
    setInput('');
    setResult('idle');
    if (currentIndex < studyQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onGoHome();
    }
    inputRef.current?.focus();
  }, [currentIndex, studyQueue.length, onGoHome]);

  const check = useCallback(() => {
    if (!currentWord || result !== 'idle') return;
    const ok = normalize(input) === normalize(currentWord.english);
    setResult(ok ? 'correct' : 'failed');
    onSubmit(currentWord.id, ok ? 'know' : 'unknown');
    // 短暂停留让用户看到判定结果，再进入下一个
    setTimeout(() => advance(), ok ? 1100 : 1600);
  }, [currentWord, input, result, normalize, onSubmit, advance]);

  // 未挂载时聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

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
        <p className="text-xs text-rose-500 font-medium text-center mt-1">拼写默写 · 看中文拼出英文</p>
      </div>

      {/* 卡片：中文 + 音标 */}
      <div
        className={`bg-white rounded-2xl shadow-sm border transition-colors mb-6 w-full max-w-md ${
          isCorrect ? 'border-emerald-300' : isFailed ? 'border-rose-300' : 'border-slate-200'
        }`}
      >
        <div className="p-8 text-center">
          <div className="text-2xl font-bold text-slate-800 leading-relaxed break-words">
            {currentWord.chinese}
          </div>
          {currentWord.phonetic && (
            <div className="mt-3 text-lg text-indigo-500 font-mono">{currentWord.phonetic}</div>
          )}
        </div>
      </div>

      {/* 输入区 */}
      <div className="w-full max-w-md">
        <input
          ref={inputRef}
          type="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="w-full px-4 py-3 rounded-xl bg-slate-50 border text-lg text-center font-semibold outline-none focus:bg-white focus:ring-2 transition-all "
          placeholder="输入英文拼写…"
          value={input}
          disabled={result !== 'idle'}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              check();
            }
          }}
        />

        {/* 判定反馈 */}
        <div className="mt-3 min-h-[52px]">
          {result === 'correct' && (
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold animate-fade-in">
              <IconCheck className="w-5 h-5" /> 拼写正确！
            </div>
          )}
          {result === 'failed' && (
            <div className="flex items-center justify-center gap-2 text-rose-600 font-semibold animate-fade-in">
              <IconX className="w-5 h-5" />
              正确拼写：<span className="font-bold">{currentWord.english}</span>
            </div>
          )}
        </div>

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

        {result === 'idle' ? (
          <button
            onClick={check}
            disabled={!input.trim()}
            className={`w-full py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200 ${
              !input.trim() ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            核对拼写
          </button>
        ) : (
          <div className="text-center text-sm text-slate-400 py-3">即将进入下一个…</div>
        )}
      </div>
    </div>
  );
};