import React, { useState } from 'react';
import { IconArrowLeft } from './Icons';

interface ChallengeInputProps {
  onGoHome: () => void;
  onSubmit: (code: string) => void;
  onStartChallenge: () => void;
}

/**
 * 输入挑战码页面
 *
 * 用户粘贴好友发来的挑战码后，开始作答同一套题目。
 * 双方使用相同 seed 出题，结果实时对比。
 */
export const ChallengeInput: React.FC<ChallengeInputProps> = ({ onGoHome, onSubmit, onStartChallenge }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('请输入挑战码');
      return;
    }
    if (trimmed.length !== 10) {
      setError('挑战码应为 10 个字符');
      return;
    }
    // 简单格式校验：字母+数字（去掉了易混淆字符）
    if (!/^[2-9ABCDEFGHJKMNPQRSTVWXYZ]{10}$/.test(trimmed)) {
      setError('挑战码包含无效字符');
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in px-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          回首页
        </button>
        <h2 className="text-xl font-bold text-slate-800">输入挑战码</h2>
        <div className="w-16" />
      </div>

      <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border-2 border-violet-200 rounded-2xl p-6 mb-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-200 text-violet-700 flex items-center justify-center mb-3 text-3xl">
          🎯
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1 text-center">挑战好友</h3>
        <p className="text-sm text-slate-600 text-center mb-4">
          粘贴好友发给你的 10 位挑战码，开始同一套题目，挑战看谁得分高！
        </p>

        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          placeholder="粘贴挑战码…"
          className="w-full px-4 py-3 rounded-xl border-2 border-violet-200 focus:border-violet-400 focus:outline-none text-center font-mono text-lg font-bold text-violet-700 tracking-wider uppercase bg-white"
          maxLength={12}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
        />

        {error && (
          <p className="text-xs text-rose-500 mt-2 text-center font-medium">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!code.trim()}
          className="w-full mt-4 py-3 rounded-xl font-bold bg-violet-600 text-white hover:bg-violet-700 shadow-md transition-all active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          开始挑战 →
        </button>
      </div>

      <details className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
        <summary className="cursor-pointer font-medium text-slate-700">💡 挑战码是什么？</summary>
        <div className="mt-2 space-y-1 text-slate-600">
          <p>· 好友完成一轮测验后可生成挑战码</p>
          <p>· 挑战码经加密编码，包含种子和成绩</p>
          <p>· 你和好友会做同一套题目，结果直接对比</p>
          <p>· 所有计算都在本地完成，无需联网</p>
        </div>
      </details>

      <button
        onClick={onStartChallenge}
        className="w-full mt-3 py-2.5 rounded-xl font-medium bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-sm transition-colors"
      >
        🎯 发起新挑战（生成挑战码）
      </button>
    </div>
  );
};