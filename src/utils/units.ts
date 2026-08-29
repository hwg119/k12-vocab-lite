import { Word, StudyUnit, Stage } from '../types';
import { STAGE_META } from '../data';
import { wordKey } from './wordKey';

/**
 * 闯关单元（关卡）核心算法
 *
 * 规则：
 *   - 按 difficulty 升序，再按 id 字典序排列（确定性输出）
 *   - 按 unitSize 切分（每个 stage 在 STAGE_META 中定义）
 *   - 默认解锁前 DEFAULT_UNLOCK_COUNT 关（含第 0 关），让用户先把样本词过一遍
 *   - 后续关卡必须"前一关 100% 完成"才解锁（必须掌握前一关全部单词）
 */

export interface UnitsPlan {
  units: StudyUnit[];
  /** 学段当前应主推的 unit index（首个未通关单元） */
  currentIndex: number;
  /** 已完成单元数 */
  completedCount: number;
  /** 最大学段总单元数 */
  totalUnits: number;
}

const UNLOCK_THRESHOLD = 1.0;
/** 默认解锁的前 N 关（0-based index 0..N-1 都视为常开） */
const DEFAULT_UNLOCK_COUNT = 4;

export function planUnitsForStage(
  stage: Stage,
  words: Word[],
  learnedIds: Set<string>,
): UnitsPlan {
  const unitSize = STAGE_META[stage].unitSize;
  const sorted = [...words].sort((a, b) => {
    const da = a.difficulty ?? 3;
    const db = b.difficulty ?? 3;
    if (da !== db) return da - db;
    return a.id.localeCompare(b.id);
  });

  const chunks: Word[][] = [];
  for (let i = 0; i < sorted.length; i += unitSize) {
    chunks.push(sorted.slice(i, i + unitSize));
  }

  const units: StudyUnit[] = chunks.map((chunk, index) => {
    const wordIds = chunk.map(w => w.id);
    const wordByKey = new Map(chunks.flat().map(w => [w.id, w]));
    // learnedIds 同时使用 wordId 和 wordKey；两种都查
    const learnedInChunk = wordIds.filter(id => {
      if (learnedIds.has(id)) return true;
      const w = wordByKey.get(id);
      return w ? learnedIds.has(wordKey(w)) : false;
    }).length;
    const completed = learnedInChunk === wordIds.length && wordIds.length > 0;
    return {
      index,
      title: `Unit ${String(index + 1).padStart(2, '0')}`,
      wordIds,
      unlocked: false, // 第二轮统一计算
      completed,
    };
  });

  // 计算解锁：前 DEFAULT_UNLOCK_COUNT 关默认解锁；后续关卡必须前一关 100% 完成才解锁
  // prevUnitComplete 表示"序号小于当前 u 的最后一关是否达到解锁阈值"，用于链式判断
  const wordById = new Map<string, Word>();
  for (const w of words) wordById.set(w.id, w);
  let prevUnitComplete = true; // 序号 < DEFAULT_UNLOCK_COUNT 的关默认视为前置已通关
  for (const u of units) {
    if (u.index < DEFAULT_UNLOCK_COUNT) {
      // 前 N 关默认常开
      u.unlocked = true;
    } else {
      u.unlocked = prevUnitComplete;
    }
    // 更新 prevUnitComplete：当前关是否完成（或已完成的比例）
    prevUnitComplete =
      u.completed ||
      learnedRatio(u.wordIds, learnedIds, wordById) >= UNLOCK_THRESHOLD;
  }

  const currentIndex = units.findIndex(u => !u.completed);
  const completedCount = units.filter(u => u.completed).length;

  return {
    units,
    currentIndex: currentIndex === -1 ? units.length - 1 : currentIndex,
    completedCount,
    totalUnits: units.length,
  };
}

function learnedRatio(ids: string[], learned: Set<string>, wordById: Map<string, Word>): number {
  if (ids.length === 0) return 1;
  let n = 0;
  for (const id of ids) {
    if (learned.has(id)) {
      n += 1;
      continue;
    }
    const w = wordById.get(id);
    if (w && learned.has(wordKey(w))) n += 1;
  }
  return n / ids.length;
}

/** 计算单元的进度（0~1） */
export function unitProgress(unit: StudyUnit, learnedIds: Set<string>): number {
  if (unit.wordIds.length === 0) return 1;
  let n = 0;
  for (const id of unit.wordIds) if (learnedIds.has(id)) n += 1;
  return n / unit.wordIds.length;
}
