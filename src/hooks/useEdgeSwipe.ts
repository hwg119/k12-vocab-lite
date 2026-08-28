import { useEffect, useRef } from 'react';

/**
 * 移动端「边缘滑动返回」手势
 *
 * 触发条件：
 *   - 触摸起始位置在屏幕边缘（左/右各 24px）
 *   - 水平位移 ≥ 60px
 *   - 垂直位移不超过 60px（避免误判上下滚动）
 *   - 总时长 ≤ 600ms
 *
 * 触发后调用 onBack()。
 *
 * 只在触屏设备启用（pointer: coarse 检测）。
 */
export function useEdgeSwipe(onBack: () => void, edgeWidth = 24, minDistance = 60, maxTime = 600) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    // 仅触屏设备
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch) return;

    let startX = 0;
    let startY = 0;
    let fromEdge: 'left' | 'right' | null = null;
    let tracking = false;

    const isInFormTarget = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (el.isContentEditable) return true;
      // 滚动容器内不触发，避免与子滚动冲突
      if (el.closest('[data-no-edge-swipe]')) return true;
      return false;
    };

    const handleStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        tracking = false;
        return;
      }
      if (isInFormTarget(e.target)) {
        tracking = false;
        return;
      }
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      fromEdge = null;
      tracking = false;

      const w = window.innerWidth;
      if (startX <= edgeWidth) fromEdge = 'left';
      else if (startX >= w - edgeWidth) fromEdge = 'right';
      if (fromEdge) tracking = true;
    };

    const handleMove = (e: TouchEvent) => {
      if (!tracking || !fromEdge || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // 超过垂直阈值 → 放弃（用户在上下滚动）
      if (Math.abs(dy) > 60) {
        tracking = false;
        return;
      }
      // 达到返回阈值 → 触发
      const expectedDx = fromEdge === 'left' ? dx : -dx;
      if (expectedDx >= minDistance) {
        // 不阻止默认行为：让手势自然结束即可
        tracking = false;
        onBackRef.current();
      }
    };

    const handleEnd = () => {
      tracking = false;
    };

    document.addEventListener('touchstart', handleStart, { passive: true });
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('touchend', handleEnd, { passive: true });
    document.addEventListener('touchcancel', handleEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleStart);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };
  }, [edgeWidth, minDistance, maxTime]);
}