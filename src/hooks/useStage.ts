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
  shouldGraduateFromMistakes,
  applySpellingReview,
  shouldGraduateSpelling,
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
    /** 从未学过的词数（learnedIds 里没有的） */
    newWordCount: number;
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
  /** 提交反馈；返回该词本次是否因连续答对达标而"毕业出本"（供 UI 庆祝/提示） */
  submitFeedback: (wordOrId: Word | string, feedback: ReviewFeedback) => boolean;
  /** 提交一次拼写反馈；只更新拼写维度(spelling)，不触碰词义 SRS 进度。
   *  返回拼写维度是否"拼写攻克"达标（供 UI 庆祝/提示）。 */
  submitSpelling: (wordOrId: Word | string, feedback: ReviewFeedback) => boolean;
  recordQuizAnswer: (isCorrect: boolean, word?: Word) => void;
  /** 仅清空错词本（保留已掌握、SRS、打卡） */
  clearMistakes: () => void;
  resetProgress: () => void;
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
  /** 答题后反馈延迟（毫秒）。sprint 模式下反馈期内会冻结倒计时 */
  quizFeedbackDelayMs: number;
  setQuizFeedbackDelayMs: (ms: number) => void;
  lookupSrs: (wordOrId: Word | string) => SrsState | undefined;
  isLearned: (wordOrId: Word | string) => boolean;
  /** 今日初始待复习数（每天首次打开时快照，用于计算复习进度） */
  todayInitialDue: number;
  /** 今日已复习数（初始 - 当前剩余） */
  todayReviewed: number;
  /** 今日已复习的单词 ID 列表（按复习顺序） */
  todayReviewedIds: string[];
  /** 今日是否有学习活动（studyDays 今日记录 studyCount > 0） */
  todayHasActivity: boolean;
  /** 今日新学词数（每天自动归零） */
  todayNewLearned: number;
  /** 已攻克错词的累计计数（毕业沉淀，按学段独立） */
  graduatedCount: number;
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
  // 已攻克错词的累计计数（毕业沉淀，按学段独立）
  const [graduatedCount, setGraduatedCount] = useLocalStorage<number>(
    StorageKeys.graduated(stage),
    0,
  );
  const [studyDays, setStudyDays] = useLocalStorage<StudyDayRecord[]>(
    StorageKeys.studyDays,
    [],
  );
  // 专注模式：手机端（窄屏）默认开启沉浸式学习，桌面端默认关闭，用户可手动切换
  const defaultFocusMode = typeof window === 'undefined' ? true : window.innerWidth < 768;
  const [focusMode, setFocusModeRaw] = useLocalStorage<boolean>(
    'vocab-focus-mode',
    defaultFocusMode,
  );
  const [quizFeedbackDelayMs, setQuizFeedbackDelayMsRaw] = useLocalStorage<number>(
    'vocab-quiz-feedback-delay-ms',
    1000,
  );
  // 今日待复习数快照：{ date: 当天0点, count: 初始dueCount }
  const [todaySnapshot, setTodaySnapshot] = useLocalStorage<{ date: number; count: number }>(
    'vocab-today-due-snapshot',
    { date: 0, count: 0 },
  );
  // 今日新学数：{ date: 当天0点, count: 当日累计新学词数 }
  const [todayNewSnapshot, setTodayNewSnapshot] = useLocalStorage<{ date: number; count: number }>(
    'vocab-today-new-snapshot',
    { date: 0, count: 0 },
  );
  // 今日已复习单词列表：{ date: 当天0点, ids: 当日复习过的 wordKey 列表（按顺序） }
  const [todayReviewedSnapshot, setTodayReviewedSnapshot] = useLocalStorage<{ date: number; ids: string[] }>(
    'vocab-today-reviewed-snapshot',
    { date: 0, ids: [] },
  );

  const words = useMemo<Word[]>(() => WORDS_BY_STAGE[stage], [stage]);

  // --- 今日快照逻辑 ---
  const todayKey = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);
  // 今天是否有学习活动
  const todayHasActivity = useMemo(() => {
    const rec = studyDays.find(r => r.date === todayKey);
    return !!rec && rec.studyCount > 0;
  }, [studyDays, todayKey]);

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
    // srsMap：为旧记录兜底 firstMasteredAt（用 lastReviewedAt 作为近似首次掌握时间）
    let needsFirstMastered = false;
    for (const k of Object.keys(srsMap)) {
      const s = srsMap[k];
      if (s && s.firstMasteredAt === undefined) {
        needsFirstMastered = true;
        break;
      }
    }
    if (needsFirstMastered) {
      setSrsMap(prev => {
        let mutated = false;
        const next = { ...prev };
        for (const k of Object.keys(prev)) {
          const s = next[k];
          if (!s || s.firstMasteredAt !== undefined) continue;
          // 老数据：上次复习时间 ≈ 首次掌握时间；从未复习的（手动标记）按当前时间兜底
          next[k] = {
            ...s,
            firstMasteredAt: s.lastReviewedAt > 0 ? s.lastReviewedAt : Date.now(),
          };
          mutated = true;
        }
        return mutated ? next : prev;
      });
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
    // dueCount = 学过且到期的词（需复习），不含从未学过的新词和未到期的词
    const now = Date.now();
    let dueCount = 0;
    for (const w of words) {
      const key = wordKey(w);
      const state = srsMap[key] ?? srsMap[w.id];
      // 只统计有 SRS 记录且 dueAt 到期的词
      if (state && (state.dueAt === 0 || state.dueAt <= now)) dueCount++;
    }
    // newWordCount = 从未学过的词数（learnedIds 里没有的）
    let newWordCount = 0;
    for (const w of words) {
      const key = wordKey(w);
      if (!learnedIds.has(key) && !learnedIds.has(w.id)) newWordCount++;
    }
    return {
      learnedCount,
      totalInStage: words.length,
      dueCount,
      newWordCount,
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

  // 今日快照：首次有 dueCount 且快照日期不是今天时，记录初始值
  useEffect(() => {
    if (summary.dueCount > 0 && todaySnapshot.date !== todayKey) {
      setTodaySnapshot({ date: todayKey, count: summary.dueCount });
    }
    // 快照值异常（>= 总词数，旧 bug 残留）时自动重置
    if (todaySnapshot.date === todayKey && todaySnapshot.count >= words.length) {
      setTodaySnapshot({ date: todayKey, count: summary.dueCount });
    }
  }, [summary.dueCount, todayKey, todaySnapshot.date, todaySnapshot.count, words.length, setTodaySnapshot]);

  // 今日复习进度
  const todayInitialDue = todaySnapshot.date === todayKey ? todaySnapshot.count : summary.dueCount;
  // 今日已复习数：基于今日已复习词列表长度（累加器），而非减法 → 不会因学新词导致进度倒退
  const todayReviewed = todayReviewedSnapshot.date === todayKey ? todayReviewedSnapshot.ids.length : 0;
  // 今日新学数：跨日期自动归零
  const todayNewLearned = todayNewSnapshot.date === todayKey ? todayNewSnapshot.count : 0;
  // 今日已复习单词列表：跨日期自动归零
  const todayReviewedIds = todayReviewedSnapshot.date === todayKey ? todayReviewedSnapshot.ids : [];

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
        // 已存在的 SRS 不覆盖（保留复习间隔 / 上次复习时间等）
        if (prev[key] || prev[legacyId]) {
          // 但如果存在记录里没 firstMasteredAt（老数据迁移漏网），补一个
          const existing = prev[key] ?? prev[legacyId];
          if (existing && existing.firstMasteredAt === undefined) {
            const patched = { ...existing, firstMasteredAt: existing.lastReviewedAt || Date.now() };
            return { ...prev, [key]: patched, [legacyId]: patched };
          }
          return prev;
        }
        // 新建的 SRS：手动标记 → firstMasteredAt = now, lastReviewedAt = 0（不参与复习循环）
        const base = { ...createInitialSrs(), firstMasteredAt: Date.now(), lastReviewedAt: 0 };
        return { ...prev, [key]: base, [legacyId]: base };
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
      // 0. 先判断：这是不是该词首次进入 learnedIds
      //    用于在 'know' 时计入今日新学
      let wasLearnedBefore = false;
      if (typeof wordOrId !== 'string') {
        wasLearnedBefore = learnedIds.has(key) || learnedIds.has(legacyId);
      } else {
        // 字符串 id 路径：检查已知的 wordKey 与 id
        const w = words.find(x => x.id === wordOrId);
        if (w) {
          const k = wordKey(w);
          wasLearnedBefore = learnedIds.has(k) || learnedIds.has(wordOrId);
        } else {
          wasLearnedBefore = learnedIds.has(key);
        }
      }
      // 1. 更新 SRS 状态（同时写 key + 旧 id 双映射）
      //    先在闭包 srsMap 上算出 next，便于同步判断"是否毕业出本"
      const cur = srsMap[key] ?? srsMap[legacyId] ?? createInitialSrs();
      const rawNext = applyReview(cur, feedback);
      let next = rawNext;
      // 首次掌握（!wasLearnedBefore）→ 写入首次掌握时间戳；后续复习保留旧值
      if (!wasLearnedBefore && next.firstMasteredAt === undefined) {
        next = { ...next, firstMasteredAt: Date.now() };
      }
      setSrsMap(prev => ({
        ...prev,
        [key]: next,
        [legacyId]: next,
      }));
      // 2. 联动错词本与掌握集合
      let graduated = false;
      if (feedback === 'know') {
        setLearnedIds(prev => {
          if (prev.has(key) || prev.has(legacyId)) return prev;
          const s = new Set(prev);
          s.add(key);
          if (legacyId && legacyId !== key) s.add(legacyId);
          return s;
        });
        // 首次掌握（之前不在 learnedIds）→ 计入今日新学
        if (!wasLearnedBefore) {
          setTodayNewSnapshot(prev => {
            const today = todayKey;
            const base = prev.date === today ? prev.count : 0;
            return { date: today, count: base + 1 };
          });
        }
        // 连续答对达标才毕业出本；未达标仍留在错词本，等待下一次间隔复习
        graduated = shouldGraduateFromMistakes(next);
        if (graduated) {
          setMistakeIds(prev => prev.filter(x => x !== key && x !== legacyId));
          setGraduatedCount(prev => prev + 1);
        }
      } else {
        setMistakeIds(prev => {
          if (prev.includes(key) || prev.includes(legacyId)) return prev;
          return [...prev, key];
        });
      }
      // 3. 计入今日打卡
      setStudyDays(prev => recordActivity(prev, feedback, feedback === 'know'));
      // 4. 计入今日已复习列表（只记录复习模式的词，首次掌握的新词也计入）
      setTodayReviewedSnapshot(prev => {
        const today = todayKey;
        if (prev.date !== today) {
          return { date: today, ids: [key] };
        }
        if (prev.ids.includes(key) || prev.ids.includes(legacyId)) {
          return prev;
        }
        return { date: today, ids: [...prev.ids, key] };
      });
      return graduated;
    },
    [setLearnedIds, setSrsMap, setMistakeIds, setGraduatedCount, setStudyDays, setTodayNewSnapshot, setTodayReviewedSnapshot, learnedIds, words, todayKey, srsMap],
  );

  /**
   * 提交一次拼写反馈（拼写训练专用）。
   * 只在 srsMap 里更新 spelling 子维度，不触碰词义 repetitions/easeFactor/dueAt，
   * 也不把该词记入错词本——看清义掌握由 submitFeedback 管，拼写独立攻坚。
   * 返回拼写维度是否"拼写攻克"（spelling.repetitions >= graduationThreshold）。
   */
  const submitSpelling = useCallback(
    (wordOrId: Word | string, feedback: ReviewFeedback): boolean => {
      const word = typeof wordOrId === 'string'
        ? words.find(w => w.id === wordOrId)
        : wordOrId;
      if (!word) return false;
      const key = wordKey(word);
      const legacyId = word.id;
      const now = Date.now();
      let graduated = false;
      setSrsMap(prev => {
        const cur = prev[key] ?? prev[legacyId] ?? createInitialSrs();
        const next = {
          ...cur,
          spelling: applySpellingReview(cur.spelling, feedback, now),
        };
        graduated = shouldGraduateSpelling(next);
        return { ...prev, [key]: next, [legacyId]: next };
      });
      // 拼写训练也算一次学习活动（打卡/答题统计）
      setStudyDays(prev => recordActivity(prev, feedback, feedback === 'know'));
      return graduated;
    },
    [words, setSrsMap, setStudyDays],
  );

  const recordQuizAnswer = useCallback(
    (isCorrect: boolean, word?: Word) => {
      // 打卡统计
      setStudyDays(prev => recordActivity(prev, 'quizAnswer', isCorrect));
      if (!word) return;
      const key = wordKey(word);
      const legacyId = word.id;
      const mastered = learnedIds.has(key) || learnedIds.has(legacyId);
      // 答错时：已掌握的不处理，未掌握的才记入错词本并更新 SRS
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
    setGraduatedCount(0);
  }, [setLearnedIds, setSrsMap, setMistakeIds, setGraduatedCount]);

  /** 仅清空错词本（保留 learnedIds、srsMap、studyDays） */
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
    submitSpelling,
    recordQuizAnswer,
    clearMistakes,
    resetProgress,
    focusMode,
    setFocusMode,
    quizFeedbackDelayMs,
    setQuizFeedbackDelayMs,
    lookupSrs,
    isLearned,
    todayInitialDue,
    todayReviewed,
    todayReviewedIds,
    todayHasActivity,
    todayNewLearned,
    graduatedCount,
  };
}
