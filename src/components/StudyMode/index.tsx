import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Word, ReviewFeedback } from '../../types';
import { IconArrowLeft, IconArrowRight, IconCheck, IconClock, IconBookOpen, IconQuestion } from '../Icons';
import { WordImage } from '../WordImage';

interface StudyModeProps {
  studyQueue: Word[];
  learnedIds: Set<string>;
  source?: 'default' | 'review' | 'mistakes' | 'unit' | 'confusion' | 'newWord' | 'batch';
  /** 易错词"毕业"庆祝提示（专项复习连续答对达标时由 App 传入） */
  graduatedNotice?: { english: string; key: number } | null;
  /** 用户提交一档反馈（know / vague / unknown）
   *  - know   → mastered
   *  - vague  → mistake+
   *  - unknown → mistake+ 大幅降级
   */
  onSubmit: (id: string, feedback: ReviewFeedback) => void;
  onGoHome: () => void;
}

/**
 * 学习模式 v2 - 三档反馈
 *
 * 替换原来的二按钮（Review Later / Mastered）为三档反馈：
 *   - Know（认识）→ 绿色 solid
 *   - Vague（模糊）→ 黄色 outline
 *   - Unknown（不认识）→ 红色 outline
 *
 * 反馈会自动驱动 SM2 算法与易错生词本
 */
export const StudyMode: React.FC<StudyModeProps> = ({
  studyQueue,
  learnedIds,
  source,
  graduatedNotice,
  onSubmit,
  onGoHome,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const isProcessingRef = useRef(false);
  // 易错词"毕业"庆祝 toast
  const [graduateToast, setGraduateToast] = useState<{ english: string } | null>(null);
  const lastNoticeKeyRef = useRef<number>(0);
  useEffect(() => {
    if (source !== 'mistakes' || !graduatedNotice) return;
    if (graduatedNotice.key === lastNoticeKeyRef.current) return;
    lastNoticeKeyRef.current = graduatedNotice.key;
    setGraduateToast({ english: graduatedNotice.english });
    const t = setTimeout(() => setGraduateToast(null), 2800);
    return () => clearTimeout(t);
  }, [graduatedNotice, source]);

  const currentWord = studyQueue[currentIndex];
  const progress = studyQueue.length > 0 ? ((currentIndex + 1) / studyQueue.length) * 100 : 0;

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
      goToNext();
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 200);
    },
    [currentWord, onSubmit, goToNext],
  );

  // 空状态
  if (!currentWord) {
    return (
      <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto px-6 animate-fade-in">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <IconBookOpen className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">本批次完成</h2>
        <p className="text-slate-500 text-center mb-6">
          你已经过完本次学习队列。错词已自动加入易错生词本，可随时专项攻克。
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
      {/* 易错词毕业庆祝 toast */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        {graduateToast && (
          <div className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-300/40 animate-fade-in">
            <span className="text-xl">🎉</span>
            <span className="font-semibold">
              已攻克 <span className="font-bold">{graduateToast.english}</span>！连续答对达标，移出易错本
            </span>
          </div>
        )}
      </div>
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
        <div className="absolute top-5 right-5 z-10">
          {learnedIds.has(currentWord.id) ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100">
              <IconCheck className="w-3.5 h-3.5" />
              Mastered
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium border border-amber-100">
              <IconClock className="w-3.5 h-3.5" />
              Reviewing
            </span>
          )}
        </div>

        <div className="flex flex-col items-center justify-start py-8 px-10 text-center h-[400px] overflow-y-auto">
          <div className="flex items-center gap-4 mb-6 w-full justify-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 break-words animate-fade-in">
                {currentWord.english}
              </h2>
              <p className="text-lg text-indigo-500 font-mono mt-2">
                {currentWord.phonetic}
              </p>
            </div>
            <WordImage
              english={currentWord.english}
              alt={currentWord.english}
              className="w-16 h-16 rounded-xl bg-slate-50 shrink-0"
            />
          </div>

          <div className={`w-12 h-px bg-slate-200 mb-8 transition-all duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}></div>

          <div className={`transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xl text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
              {currentWord.chinese}
            </p>
            {currentWord.exampleSentence && (
              <p className="text-sm text-slate-500 mt-4 leading-relaxed break-words whitespace-pre-wrap italic">
                “{currentWord.exampleSentence}”
              </p>
            )}
            {currentWord.mnemonic && (
              <p className="text-sm text-amber-700 mt-4 bg-amber-50 inline-block px-3 py-1.5 rounded-lg border border-amber-100">
                💡 {currentWord.mnemonic}
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

      {/* 三档反馈按钮 */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-md">
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
          onClick={() => submitAndAdvance('vague')}
          className="py-3 px-3 rounded-xl font-semibold bg-white border-2 border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-all text-sm"
        >
          <div className="flex flex-col items-center gap-0.5">
            <IconClock className="w-4 h-4" />
            <span>模糊</span>
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
