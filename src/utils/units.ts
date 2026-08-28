import { Word, StudyUnit, Stage } from '../types';
import { STAGE_META } from '../data';

/**
 * 闯关单元（关卡）核心算法
 *
 * 规则：
 *   - 按 difficulty 升序，再按 id 字典序排列（确定性输出）
 *   - 按 unitSize 切分（每个 stage 在 STAGE_META 中定义）
 *   - 第 0 关始终解锁；从第 1 关起必须"前一关 100% 完成"才解锁
 *     （严格阈值：必须掌握前一关全部单词才能进入下一关，避免"默认前几关都解锁"）
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
    const learnedInChunk = wordIds.filter(id => learnedIds.has(id)).length;
    const completed = learnedInChunk === wordIds.length && wordIds.length > 0;
    return {
      index,
      title: `Unit ${String(index + 1).padStart(2, '0')}`,
      wordIds,
      unlocked: false, // 第二轮统一计算
      completed,
    };
  });

  // 计算解锁：第一关默认解锁；后续关卡必须前一关 100% 完成才解锁
  let prevComplete = true; // 首关起始默认解锁
  for (const u of units) {
    if (u.index === 0) {
      u.unlocked = true;
    } else {
      u.unlocked = prevComplete;
    }
    prevComplete =
      u.completed ||
      (prevComplete && learnedRatio(u.wordIds, learnedIds) >= UNLOCK_THRESHOLD);
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

function learnedRatio(ids: string[], learned: Set<string>): number {
  if (ids.length === 0) return 1;
  let n = 0;
  for (const id of ids) if (learned.has(id)) n += 1;
  return n / ids.length;
}

/** 计算单元的进度（0~1） */
export function unitProgress(unit: StudyUnit, learnedIds: Set<string>): number {
  if (unit.wordIds.length === 0) return 1;
  let n = 0;
  for (const id of unit.wordIds) if (learnedIds.has(id)) n += 1;
  return n / unit.wordIds.length;
}
