/**
 * 词库统一入口（barrel）
 *
 * 用法：
 *   import { WORDS_BY_STAGE, ALL_WORDS, STAGE_META } from './data';
 *   - WORDS_BY_STAGE.primary / junior / senior → 该学段 Word[]
 *   - ALL_WORDS → 全部单词（id 去重）
 *   - STAGE_META → 学段基础元数据（标题、副标题、单元大小）
 *
 * 新增学段只需：
 *   1. 创建 src/data/<stage>.ts 导出 <STAGE>_WORDS: Word[]
 *   2. 下方补一行映射即可，无需改其他文件
 */

import { Stage, Word } from './types';
import { PRIMARY_WORDS } from './data/primary';
import { JUNIOR_WORDS } from './data/junior';
import { SENIOR_WORDS, RAW_DATA } from './data/senior';

export { RAW_DATA, PRIMARY_WORDS, JUNIOR_WORDS, SENIOR_WORDS };

/** 学段元数据 - 用于 UI 展示与单元划分 */
export interface StageMeta {
  id: Stage;
  title: string;
  subtitle: string;
  /** 闯关单元大小（每单元词数） */
  unitSize: number;
  /** UI 主题色（Tailwind 色彩前缀） */
  color: string;
}

export const STAGE_META: Record<Stage, StageMeta> = {
  primary: {
    id: 'primary',
    title: '小学',
    subtitle: '3-6 年级核心词汇',
    unitSize: 25,
    color: 'amber',
  },
  junior: {
    id: 'junior',
    title: '初中',
    subtitle: '中考考纲词汇',
    unitSize: 50,
    color: 'emerald',
  },
  senior: {
    id: 'senior',
    title: '高中',
    subtitle: '高考核心词汇',
    unitSize: 50,
    color: 'indigo',
  },
};

/** 学段 → 该学段词库数组 */
export const WORDS_BY_STAGE: Record<Stage, Word[]> = {
  primary: PRIMARY_WORDS,
  junior: JUNIOR_WORDS,
  senior: SENIOR_WORDS,
};

/** 学段顺序常量（用于下拉/排序） */
export const STAGE_ORDER: Stage[] = ['primary', 'junior', 'senior'];

/** 全学段合并词库（id 去重，高优学段优先） */
const _seen = new Set<string>();
const _all: Word[] = [];
for (const stage of STAGE_ORDER) {
  for (const w of WORDS_BY_STAGE[stage]) {
    if (!_seen.has(w.id)) {
      _seen.add(w.id);
      _all.push(w);
    }
  }
}
export const ALL_WORDS: Word[] = _all;

/** 给定学段的有效词库（兜底 senior） */
export function getStageWords(stage: Stage | undefined | null): Word[] {
  return WORDS_BY_STAGE[stage ?? 'senior'] ?? SENIOR_WORDS;
}
