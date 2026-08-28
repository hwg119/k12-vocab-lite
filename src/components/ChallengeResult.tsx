import React from 'react';
import { IconArrowLeft } from './Icons';

interface ChallengeResultProps {
  myScore: number;
  myTimeSec: number;
  opponentScore: number;
  opponentTimeSec: number;
  totalQuestions: number;
  onGoHome: () => void;
  onRematch: () => void;
}

/**
 * 挑战结果对比页 - 双方同题 PK 后展示胜负
 */
export const ChallengeResult: React.FC<ChallengeResultProps> = ({
  myScore,
  myTimeSec,
  opponentScore,
  opponentTimeSec,
  totalQuestions,
  onGoHome,
  onRematch,
}) => {
  // 判定胜负：高分胜；同分看用时
  const myBetterScore = myScore > opponentScore;
  const tieScore = myScore === opponentScore;
  const myBetterTime = tieScore && myTimeSec < opponentTimeSec;
  const iWin = myBetterScore || myBetterTime;

  const verdict = iWin ? '🏆 你赢了！' : tieScore && !myBetterTime ? '🤝 平局' : '💪 好友赢了';
  const verdictColor = iWin
    ? 'text-emerald-600'
    : tieScore && !myBetterTime
      ? 'text-amber-600'
      : 'text-rose-600';

  return (
    <div className="w-full max-w-2xl mx-auto animate-scale-in px-2 sm:px-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          回首页
        </button>
        <h2 className="text-xl font-bold text-slate-800">挑战结果</h2>
        <div className="w-16" />
      </div>

      <div className={`text-center text-2xl sm:text-3xl font-bold mb-6 ${verdictColor}`}>
        {verdict}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        {/* 我方 */}
        <div className={`rounded-2xl border-2 p-4 sm:p-6 ${iWin ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
          <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">我</div>
          <div className={`text-4xl sm:text-5xl font-bold ${iWin ? 'text-emerald-600' : 'text-slate-700'}`}>
            {myScore}
          </div>
          <div className="text-xs text-slate-400 mt-1">/ {totalQuestions} 题</div>
          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
            用时 <span className="font-bold text-slate-700">{myTimeSec}s</span>
          </div>
        </div>

        {/* 好友 */}
        <div className={`rounded-2xl border-2 p-4 sm:p-6 ${!iWin && !(tieScore && !myBetterTime) ? 'border-rose-300 bg-rose-50' : tieScore && !myBetterTime ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
          <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">好友</div>
          <div className={`text-4xl sm:text-5xl font-bold ${!iWin && !(tieScore && !myBetterTime) ? 'text-rose-600' : 'text-slate-700'}`}>
            {opponentScore}
          </div>
          <div className="text-xs text-slate-400 mt-1">/ {totalQuestions} 题</div>
          <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
            用时 <span className="font-bold text-slate-700">{opponentTimeSec}s</span>
          </div>
        </div>
      </div>

      {/* 比分对比要点 */}
      <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1 mb-6">
        {tieScore ? (
          <p>双方得分相同{myBetterTime ? '，你更快！' : myTimeSec === opponentTimeSec ? '，连用时都一样，势均力敌！' : '，好友更快一些。'}</p>
        ) : (
          <p>
            分差 <span className="font-bold">{Math.abs(myScore - opponentScore)}</span> 题
          </p>
        )}
        <p className="text-xs text-slate-400">挑战码由本地生成，所有计算在设备上完成</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRematch}
          className="flex-1 py-3.5 px-6 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-95 text-sm"
        >
          再来一局
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
};