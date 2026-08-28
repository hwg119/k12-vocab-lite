import React from 'react';
import { IconArrowLeft } from './Icons';

interface QuizEntryProps {
  onGoHome: () => void;
  onStartDaily: () => void;
  onStartSprint: () => void;
  onStartChallenge: () => void;
}

/**
 * 测验入口 - 选择模式
 *
 * 日常：20 题，固定节奏，适合每日打卡
 * 冲刺：限时 60 秒，看能答对多少，适合薄弱词特训
 * 挑战：发起对战码邀请好友 PK 同题
 */
export const QuizEntry: React.FC<QuizEntryProps> = ({
  onGoHome,
  onStartDaily,
  onStartSprint,
  onStartChallenge,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in px-2">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          回首页
        </button>
        <h2 className="text-xl font-bold text-slate-800">选择测验模式</h2>
        <div className="w-16"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 日常模式 */}
        <button
          onClick={onStartDaily}
          className="group bg-white border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 text-xl group-hover:scale-110 transition-transform">
            📝
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">日常模式</h3>
          <p className="text-xs text-slate-500">
            20 题四选一，固定节奏，适合每日打卡。
          </p>
        </button>

        {/* 冲刺模式 */}
        <button
          onClick={onStartSprint}
          className="group bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-rose-200 hover:border-rose-400 rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-200 text-rose-700 flex items-center justify-center mb-3 text-xl group-hover:scale-110 transition-transform">
            ⚡
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">冲刺模式</h3>
          <p className="text-xs text-slate-500">
            限时 60 秒快速作答，适合突击特训。
          </p>
        </button>

        {/* 挑战模式 */}
        <button
          onClick={onStartChallenge}
          className="group bg-gradient-to-br from-violet-50 to-fuchsia-50 border-2 border-violet-200 hover:border-violet-400 rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-200 text-violet-700 flex items-center justify-center mb-3 text-xl group-hover:scale-110 transition-transform">
            🎯
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">挑战好友</h3>
          <p className="text-xs text-slate-500">
            发起挑战码，邀请好友 PK 同题。
          </p>
        </button>
      </div>

      <div className="mt-6 text-xs text-slate-400 text-center">
        三种模式都会计入打卡统计，连续学习解锁更多勋章。
      </div>
    </div>
  );
};
