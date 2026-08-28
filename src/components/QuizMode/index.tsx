import React, { useState, useCallback, useEffect, useRef } from 'react';
import { QuizQuestion } from '../../types';
import { IconCheck, IconXCircle } from '../Icons';
import { getScoreRating } from '../../utils/quiz';

interface QuizModeProps {
  questions: QuizQuestion[];
  onGoHome: () => void;
  onRestart: () => void;
  /** 用户回答后回调（true=答对，false=答错），用于打卡统计/勋章 */
  onAnswer?: (isCorrect: boolean) => void;
  /** 'daily' = 无计时；'sprint' = 有 60s 倒计时 */
  mode?: 'daily' | 'sprint';
}

/**
 * 测验模式组件 - 移动端布局优化版
 * 充分利用横向空间，优化留白和间距
 *
 * 双模式：
 *   - daily: 固定 20 题，无计时
 *   - sprint: 限时 60 秒
 */
export const QuizMode: React.FC<QuizModeProps> = ({
  questions,
  onGoHome,
  onRestart,
  onAnswer,
  mode = 'daily',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(mode === 'sprint' ? 60 : 0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback((index: number) => {
    if (selectedOption !== null) return;

    setSelectedOption(index);

    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    // 通知外层用于打卡 + 勋章统计
    onAnswer?.(isCorrect);
  }, [currentQuestion.correctIndex, selectedOption, onAnswer]);

  // sprint 模式倒计时
  useEffect(() => {
    if (mode !== 'sprint') return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode]);

  // 全部题目答完时停止 sprint 计时
  useEffect(() => {
    if (mode !== 'sprint') return;
    if (currentIndex >= questions.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsFinished(true);
    }
  }, [currentIndex, questions.length, mode]);

  // 使用useEffect处理答案后的延迟跳转，确保正确清理定时器
  useEffect(() => {
    if (selectedOption === null) return;

    timerRef.current = setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setIsFinished(true);
      }
    }, 1500);

    // 清理函数：组件卸载或依赖变化时清除定时器
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [selectedOption, currentIndex, questions.length]);

  if (isFinished) {
    const rating = getScoreRating(score, Math.max(questions.length, 1));
    const label = mode === 'sprint' ? '冲刺结束' : 'Quiz Complete!';

    return (
      <div className="h-full flex flex-col items-center justify-center animate-scale-in w-full px-4 sm:px-6">
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <span className="text-4xl">🏆</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">{label}</h2>
        <p className="text-base text-slate-500 mb-1">
          本次答对 <span className={`font-bold text-xl ${rating.color}`}>{score}</span> 题
          {mode === 'sprint' && currentIndex < questions.length && (
            <span className="text-slate-400 text-sm ml-2">/ 共 {questions.length} 题</span>
          )}
          {mode === 'daily' && (
            <span className="text-slate-400 text-sm ml-2">/ {questions.length} 题</span>
          )}
        </p>
        <p className={`text-base font-medium mb-8 ${rating.color}`}>{rating.message}</p>

        <div className="flex gap-3 w-full max-w-sm">
          <button
            onClick={onRestart}
            className="flex-1 py-3.5 px-6 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95 text-sm"
          >
            再来一次
          </button>
          <button
            onClick={onGoHome}
            className="flex-1 py-3.5 px-6 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-200 text-sm"
          >
            回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full px-4 sm:px-6 py-4 animate-fade-in">
      {/* Header - 顶部信息栏 */}
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Question {currentIndex + 1}/{questions.length}
        </span>
        <div className="flex items-center gap-2">
          {mode === 'sprint' && (
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${timeLeft <= 10 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-rose-50 text-rose-600'}`}>
              ⏱ {timeLeft}s
            </span>
          )}
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
            Score: {score}
          </span>
        </div>
      </div>

      {/* Question Card - 全宽卡片，移动端充分利用空间 */}
      <div className="w-full bg-white rounded-2xl shadow-lg p-5 sm:p-8 mb-4 text-center border border-slate-100">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 animate-fade-in">
          {currentQuestion.word.english}
        </h2>
        <p className="text-slate-400 font-mono text-base sm:text-lg">{currentQuestion.word.phonetic}</p>
        
        {/* Feedback Message Area - 固定高度 */}
        <div className="h-8 mt-4 flex items-center justify-center">
          <div className={`transition-all duration-300 ${selectedOption !== null ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-90'}`}>
            {selectedOption !== null && (
              <div className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
                selectedOption === currentQuestion.correctIndex 
                  ? 'text-emerald-500' 
                  : 'text-rose-500'
              }`}>
                {selectedOption === currentQuestion.correctIndex ? (
                  <>
                    <IconCheck className="w-5 h-5" /> Correct! 🎉
                  </>
                ) : (
                  <>
                    <IconXCircle className="w-5 h-5" /> Not quite!
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Options - 全宽选项网格，优化间距 */}
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQuestion.options.map((option, idx) => {
          const isCorrect = idx === currentQuestion.correctIndex;
          const isSelected = idx === selectedOption;
          const hasAnswered = selectedOption !== null;
          
          let btnClass = "w-full h-full min-h-[4.5rem] sm:min-h-[5rem] p-4 rounded-xl border-2 text-left font-medium text-sm transition-all duration-200 flex items-center ";
          
          if (!hasAnswered) {
            btnClass += "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 shadow-sm";
          } else {
            if (isCorrect) {
              btnClass += "bg-emerald-100 border-emerald-500 text-emerald-800 shadow-sm";
            } else if (isSelected) {
              btnClass += "bg-rose-100 border-rose-500 text-rose-800";
            } else {
              btnClass += "bg-slate-50 border-slate-100 text-slate-400 opacity-50";
            }
          }

          return (
            <button 
              key={idx}
              disabled={hasAnswered}
              onClick={() => handleAnswer(idx)}
              className={btnClass}
            >
              <span className="line-clamp-2 leading-snug">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
