import React, { useEffect, useState } from 'react';

/**
 * 移动端边缘滑动返回的视觉提示
 *
 * 仅在触屏 + 非首页 + 有历史栈时显示：
 *   - 左侧边缘：左滑返回时浮出淡蓝色箭头
 *   - 右侧边缘：右滑返回时浮出淡蓝色箭头
 *
 * 触发条件（与 useEdgeSwipe 同步）：
 *   - 触摸起始位置在屏幕边缘 24px 内
 *   - 触摸中累计位移 ≥ 30px（早期反馈）
 */
interface EdgeSwipeIndicatorProps {
  edgeWidth?: number;
  enabled?: boolean;
}

export const EdgeSwipeIndicator: React.FC<EdgeSwipeIndicatorProps> = ({ edgeWidth = 24, enabled = true }) => {
  const [side, setSide] = useState<'left' | 'right' | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch) return;

    let startX = 0;
    let startY = 0;
    let fromEdge: 'left' | 'right' | null = null;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      const w = window.innerWidth;
      fromEdge = null;
      if (startX <= edgeWidth) fromEdge = 'left';
      else if (startX >= w - edgeWidth) fromEdge = 'right';
      if (fromEdge) {
        setSide(fromEdge);
        setVisible(true);
      }
    };
    const onMove = (e: TouchEvent) => {
      if (!fromEdge || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dy = t.clientY - startY;
      // 垂直偏移超过阈值 → 隐藏
      if (Math.abs(dy) > 60) {
        setVisible(false);
      }
    };
    const onEnd = () => {
      setVisible(false);
      fromEdge = null;
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    document.addEventListener('touchcancel', onEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
    };
  }, [edgeWidth, enabled]);

  if (!visible || !side) return null;

  return (
    <div
      aria-hidden
      className="fixed top-0 bottom-0 w-12 pointer-events-none z-[60] md:hidden transition-opacity duration-150"
      style={{
        left: side === 'left' ? 0 : 'auto',
        right: side === 'right' ? 0 : 'auto',
      }}
    >
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${side === 'left' ? 'left-1' : 'right-1'} w-8 h-16 rounded-full bg-indigo-500/30 backdrop-blur-sm flex items-center justify-center animate-pulse`}
      >
        <svg
          className={`w-5 h-5 text-indigo-700 ${side === 'left' ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
};