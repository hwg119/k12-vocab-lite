import React from 'react';
import { Word } from '../types';
import { groupConfusionPairs } from '../utils';
import { IconArrowLeft } from './Icons';

interface ConfusionViewProps {
  words: Word[];
  onGoHome: () => void;
  /** 进入学习模式（只学该配对里的词） */
  onStartPair: (queue: Word[]) => void;
}

/**
 * 易混词配对视图
 *
 * 形近/义近自动配对，对比记忆。点击卡片可把该组的词塞进学习队列。
 */
export const ConfusionView: React.FC<ConfusionViewProps> = ({
  words,
  onGoHome,
  onStartPair,
}) => {
  const groups = groupConfusionPairs(words);

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in px-2">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          回首页
        </button>
        <h2 className="text-xl font-bold text-slate-800">易混词对比</h2>
        <div className="w-16"></div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <div className="text-4xl mb-3">🧩</div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">该学段暂无易混词配对</h3>
          <p className="text-slate-500 text-sm">
            形近/义近的单词会在数据里通过 <code className="bg-slate-100 px-1 rounded">confusionGroupId</code> 自动配对。
            词库种子数据已带部分配对，完整词库补齐后即可显示。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                  配对 #{i + 1}
                </span>
                <button
                  onClick={() => onStartPair(g.members)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  进入学习 →
                </button>
              </div>
              <div className="space-y-2">
                {g.members.map(w => (
                  <div key={w.id} className="flex items-baseline gap-3 p-2 rounded-lg hover:bg-slate-50">
                    <span className="font-bold text-slate-800 text-lg min-w-[80px]">{w.english}</span>
                    <span className="text-sm text-indigo-500 font-mono">{w.phonetic}</span>
                    <span className="text-sm text-slate-600 flex-1">{w.chinese}</span>
                  </div>
                ))}
              </div>
              {g.members.some(w => w.mnemonic) && (
                <p className="mt-3 text-xs text-slate-500 italic">
                  💡 不同形近/义近词的细微差异，注意音标与词义。
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-xs text-slate-400 text-center">
        形近词容易混淆，一起对比记忆更牢。
      </div>
    </div>
  );
};
