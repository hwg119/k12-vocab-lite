import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IconVolume } from './Icons';
import sentenceAudioMap from '../data/sentenceAudioMap.json';
import { sentenceAudioUrl } from '../config/cdn';

interface SentenceAudioProps {
  word: string;
  /** 兜底例句（如果本地缓存/在线 API 都没拿到） */
  fallbackSentence?: string;
  className?: string;
}

interface SentenceMeta {
  file: string;
  text: string;
  textCn: string;
  audioId?: number;
  sentenceId?: number;
}

const normalizeKey = (w: string) => w.toLowerCase().trim();
const safeName = (w: string) => normalizeKey(w).replace(/[^a-z0-9]/g, '_').slice(0, 50);

const metaMap = sentenceAudioMap as Record<string, SentenceMeta>;

/**
 * 例句发音组件（v5 - 本地优先）
 *
 * 优先级：
 *   1. 本地预下载的 mp3 (public/audio/sentences/{word}.mp3 + 文本元数据)
 *   2. 在线 Tatoeba（首次访问某词时异步拉取 + 缓存，不播音频）
 *
 * 设计：按钮始终可见；点击即播放本地 mp3。
 */
export const SentenceAudio: React.FC<SentenceAudioProps> = ({
  word,
  fallbackSentence,
  className = '',
}) => {
  const key = normalizeKey(word);
  const meta = metaMap[key] || metaMap[safeName(key)];

  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioPath = meta?.file ? sentenceAudioUrl(meta.file) : null;
  const displayText = meta?.text || fallbackSentence || '';
  const displayTextCn = meta?.textCn || '';

  const play = useCallback(() => {
    if (!audioPath) {
      setError(true);
      return;
    }
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }
    const audio = new Audio(audioPath);
    audioRef.current = audio;
    audio.onended = () => setPlaying(false);
    audio.onerror = () => { setError(true); setPlaying(false); };
    audio.play().then(() => setPlaying(true)).catch(() => { setError(true); setPlaying(false); });
  }, [audioPath, playing]);

  // 卸载时停止
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!meta && !fallbackSentence) return null;

  return (
    <div className={`sentence-audio ${className}`}>
      <div className="flex items-start gap-2">
        {/* 播放按钮（始终可见，无音频时禁用） */}
        <button
          onClick={e => { e.stopPropagation(); play(); }}
          disabled={!audioPath}
          title={
            !audioPath ? '该词暂无例句音频（未预下载）' :
            playing ? '停止' :
            error ? '播放失败' :
            '播放例句发音'
          }
          className={`shrink-0 mt-0.5 p-1 rounded-lg transition-all duration-200 ${
            playing
              ? 'bg-indigo-100 text-indigo-600'
              : !audioPath
              ? 'text-slate-300 cursor-not-allowed'
              : error
              ? 'text-red-400 hover:text-red-500'
              : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50'
          }`}
        >
          <IconVolume className="w-4 h-4" />
        </button>

        {/* 句子文本 */}
        <div className="text-xs leading-relaxed min-w-0 flex-1">
          {displayText && (
            <p className="text-slate-600 break-words">
              "{displayText}"
            </p>
          )}
          {displayTextCn && (
            <p className="text-slate-400 mt-0.5 break-words">
              {displayTextCn}
            </p>
          )}
          {!audioPath && (
            <p className="text-[10px] text-slate-300 mt-0.5 italic">
              未下载该词例句音频
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
