import React, { useCallback, useRef, useState } from 'react';
import { wordAudioUrl } from '../config/cdn';

interface WordAudioProps {
  word: string;
  className?: string;
}

/**
 * 单词发音按钮
 *
 * 播放优先级：
 *   1. 本地/CDN opus：`{CDN_BASE}/audio/{word}.opus`（97.2% 词覆盖，无网络可用）
 *   2. 有道 dictvoice API 回退（国内可访问，无需 API Key）
 *      美音：https://dict.youdao.com/dictvoice?audio={word}&type=2
 *      英音：https://dict.youdao.com/dictvoice?audio={word}&type=1
 */
export const WordAudio: React.FC<WordAudioProps> = ({ word, className = '' }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const playWithFallback = useCallback(async (urls: string[], idx: number): Promise<void> => {
    if (idx >= urls.length) {
      setLoading(false);
      setError(true);
      audioRef.current = null;
      return;
    }
    const url = urls[idx];
    const audio = new Audio(url);
    audioRef.current = audio;

    const onSucceed = () => {
      setLoading(false);
      setError(false);
    };
    const onFail = () => {
      audio.removeEventListener('loadeddata', onSucceed);
      audio.removeEventListener('error', onFail);
      audio.removeEventListener('canplay', onSucceed);
      // 尝试下一个 fallback
      void playWithFallback(urls, idx + 1);
    };

    audio.addEventListener('loadeddata', onSucceed);
    audio.addEventListener('canplay', onSucceed);
    audio.addEventListener('error', onFail);

    try {
      await audio.play();
    } catch {
      onFail();
    }
  }, []);

  const play = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setError(false);

    const enc = encodeURIComponent(word);
    const urls = [
      // 1. 本地/CDN opus（路径由 cdn 配置决定是否走远端）
      wordAudioUrl(word),
      // 2. 兜底：有道美音（绝对 URL，不受 CDN_BASE 影响）
      `https://dict.youdao.com/dictvoice?audio=${enc}&type=2`,
      // 3. 兜底：有道英音
      `https://dict.youdao.com/dictvoice?audio=${enc}&type=1`,
    ];

    void playWithFallback(urls, 0);
  }, [word, loading, playWithFallback]);

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