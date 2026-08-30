import React, { useEffect, useState, useCallback } from 'react';
import { getWordImage } from '../../utils/wordImage';

interface WordImageProps {
  english: string;
  /** 外层容器 class（控制尺寸），无图时整块不渲染 */
  className?: string;
  imgClassName?: string;
  alt?: string;
  /** 是否允许点击放大（默认 true；词典列表缩略图可显式关闭） */
  zoomable?: boolean;
}

/**
 * 单词配图展示组件（离线插画包）
 *
 * - 无配图（getWordImage 返回 undefined）→ 渲染 null，不占空间
 * - 加载失败（坏图）→ 隐藏
 * - english 变化时重置失败态
 * - 点击缩略图（默认开启）→ 全屏放大查看；再点遮罩关闭
 *   注意：缩略图点击会 stopPropagation，避免冒泡到卡片翻面等父级 onClick
 * - 任意时刻只有一个全屏层（基于 useState，切换单词时复位）
 */
export const WordImage: React.FC<WordImageProps> = ({
  english,
  className = '',
  imgClassName = '',
  alt = '',
  zoomable = true,
}) => {
  const [failed, setFailed] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const src = getWordImage(english);

  useEffect(() => {
    setFailed(false);
    setZoomed(false);
  }, [english]);

  const open = useCallback(
    (e?: React.SyntheticEvent) => {
      e?.stopPropagation();
      setZoomed(true);
    },
    [],
  );
  const close = useCallback((e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setZoomed(false);
  }, []);

  // 全局 ESC 关闭：每个实例都注册一个 keydown，但只在 zoomed=true 时才订阅
  // 用 ref 跟踪 zoomed 状态，避免 effect 依赖 zoomed 反复重挂
  const zoomedRef = React.useRef(zoomed);
  useEffect(() => {
    zoomedRef.current = zoomed;
  }, [zoomed]);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomed]);

  if (!src || failed) return null;

  return (
    <>
      <div
        className={`overflow-hidden ${zoomable ? 'cursor-zoom-in' : ''} ${className}`}
        style={{ flexShrink: 0 }}
        onClick={zoomable ? open : undefined}
        role={zoomable ? 'button' : undefined}
        tabIndex={zoomable ? 0 : undefined}
        onKeyDown={
          zoomable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  open();
                }
              }
            : undefined
        }
      >
        <img
          src={src}
          alt={alt || english}
          loading="lazy"
          draggable={false}
          onError={() => setFailed(true)}
          onLoad={() => setFailed(false)}
          className={`w-full h-full object-cover select-none ${imgClassName}`}
          style={{ display: 'block', pointerEvents: 'none' }}
        />
      </div>

      {zoomable && zoomed && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <img
            src={src}
            alt={alt || english}
            draggable={false}
            className="max-w-full max-h-full object-contain select-none rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={close}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-lg transition-colors z-[10000]"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l8 8M6 14L14 6" />
            </svg>
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-xs pointer-events-none">
            点击空白处或按 ESC 关闭
          </p>
        </div>
      )}
    </>
  );
};