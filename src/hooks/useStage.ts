import { useCallback, useEffect, useMemo } from 'react';
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
import { WORDS_BY_STAGE, ALL_WORDS } from '../data';
import {
  createInitialSrs,
  applyReview,
  selectDueWords,
  planUnitsForStage,
  evaluateAchievements,
  computeStreak,
  recordActivity,
  wordKey,
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

  markLearned: (wordOrId: Word | string) => void;
  unmarkLearned: (wordOrId: Word | string) => void;
  submitFeedback: (wordOrId: Word | string, feedback: ReviewFeedback) => void;
  recordQuizAnswer: (isCorrect: boolean, word?: Word) => void;
  /** 仅清空易错本（保留已掌握、SRS、打卡） */
  clearMistakes: () => void;
  resetProgress: () => void;
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
  /** 答题后反馈延迟（毫秒）。sprint 模式下反馈期内会冻结倒计时 */
  quizFeedbackDelayMs: number;
  setQuizFeedbackDelayMs: (ms: number) => void;
  lookupSrs: (wordOrId: Word | string) => SrsState | undefined;
  isLearned: (wordOrId: Word | string) => boolean;
}

export function useStage(): UseStageReturn {
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
  const [quizFeedbackDelayMs, setQuizFeedbackDelayMsRaw] = useLocalStorage<number>(
    'vocab-quiz-feedback-delay-ms',
    1000,
  );

  const words = useMemo<Word[]>(() => WORDS_BY_STAGE[stage], [stage]);

  // 一次性迁移：把旧格式 id（裸 id）转成 wordKey
  // 触发条件：mistakeIds/learnedIds 里有不以 'w:' 或 'id:' 开头的项
  useEffect(() => {
    const wordById = new Map<string, Word>();
    for (const w of ALL_WORDS) wordById.set(w.id, w);
    const needsKey = (k: string) => !k.startsWith('w:') && !k.startsWith('id:');
    const migrate = (key: string): string => {
      if (!needsKey(key)) return key;
      const w = wordById.get(key);
      if (w) return wordKey(w);
      return key; // 找不到就保留，下游会再尝试 fallback
    };
    let changed = false;
    const newMistakes = mistakeIds.map(migrate);
    if (newMistakes.some((m, i) => m !== mistakeIds[i])) {
      // 去重保序
      const seen = new Set<string>();
      setMistakeIds(newMistakes.filter(m => (seen.has(m) ? false : (seen.add(m), true))));
      changed = true;
    }
    const newLearned = Array.from(learnedIds).map(migrate);
    // 同时保留旧 id 和迁移后的 wordKey，避免 UnitsView（按 wordId 计数）看不到
    const newLearnedSet = new Set<string>([...Array.from(learnedIds), ...newLearned]);
    if (
      newLearnedSet.size !== learnedIds.size ||
      [...newLearnedSet].some(k => !learnedIds.has(k))
    ) {
      setLearnedIds(newLearnedSet);
      changed = true;
    }
    // srsMap：把旧 id 键复制为 wordKey 键
    const oldSrsKeys = Object.keys(srsMap).filter(needsKey);
    if (oldSrsKeys.length > 0) {
      setSrsMap(prev => {
        const next = { ...prev };
        for (const k of oldSrsKeys) {
          const w = wordById.get(k);
          if (!w) continue;
          const nk = wordKey(w);
          next[nk] = next[nk] ?? prev[k];
        }
        return next;
      });
      changed = true;
    }
    if (changed) {
      console.info('[useStage] 已迁移旧格式数据到 wordKey');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

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

  // 把 word 或 id 规范成 (key, legacyId) 键对，同时支持稳定键 + 历史数据兼容
  const resolveKeys = (wordOrId: Word | string): { key: string; legacyId: string } => {
    if (typeof wordOrId === 'string') {
      return { key: wordOrId, legacyId: wordOrId };
    }
    return { key: wordKey(wordOrId), legacyId: wordOrId.id };
  };

  const markLearned = useCallback(
    (wordOrId: Word | string) => {
      const { key, legacyId } = resolveKeys(wordOrId);
      setLearnedIds(prev => {
        const s = new Set(prev);
        s.add(key);
        // 同步加 legacyId，避免 UnitsView（按 wordId 匹配）错过该词
        if (legacyId && legacyId !== key) s.add(legacyId);
        return s;
      });
      setSrsMap(prev => {
        const cur = prev[key] ?? prev[legacyId] ?? createInitialSrs();
        if (prev[key]) return prev;
        return { ...prev, [key]: cur, [legacyId]: cur };
      });
      setMistakeIds(prev => {
        const without = prev.filter(x => x !== key && x !== legacyId);
        return without;
      });
    },
    [setLearnedIds, setSrsMap, setMistakeIds],
  );

  const unmarkLearned = useCallback(
    (wordOrId: Word | string) => {
      const { key, legacyId } = resolveKeys(wordOrId);
      setLearnedIds(prev => {
        if (!prev.has(key) && !prev.has(legacyId)) return prev;
        const s = new Set(prev);
        s.delete(key);
        if (legacyId) s.delete(legacyId);
        return s;
      });
      setSrsMap(prev => {
        if (!prev[key] && !prev[legacyId]) return prev;
        const next = { ...prev };
        delete next[key];
        delete next[legacyId];
        return next;
      });
    },
    [setLearnedIds, setSrsMap],
  );

  const submitFeedback = useCallback(
    (wordOrId: Word | string, feedback: ReviewFeedback) => {
      const { key, legacyId } = resolveKeys(wordOrId);
      // 1. 更新 SRS 状态（同时写 key + 旧 id 双映射）
      setSrsMap(prev => {
        const cur = prev[key] ?? prev[legacyId] ?? createInitialSrs();
        const next = applyReview(cur, feedback);
        return { ...prev, [key]: next, [legacyId]: next };
      });
      // 2. 联动易错本与掌握集合
      if (feedback === 'know') {
        setLearnedIds(prev => {
          if (prev.has(key) || prev.has(legacyId)) return prev;
          const s = new Set(prev);
          s.add(key);
          if (legacyId && legacyId !== key) s.add(legacyId);
          return s;
        });
        setMistakeIds(prev => prev.filter(x => x !== key && x !== legacyId));
      } else {
        setMistakeIds(prev => {
          if (prev.includes(key) || prev.includes(legacyId)) return prev;
          return [...prev, key];
        });
      }
      // 3. 计入今日打卡
      setStudyDays(prev => recordActivity(prev, feedback, feedback === 'know'));
    },
    [setLearnedIds, setSrsMap, setMistakeIds, setStudyDays],
  );

  const recordQuizAnswer = useCallback(
    (isCorrect: boolean, word?: Word) => {
      // 打卡统计
      setStudyDays(prev => recordActivity(prev, 'quizAnswer', isCorrect));
      if (!word) return;
      const key = wordKey(word);
      const legacyId = word.id;
      const mastered = learnedIds.has(key) || learnedIds.has(legacyId);
      // 答错时：已掌握的不处理，未掌握的才记入易错本并更新 SRS
      if (!isCorrect && !mastered) {
        // 更新 SRS（走 SM2 曲线，而非仅累加 wrongCount）
        setSrsMap(prev => {
          const cur = prev[key] ?? prev[legacyId] ?? createInitialSrs();
          const next = applyReview(cur, 'unknown');
          return { ...prev, [key]: next, [legacyId]: next };
        });
        setMistakeIds(prev => {
          if (prev.includes(key) || prev.includes(legacyId)) return prev;
          return [...prev, key];
        });
      }
    },
    [learnedIds, setStudyDays, setSrsMap, setMistakeIds],
  );

  const resetProgress = useCallback(() => {
    setLearnedIds(new Set());
    setSrsMap({});
    setMistakeIds([]);
  }, [setLearnedIds, setSrsMap, setMistakeIds]);

  /** 仅清空易错本（保留 learnedIds、srsMap、studyDays） */
  const clearMistakes = useCallback(() => {
    setMistakeIds([]);
  }, [setMistakeIds]);

  const setFocusMode = useCallback((v: boolean) => setFocusModeRaw(v), [setFocusModeRaw]);
  const setQuizFeedbackDelayMs = useCallback((ms: number) => setQuizFeedbackDelayMsRaw(ms), [setQuizFeedbackDelayMsRaw]);

  /** 统一的 SRS 查询：传入 Word 或 wordId，自动用 wordKey 取 srsMap 值 */
  const lookupSrs = useCallback(
    (wordOrId: Word | string): SrsState | undefined => {
      const word = typeof wordOrId === 'string'
        ? words.find(w => w.id === wordOrId)
        : wordOrId;
      if (!word) return undefined;
      const key = wordKey(word);
      return srsMap[key] ?? srsMap[word.id];
    },
    [srsMap, words],
  );

  /** 统一的掌握状态查询 */
  const isLearned = useCallback(
    (wordOrId: Word | string): boolean => {
      const word = typeof wordOrId === 'string'
        ? words.find(w => w.id === wordOrId)
        : wordOrId;
      if (!word) return false;
      const key = wordKey(word);
      return learnedIds.has(key) || learnedIds.has(word.id);
    },
    [learnedIds, words],
  );

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
    clearMistakes,
    resetProgress,
    focusMode,
    setFocusMode,
    quizFeedbackDelayMs,
    setQuizFeedbackDelayMs,
    lookupSrs,
    isLearned,
  };
}
