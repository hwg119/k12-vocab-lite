import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Word, ReviewFeedback } from '../../types';
import { IconArrowLeft, IconArrowRight, IconCheck, IconClock, IconBookOpen, IconQuestion } from '../Icons';
import { WordImage } from '../WordImage';
import { WordAudio } from '../WordAudio';

import { decomposeWord } from '../../utils/affix';
import { playKnowSound, playUnknownSound } from '../../utils/sound';

interface StudyModeProps {
  studyQueue: Word[];
  learnedIds: Set<string>;
  source?: 'default' | 'review' | 'mistakes' | 'unit' | 'confusion' | 'newWord' | 'batch';
  /** 用户提交二档反馈（know / unknown）
   *  - know    → mastered
   *  - unknown → mistake+ 降级
   */
  onSubmit: (id: string, feedback: ReviewFeedback) => void;
  onGoHome: () => void;
}

/**
 * 学习模式 v2 - 二档反馈
 *
 * 替换原来的三档为二档：移除"模糊"档（与"不认识"在 SRS/错词本/复习路径上实际等价），
 * 减少学生的决策疲劳。
 *   - Know（认识）→ 绿色 solid
 *   - Unknown（不认识）→ 红色 outline
 *
 * 反馈会自动驱动 SM2 算法与错词本
 */
export const StudyMode: React.FC<StudyModeProps> = ({
  studyQueue,
  learnedIds,
  source,
  onSubmit,
  onGoHome,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const isProcessingRef = useRef(false);

  const currentWord = studyQueue[currentIndex];
  const progress = studyQueue.length > 0 ? ((currentIndex + 1) / studyQueue.length) * 100 : 0;
  const affix = useMemo(() => currentWord ? decomposeWord(currentWord.english) : null, [currentWord]);

  const goToNext = useCallback(() => {
    if (currentIndex < studyQueue.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      // 完成学习 → onGoHome
      // 来源为 confusion 时由 App 决定回混淆页；其他情况回首页
      onGoHome();
    }
  }, [currentIndex, studyQueue.length, onGoHome]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0 && !isProcessingRef.current) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  }, [currentIndex]);

  const submitAndAdvance = useCallback(
    (feedback: ReviewFeedback) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      onSubmit(currentWord.id, feedback);
      if (feedback === 'know') playKnowSound();
      else playUnknownSound();
      goToNext();
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 200);
    },
    [currentWord, onSubmit, goToNext],
  );

  // 键盘快捷键：↑ 不认识 ↓ 认识 ← 上一张 → 下一张 Space/Enter 翻转
  useEffect(() => {
    if (!currentWord) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          submitAndAdvance('unknown');
          break;
        case 'ArrowDown':
          e.preventDefault();
          submitAndAdvance('know');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          setIsFlipped(prev => !prev);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentWord, submitAndAdvance, handlePrev, goToNext]);

  // 空状态
  if (!currentWord) {
    return (
      <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto px-6 animate-fade-in">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <IconBookOpen className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">本批次完成</h2>
        <p className="text-slate-500 text-center mb-6">
          你已经过完本次学习队列。错词已自动加入错词本，可随时专项攻克。
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

  return (
    <div className="h-full flex flex-col items-center justify-start max-w-2xl mx-auto w-full animate-slide-up px-6 pt-6">
      {/* 进度条 */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-2 text-slate-400 hover:text-indigo-600 transition-colors duration-200 ${
              currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <IconArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center">
            <div className="text-slate-700 text-sm font-medium">
              {currentIndex + 1} / {studyQueue.length}
            </div>
            {source === 'mistakes' && (
              <span className="text-xs text-rose-500 mt-0.5">专项复习</span>
            )}
            {source === 'confusion' && (
              <span className="text-xs text-amber-600 mt-0.5">易混词对比</span>
            )}
          </div>
          <button
            onClick={() => {
              if (isProcessingRef.current) return;
              goToNext();
            }}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors duration-200"
          >
            <IconArrowRight className="w-6 h-6" />
          </button>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 单词卡片 */}
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 relative cursor-pointer hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 mb-4"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="absolute top-3 right-3 z-10">
          {learnedIds.has(currentWord.id) ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 backdrop-blur-sm text-emerald-600 text-[11px] font-medium border border-emerald-100/80">
              <IconCheck className="w-3 h-3" />
              Mastered
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50/80 backdrop-blur-sm text-amber-600 text-[11px] font-medium border border-amber-100/80">
              <IconClock className="w-3 h-3" />
              Reviewing
            </span>
          )}
        </div>

        <div className="flex flex-col items-center justify-start py-8 px-10 text-center h-[400px] overflow-y-auto">
          {/* 单行为先：单词尽可能大，长单词允许盖住右上角徽（徽为辅） */}
          <div className="flex items-center gap-4 mb-6 w-full justify-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 break-words animate-fade-in">
                {currentWord.english}
              </h2>
              <p className="text-lg text-indigo-500 font-mono mt-2">
                {currentWord.phonetic}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <WordAudio word={currentWord.english} />
              <WordImage
                english={currentWord.english}
                alt={currentWord.english}
                className="w-16 h-16 rounded-xl bg-slate-50"
              />
            </div>
          </div>

          <div className={`w-12 h-px bg-slate-200 mb-8 transition-all duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}></div>

          <div className={`transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xl text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
              {currentWord.chinese}
            </p>
            {currentWord.mnemonic && (
              <p className="text-sm text-amber-700 mt-4 bg-amber-50 inline-block px-3 py-1.5 rounded-lg border border-amber-100">
                💡 {currentWord.mnemonic}
              </p>
            )}
            {affix && (
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                <span className="font-medium text-slate-600">构词：</span>
                {affix.prefix && <span className="text-indigo-500">{affix.prefix.affix} </span>}
                {affix.root && <span className="text-emerald-600">{affix.root.affix} </span>}
                {affix.suffix && <span className="text-rose-500">{affix.suffix.affix}</span>}
                <br />
                {affix.prefix && <span className="text-slate-400">前缀 {affix.prefix.affix} = {affix.prefix.meaning} · </span>}
                {affix.root && <span className="text-slate-400">词根 {affix.root.affix} = {affix.root.meaning} · </span>}
                {affix.suffix && <span className="text-slate-400">后缀 {affix.suffix.affix} = {affix.suffix.meaning}</span>}
              </p>
            )}
          </div>

          {!isFlipped && (
            <p className="absolute bottom-6 left-0 right-0 text-slate-300 text-xs uppercase tracking-wider">
              点击卡片查看释义
            </p>
          )}
        </div>
      </div>

      {/* 二档反馈按钮（认识/不认识） */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        <button
          onClick={() => submitAndAdvance('unknown')}
          className="py-3 px-3 rounded-xl font-semibold bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all text-sm"
        >
          <div className="flex flex-col items-center gap-0.5">
            <IconQuestion className="w-4 h-4" />
            <span>不认识</span>
          </div>
        </button>
        <button
          onClick={() => submitAndAdvance('know')}
          className="py-3 px-3 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all text-sm"
        >
          <div className="flex flex-col items-center gap-0.5">
            <IconCheck className="w-4 h-4" />
            <span>认识</span>
          </div>
        </button>
      </div>
    </div>
  );
};
