import React, { useCallback, useRef, useState } from 'react';
import { wordAudioUrl } from '../config/cdn';

interface WordAudioProps {
  word: string;
  className?: string;
}

/**
 * 单词发音按钮
 *
 * 播放：本地/CDN opus `{CDN_BASE}/audio/{word}.opus`（100% 词覆盖）
 * 已移除第三方有道 dictvoice 回退：CDN 已补齐全部 3740 词发音，运行时不再依赖任何第三方接口。
 */
export const WordAudio: React.FC<WordAudioProps> = ({ word, className = '' }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const play = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setError(false);

    const url = wordAudioUrl(word);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.addEventListener('loadeddata', () => { setLoading(false); setError(false); });
    audio.addEventListener('canplay', () => { setLoading(false); setError(false); });
    audio.addEventListener('error', () => { setLoading(false); setError(true); });

    audio.play().catch(() => { setLoading(false); setError(true); });
  }, [word, loading]);

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); play(); }}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-200 active:scale-90 ${loading ? 'animate-pulse' : ''} ${error ? 'text-red-300' : ''} ${className}`}
        title={error ? '发音加载失败，点击重试' : `播放 "${word}" 发音`}
        aria-label={`播放 ${word} 发音`}
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        )}
      </button>
    </>
  );
};