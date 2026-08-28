import { Stage } from '../types';

/**
 * Tailwind JIT 颜色映射
 *
 * Tailwind 的 JIT 模式无法识别动态拼接的类名，如：
 *   `bg-${colorClass}-500` → 无法正确生成 CSS
 *
 * 必须使用完整类名映射。
 */

export interface StageColors {
  gradient: string;
  gradientLight: string;
  text: string;
  textMuted: string;
  badge: string;
  bar: string;
  border: string;
  shadow: string;
  ring: string;
  icon: string;
}

export const STAGE_COLORS: Record<Stage, StageColors> = {
  primary: {
    gradient: 'from-amber-500 to-amber-600',
    gradientLight: 'from-amber-50 to-amber-100',
    text: 'text-amber-100',
    textMuted: 'text-amber-600',
    badge: 'bg-amber-600',
    bar: 'bg-amber-500',
    border: 'border-amber-200',
    shadow: 'shadow-amber-100',
    ring: '245 158 11',
    icon: 'text-amber-600',
  },
  junior: {
    gradient: 'from-emerald-500 to-emerald-600',
    gradientLight: 'from-emerald-50 to-emerald-100',
    text: 'text-emerald-100',
    textMuted: 'text-emerald-600',
    badge: 'bg-emerald-600',
    bar: 'bg-emerald-500',
    border: 'border-emerald-200',
    shadow: 'shadow-emerald-100',
    ring: '16 185 129',
    icon: 'text-emerald-600',
  },
  senior: {
    gradient: 'from-indigo-500 to-indigo-600',
    gradientLight: 'from-indigo-50 to-indigo-100',
    text: 'text-indigo-100',
    textMuted: 'text-indigo-600',
    badge: 'bg-indigo-600',
    bar: 'bg-indigo-500',
    border: 'border-indigo-200',
    shadow: 'shadow-indigo-100',
    ring: '99 102 241',
    icon: 'text-indigo-600',
  },
};

export function getStageColors(stage: Stage): StageColors {
  return STAGE_COLORS[stage] || STAGE_COLORS.senior;
}
