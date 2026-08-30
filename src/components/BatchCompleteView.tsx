import React from 'react';
import { IconCheck, IconBook, IconHome } from './Icons';

interface BatchCompleteViewProps {
  /** 本批复习（巩固）词数 */
  reviewed: number;
  /** 本批新学词数 */
  newWords: number;
  /** 再来一批 */
  onMore: () => void;
  /** 回首页 */
  onGoHome: () => void;
}

/**
 * 学习批次完成页（方案 b）
 *
 * 学生刷完一批（默认 15 张）后落点：
 *   - 展示本批成果：巩固 N · 新学 M
 *   - 两个动作：「再来一批」继续 / 「回首页」收工
 */
export const BatchCompleteView: React.FC<BatchCompleteViewProps> = ({
  reviewed,
  newWords,
  onMore,
  onGoHome,
}) => {
  const total = reviewed + newWords;
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in self-stretch min-h-[70vh] flex flex-col items-center justify-center px-6">
      {/* 完成徽章 */}
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
        <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-300">
          <IconCheck className="w-8 h-8 text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">本批完成！</h2>
      <p className="text-slate-500 text-center text-sm mb-8">又往前走了一步</p>

      {/* 成果统计 */}
      <div className="w-full grid grid-cols-2 gap-3 mb-8">
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
          <IconBook className="w-6 h-6 text-amber-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-700">{reviewed}</p>
          <p className="text-xs text-amber-600 mt-0.5">巩固复习</p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 text-center">
          <IconCheck className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-indigo-700">{newWords}</p>
          <p className="text-xs text-indigo-600 mt-0.5">新学单词</p>
        </div>
      </div>

      {total > 0 && (
        <p className="text-sm text-slate-400 text-center mb-8">
          本批共 {total} 词，答错的已自动加入错词本
        </p>
      )}

      {/* 动作按钮 */}
      <button
        onClick={onMore}
        className="w-full py-3.5 px-6 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-200 flex items-center justify-center gap-2 mb-3"
      >
        <IconBook className="w-5 h-5" />
        再来一批
      </button>
      <button
        onClick={onGoHome}
        className="w-full py-3.5 px-6 rounded-xl font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <IconHome className="w-5 h-5" />
        回首页
      </button>
    </div>
  );
};