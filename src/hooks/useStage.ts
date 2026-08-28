import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  Stage,
  StorageKeys,
  SrsState,
  ReviewFeedback,
  Word,
  StudyDayRecord,
  StudyUnit,
  Achievement,
} from '../types';
import { WORDS_BY_STAGE } from '../data';
import {
  createInitialSrs,
  applyReview,
  selectDueWords,
  planUnitsForStage,
  evaluateAchievements,
  computeStreak,
  recordActivity,
  totalCorrect as sumCorrect,
  totalAnswered as sumAnswered,
} from '../utils';

/**
 * 学段切换 + 数据隔离 + 闯关/勋章/打卡
 *
 * 暴露（按重要性）：
 *   - stage / setStage：当前学段
 *   - words / learnedIds / mistakeIds：原始数据
 *   - srsMap / submitFeedback：SRS 反馈
 *   - units：当前学段的关卡列表
 *   - achievements：当前已解锁勋章
 *   - streak：连续打卡
 *   - summary：Dashboard 周报所需的整体摘要
 */

const LEGACY_KEY = 'gaokao-learned';

function migrateLegacyIfNeeded(): void {
  if (typeof window === 'undefined') return;
  try {
    const flagKey = '__k12_vocab_migrated_v1__';
    if (window.localStorage.getItem(flagKey)) return;

    const old = window.localStorage.getItem(LEGACY_KEY);
    if (old) {
      const seniorKey = StorageKeys.learnedIds('senior');
      const arr = JSON.parse(old);
      if (Array.isArray(arr) && arr.length > 0 && !window.localStorage.getItem(seniorKey)) {
        window.localStorage.setItem(seniorKey, old);
      }
    }
    window.localStorage.setItem(flagKey, '1');
  } catch {
    // 静默
  }
}

export interface UseStageReturn {
  stage: Stage;
  setStage: (s: Stage) => void;
  words: Word[];
  learnedIds: Set<string>;
  mistakeIds: string[];
  srsMap: Record<string, SrsState>;
  units: StudyUnit[];
  achievements: Achievement[];
  streak: { longest: number; current: number };
  studyDays: StudyDayRecord[];
  summary: {
    learnedCount: number;
    totalInStage: number;
    dueCount: number;
    mistakeCount: number;
    totalCorrect: number;
    totalAnswered: number;
    accuracy: number;
    unitsCompleted: number;
    unitsTotal: number;
    currentStreak: number;
    longestStreak: number;
  };

  markLearned: (id: string) => void;
  unmarkLearned: (id: string) => void;
  submitFeedback: (id: string, feedback: ReviewFeedback) => void;
  recordQuizAnswer: (isCorrect: boolean) => void;
  resetProgress: () => void;
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
}

export function useStage(): UseStageReturn {
  migrateLegacyIfNeeded();

  const [stage, setStageRaw] = useLocalStorage<Stage>(StorageKeys.currentStage, 'senior');
  const [learnedIds, setLearnedIds] = useLocalStorage<Set<string>>(
    StorageKeys.learnedIds(stage),
    new Set(),
  );
  const [srsMap, setSrsMap] = useLocalStorage<Record<string, SrsState>>(
    StorageKeys.srs(stage),
    {},
  );
  const [mistakeIds, setMistakeIds] = useLocalStorage<string[]>(
    StorageKeys.mistakes(stage),
    [],
  );
  const [studyDays, setStudyDays] = useLocalStorage<StudyDayRecord[]>(
    StorageKeys.studyDays,
    [],
  );
  const [focusMode, setFocusModeRaw] = useLocalStorage<boolean>(
    'vocab-focus-mode',
    false,
  );

  const words = useMemo<Word[]>(() => WORDS_BY_STAGE[stage], [stage]);

  // 关卡计算（每个 stage 重新切分）
  const units = useMemo<StudyUnit[]>(
    () => planUnitsForStage(stage, words, learnedIds).units,
    [stage, words, learnedIds],
  );

  const streak = useMemo(() => computeStreak(studyDays), [studyDays]);

  // 汇总数据
  const summary = useMemo(() => {
    const learnedCount = learnedIds.size;
    const totalAnswered = sumAnswered(studyDays);
    const totalCorrect = sumCorrect(studyDays);
    const accuracy = totalAnswered === 0 ? 0 : totalCorrect / totalAnswered;
    const dueCount = selectDueWords(words, srsMap, words.length).length;
    return {
      learnedCount,
      totalInStage: words.length,
      dueCount,
      mistakeCount: mistakeIds.length,
      totalAnswered,
      totalCorrect,
      accuracy,
      unitsCompleted: units.filter(u => u.completed).length,
      unitsTotal: units.length,
      currentStreak: streak.current,
      longestStreak: streak.longest,
    };
  }, [learnedIds, words, srsMap, mistakeIds, studyDays, units, streak]);

  // 成就列表（动态评估）
  const achievements = useMemo<Achievement[]>(
    () =>
      evaluateAchievements({
        learnedCount: learnedIds.size,
        totalInStage: words.length,
        studyDays,
        longestStreak: streak.longest,
        overallAccuracy: summary.accuracy,
      }),
    [learnedIds, words, studyDays, streak, summary.accuracy],
  );

  const setStage = useCallback((s: Stage) => setStageRaw(s), [setStageRaw]);

  const markLearned = useCallback(
    (id: string) => {
      setLearnedIds(prev => {
        const s = new Set(prev);
        s.add(id);
        return s;
      });
      setSrsMap(prev => (prev[id] ? prev : { ...prev, [id]: createInitialSrs() }));
      setMistakeIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : prev));
    },
    [setLearnedIds, setSrsMap, setMistakeIds],
  );

  const unmarkLearned = useCallback(
    (id: string) => {
      setLearnedIds(prev => {
        if (!prev.has(id)) return prev;
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
      setSrsMap(prev => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [setLearnedIds, setSrsMap],
  );

  const submitFeedback = useCallback(
    (id: string, feedback: ReviewFeedback) => {
      // 1. 更新 SRS 状态
      setSrsMap(prev => {
        const cur = prev[id] ?? createInitialSrs();
        return { ...prev, [id]: applyReview(cur, feedback) };
      });
      // 2. 联动易错本与掌握集合
      if (feedback === 'know') {
        setLearnedIds(prev => {
          if (prev.has(id)) return prev;
          const s = new Set(prev);
          s.add(id);
          return s;
        });
        setMistakeIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : prev));
      } else {
        setMistakeIds(prev => (prev.includes(id) ? prev : [...prev, id]));
      }
      // 3. 计入今日打卡
      setStudyDays(prev => recordActivity(prev, feedback, feedback === 'know'));
    },
    [setLearnedIds, setSrsMap, setMistakeIds, setStudyDays],
  );

  const recordQuizAnswer = useCallback(
    (isCorrect: boolean) => {
      setStudyDays(prev => recordActivity(prev, 'quizAnswer', isCorrect));
    },
    [setStudyDays],
  );

  const resetProgress = useCallback(() => {
    setLearnedIds(new Set());
    setSrsMap({});
    setMistakeIds([]);
  }, [setLearnedIds, setSrsMap, setMistakeIds]);

  const setFocusMode = useCallback((v: boolean) => setFocusModeRaw(v), [setFocusModeRaw]);

  return {
    stage,
    setStage,
    words,
    learnedIds,
    mistakeIds,
    srsMap,
    units,
    achievements,
    streak,
    studyDays,
    summary,
    markLearned,
    unmarkLearned,
    submitFeedback,
    recordQuizAnswer,
    resetProgress,
    focusMode,
    setFocusMode,
  };
}
