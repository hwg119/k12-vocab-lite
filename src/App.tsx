import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Word, AppView } from './types';
import { STAGE_META } from './data';
import {
  generateQuiz,
  sample,
  pickMistakes,
  buildDailySummaries,
  groupConfusionPairs,
  generateSeed,
  buildChallengeQuestions,
  wordKey,
} from './utils';
import { useStage } from './hooks';
import { useEdgeSwipe } from './hooks/useEdgeSwipe';
import { APP_VERSION, LATEST_VERSION } from './version';
import {
  Dashboard,
  StudyMode,
  QuizMode,
  QuizEntry,
  ChallengeInput,
  ChallengeResult,
  EdgeSwipeIndicator,
  WordList,
  MistakesView,
  StageSwitcher,
  UnitsView,
  AchievementsView,
  StatsView,
  ConfusionView,
  SettingsView,
  LearnedView,
  TodayReviewedView,
  ErrorBoundary,
} from './components';
import {
  IconHome,
  IconBook,
  IconList,
  IconChart,
  IconMenu,
  IconX,
  IconAlertCircle,
  IconTrophy,
  IconGrid,
  IconQuestion,
} from './components/Icons';

/**
 * 主应用组件 - K12 全学段适配版
 *
 * 主要变更（相对 v1.0）：
 *   - 顶部加入学段切换器（小学/初中/高中），按学段隔离数据
 *   - 接入 SM2 间隔重复算法，submitFeedback 取代原有 markAsLearned
 *   - 新增易错生词本（mistakes 视图）
 *   - 新增单元闯关（units 视图）+ 勋章墙（achievements 视图）
 *   - 首页 Dashboard 显示"今日待复习"数量
 */
export default function App() {
  const {
    stage,
    setStage,
    words,
    learnedIds,
    mistakeIds,
    srsMap,
    units,
    achievements,
    streak,
    summary,
    studyDays,
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
    todayInitialDue,
    todayReviewed,
    todayReviewedIds,
    todayHasActivity,
    todayNewLearned,
  } = useStage();

  // 近 7 日学习摘要（用于周报柱状图）
  const recentDays = useMemo(() => buildDailySummaries(studyDays, 7), [studyDays]);
  // 当前学段易混词配对数量
  const confusionCount = useMemo(() => groupConfusionPairs(words).length, [words]);

  const [view, setViewRaw] = useState<AppView>('dashboard');
  // 视图历史栈（用于边缘滑动返回 / 浏览器后退 / Android 返回键）
  const viewHistoryRef = useRef<AppView[]>([]);
  const lastViewRef = useRef<AppView>('dashboard');
  /**
   * 已掌握视图的数据版本号：每次 view 切到 'learned' 时自增。
   * LearnedView 内部 useMemo 用此值判断是否重算已掌握列表，
   * 标记/取消标记本身不会触发重算（避免 1000 词的列表在每点一次时全量重排）。
   */
  const learnedDataVersionRef = useRef(0);
  const [learnedDataVersion, setLearnedDataVersion] = useState(0);
  /**
   * 词典视图的数据版本号：每次 view 切到 'list' 时自增。同上，标记/取消标记
   * 本身不会触发列表重算。
   */
  const listDataVersionRef = useRef(0);
  const [listDataVersion, setListDataVersion] = useState(0);
  useEffect(() => {
    if (view === 'learned') {
      learnedDataVersionRef.current += 1;
      setLearnedDataVersion(learnedDataVersionRef.current);
    } else if (view === 'list') {
      listDataVersionRef.current += 1;
      setListDataVersion(listDataVersionRef.current);
    }
  }, [view]);

  /**
   * 统一的视图切换函数：
   *   - push 当前 view 到 history 栈
   *   - 同步浏览器 history（让浏览器后退按钮/未来 Android 硬件返回都能用）
   *   - 然后设置新 view
   */
  const setView = useCallback((next: AppView) => {
    const prev = lastViewRef.current;
    if (next === prev) return;
    viewHistoryRef.current.push(prev);
    lastViewRef.current = next;
    setViewRaw(next);
    if (typeof window !== 'undefined') {
      try { window.history.pushState({ view: next }, '', `#${next}`); } catch {}
    }
  }, []);

  // 边缘滑动返回 / 浏览器返回：从栈中弹一个（不走 setView，避免再次入栈）
  // 注意：viewHistoryRef 与 lastViewRef 的更新放在 setViewRaw 之前，
  // 避免 React 18 StrictMode 调用 updater 两次时导致栈被多 pop 一次。
  const goBackView = useCallback(() => {
    const stack = viewHistoryRef.current;
    if (stack.length === 0) return; // 已在首页
    let target = stack.pop() as AppView;
    // 从 quiz/study/challengeInput 退出时：跳过连续的同类页面
    if (lastViewRef.current === 'quiz' || lastViewRef.current === 'study' || lastViewRef.current === 'challengeInput') {
      while (stack.length > 0 && (target === 'quiz' || target === 'study' || target === 'challengeInput')) {
        target = stack.pop() as AppView;
      }
      if (target === 'quiz' || target === 'study' || target === 'challengeInput') target = 'dashboard';
    }
    lastViewRef.current = target;
    // 同步浏览器 history（replaceState 避免再添记录，因为浏览器已 popstate）
    if (typeof window !== 'undefined') {
      try { window.history.replaceState({ view: target }, '', `#${target}`); } catch {}
    }
    setViewRaw(target);
  }, []);

  // 监听浏览器后退 / 前进按钮（popstate）→ 走 goBackView
  useEffect(() => {
    const onPopState = () => {
      // 浏览器已 popstate 把 history 退了一格；我们从 ref 取上一个 view 并 replaceState（不增减）
      goBackView();
    };
    window.addEventListener('popstate', onPopState);
    // 初始占位一条 history（避免首次返回直接退出）
    try { window.history.replaceState({ view: 'dashboard' }, '', '#dashboard'); } catch {}
    return () => window.removeEventListener('popstate', onPopState);
  }, [goBackView]);

  // Android 硬件返回键：Capacitor App 插件（需安装 @capacitor/app）
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; Plugins?: Record<string, unknown> } }).Capacitor;
        if (!cap?.isNativePlatform?.()) return;
        const mod = await import('@capacitor/app').catch(() => null);
        if (!mod) return;
        const listener = await mod.App.addListener('backButton', () => {
          // 在首页 → 退出 App；在其他页面 → goBackView 或直接跳 dashboard
          if (lastViewRef.current === 'dashboard') {
            mod.App.exitApp();
          } else {
            if (viewHistoryRef.current.length > 0) {
              goBackView();
            } else {
              // 栈已空（edge case：直接从 URL hash 进入某页面），跳回首页
              lastViewRef.current = 'dashboard';
              setViewRaw('dashboard');
              if (typeof window !== 'undefined') {
                try { window.history.replaceState({ view: 'dashboard' }, '', '#dashboard'); } catch {}
              }
            }
          }
        });
        cleanup = () => { listener.remove(); };
      } catch {
        // 非原生环境或插件未装；忽略
      }
    })();
    return () => { cleanup?.(); };
  }, [goBackView]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [studyQueue, setStudyQueue] = useState<Word[]>([]);
  const [studySource, setStudySource] = useState<'default' | 'review' | 'mistakes' | 'unit' | 'confusion' | 'newWord'>('default');
  const [quizQuestions, setQuizQuestions] = useState<ReturnType<typeof generateQuiz>>([]);
  const [quizMode, setQuizMode] = useState<'daily' | 'sprint' | 'challenge'>('daily');
  // 测验重启计数器——作为 QuizMode 的 key，强制重新挂载
  // 从 quizEntry 进入或"再来一次"时递增
  const [quizMountKey, setQuizMountKey] = useState(0);
  // 挑战模式相关 state
  const [challengeSeed, setChallengeSeed] = useState<string | undefined>(undefined);
  const [opponentResult, setOpponentResult] = useState<{ score: number; timeSec: number } | null>(null);
  const [myChallengeResult, setMyChallengeResult] = useState<{ score: number; timeSec: number } | null>(null);

  // Tailwind JIT 需要完整类名，不能动态拼接
  const stageBarColors: Record<string, string> = {
    primary: 'bg-amber-500',
    junior: 'bg-emerald-500',
    senior: 'bg-indigo-500',
  };
  const stageBadgeColors: Record<string, string> = {
    primary: 'bg-amber-600',
    junior: 'bg-emerald-600',
    senior: 'bg-indigo-600',
  };

  const sessionSize = 50;

  // 启动学习模式 - SRS 复习（只取剩余待复习词，不补新词/远期词）
  const startStudy = useCallback(() => {
    const now = Date.now();
    // 只筛出"真正到期需复习"的词（有 SRS 记录且 dueAt <= now）
    const dueIds = words
      .filter(w => {
        const key = wordKey(w);
        const state = srsMap[key] ?? srsMap[w.id];
        return state && (state.dueAt === 0 || state.dueAt <= now);
      })
      .map(w => w.id);
    // 已学过的词中，剩余待复习的就是 dueIds；样本抽样避免每次都按同一顺序
    const session = sample(words.filter(w => dueIds.includes(w.id)), sessionSize);
    // 兜底：如果一个都没筛出来，用全部 words（极端情况下 srsMap 全空）
    const finalQueue = session.length > 0 ? session : sample(words, sessionSize);
    setStudyQueue(finalQueue);
    setStudySource('review');
    setView('study');
  }, [words, srsMap]);

  // 启动学习模式 - 仅新词（从未学过的）
  const startNewWord = useCallback(() => {
    const fresh = words.filter(w => {
      const key = wordKey(w);
      return !learnedIds.has(key) && !learnedIds.has(w.id);
    });
    const session = sample(fresh, sessionSize);
    if (session.length === 0) return;
    setStudyQueue(session);
    setStudySource('newWord'); // 学完新词后回首页
    setView('study');
  }, [words, learnedIds]);

  // 单元闯关 - 接收 units/cards 队列
  const startUnit = useCallback((queue: Word[]) => {
    setStudyQueue(queue);
    setStudySource('unit');
    setView('study');
  }, []);

  // 易错生词本队列
  const startMistakesReview = useCallback((queue: Word[]) => {
    const ids = pickMistakes(queue, srsMap, queue.length);
    const wordsByIds = ids
      .map(id => words.find(w => w.id === id))
      .filter((w): w is Word => Boolean(w));
    setStudyQueue(wordsByIds.length > 0 ? wordsByIds : queue);
    setStudySource('mistakes');
    setView('study');
  }, [words, srsMap]);

  // 测验入口（点击进入选择模式）
  const openQuizEntry = useCallback(() => setView('quizEntry'), []);

  // 启动日常模式
  const startQuizDaily = useCallback(() => {
    setQuizQuestions(generateQuiz(words, 20));
    setQuizMode('daily');
    setQuizMountKey(k => k + 1);
    setView('quiz');
  }, [words]);

  // 启动冲刺模式
  const startQuizSprint = useCallback(() => {
    setQuizQuestions(generateQuiz(words, 20));
    setQuizMode('sprint');
    setQuizMountKey(k => k + 1);
    setView('quiz');
  }, [words]);

  // 测验重玩
  const restartQuiz = useCallback(() => {
    if (quizMode === 'sprint') startQuizSprint();
    else if (quizMode === 'challenge') {
      // 挑战模式重玩：保持种子不变
      if (challengeSeed) {
        setQuizQuestions(generateQuiz(words, 20, challengeSeed));
        setQuizMountKey(k => k + 1);
      }
    } else startQuizDaily();
  }, [quizMode, startQuizDaily, startQuizSprint, challengeSeed, words]);

  // 发起挑战：生成 seed，出一套题
  const startChallenge = useCallback(() => {
    const seed = generateSeed();
    setChallengeSeed(seed);
    setOpponentResult(null);
    setMyChallengeResult(null);
    setQuizQuestions(generateQuiz(words, 20, seed));
    setQuizMode('challenge');
    setView('quiz');
  }, [words]);

  // 提交挑战码：进入作答
  const acceptChallenge = useCallback((code: string) => {
    try {
      const { questions, opponent } = buildChallengeQuestions(words, code);
      setChallengeSeed(opponent.seed);
      setOpponentResult({ score: opponent.score, timeSec: opponent.timeSec });
      setMyChallengeResult(null);
      setQuizQuestions(questions);
      setQuizMode('challenge');
      setView('quiz');
    } catch (e) {
      // 解码失败：返回入口页并提示
      console.error('挑战码解析失败', e);
      alert(`挑战码无效：${(e as Error).message}`);
      setView('quizEntry');
    }
  }, [words]);

  // 挑战模式作答完成
  const handleChallengeFinish = useCallback((result: { score: number; timeSec: number }) => {
    setMyChallengeResult(result);
  }, []);

  // 挑战模式重玩（答完对方题后，用新 seed 再出一套题让好友玩）

  // 切到下一个 view 时清残留队列 + 跳回首页时清空返回栈
  useEffect(() => {
    if (view !== 'study') {
      setStudyQueue([]);
      setStudySource('default');
    }
    if (view !== 'quiz') setQuizQuestions([]);
    // 跳回首页时清空返回栈（用户语义上"重新开始"）
    if (view === 'dashboard') {
      viewHistoryRef.current = [];
    }
  }, [view]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen(p => !p), []);

  // 移动端边缘滑动返回：左右两侧都可触发
  useEdgeSwipe(goBackView);

  const handleReset = useCallback(() => {
    if (window.confirm(`确定要清空【${STAGE_META[stage].title}】学段全部学习数据吗？\n其他学段不受影响。`)) {
      resetProgress();
    }
  }, [stage, resetProgress]);

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconAlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Words Loaded</h2>
          <p className="text-slate-500 mb-6">该学段词库为空，请切换到其他学段。</p>
          <button
            onClick={() => setStage('senior')}
            className="w-full py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            切到高中
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden">
        {/* 侧边栏（专注模式下隐藏） */}
        <aside
          className={`hidden md:flex flex-col bg-white border-r border-slate-200 fixed h-full z-40 transition-all duration-300 ease-in-out ${
            focusMode ? 'hidden' : isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
          }`}
        >
          <div className="p-6 pt-safe border-b border-slate-100 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
              <span className={`${stageBadgeColors[stage]} text-white rounded-lg p-1.5 text-sm`}>VM</span>
              <span>Vocab Master</span>
            </h1>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 py-3 border-b border-slate-100">
            <StageSwitcher current={stage} onChange={setStage} />
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<IconHome />} label="首页" />
            <NavButton active={view === 'study'} onClick={startStudy} icon={<IconBook />} label={`开始学习${summary.dueCount > 0 ? ` (${summary.dueCount})` : ''}`} />
            <NavButton active={view === 'units'} onClick={() => setView('units')} icon={<IconGrid />} label={`闯关 (${summary.unitsCompleted}/${summary.unitsTotal})`} />
            <NavButton active={view === 'mistakes'} onClick={() => setView('mistakes')} icon={<IconAlertCircle />} label={`易错词 (${mistakeIds.length})`} />
            <NavButton active={view === 'confusions'} onClick={() => setView('confusions')} icon={<IconQuestion />} label={`易混淆词 (${confusionCount})`} />
            <NavButton active={view === 'list'} onClick={() => setView('list')} icon={<IconList />} label="词典" />
            <NavButton active={view === 'learned'} onClick={() => setView('learned')} icon={<IconChart />} label="已掌握" />
            <NavButton active={view === 'stats'} onClick={() => setView('stats')} icon={<IconChart />} label="数据周报" />
            <NavButton active={view === 'achievements'} onClick={() => setView('achievements')} icon={<IconTrophy />} label={`勋章 (${achievements.length})`} />
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">本学段进度</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800">{learnedIds.size}</span>
                <span className="text-sm text-slate-400">/ {words.length}</span>
              </div>
              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className={`${stageBarColors[stage]} h-1.5 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.round((learnedIds.size / words.length) * 100) || 0}%` }}
                ></div>
              </div>
              {summary.dueCount > 0 && (
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  ⏰ {summary.dueCount} 词待复习
                </p>
              )}
              {streak.current > 0 && (
                <p className="text-xs text-rose-500 mt-1 font-medium">
                  🔥 连续 {streak.current} 天
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${focusMode ? 'md:ml-0' : isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
          <header className={`bg-white shadow-sm shrink-0 z-30 relative pt-safe ${focusMode ? 'md:opacity-30 md:hover:opacity-100 transition-opacity' : ''}`}>
            <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!focusMode && (
                  <button
                    onClick={toggleSidebar}
                    className="hidden md:flex p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                  >
                    <IconMenu className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="md:hidden">
                <StageSwitcher current={stage} onChange={setStage} />
              </div>

              <div className="flex items-center gap-2">
                {/* 版本号（非专注模式下显示） */}
                {!focusMode && (
                  <button
                    onClick={() => setView('settings')}
                    title="版本信息"
                    className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md transition-colors ${
                      APP_VERSION === LATEST_VERSION
                        ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        : 'text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    {APP_VERSION === LATEST_VERSION ? `v${APP_VERSION}` : `v${APP_VERSION} ⚠`}
                  </button>
                )}
                {/* 专注模式 toggle */}
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                    focusMode
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                  title="专注模式"
                >
                  {focusMode ? '◉ 专注中' : '○ 专注'}
                </button>
              </div>
            </div>
          </header>

          <main className={`flex-1 relative w-full overflow-y-auto overflow-x-hidden ${focusMode ? 'pb-0' : 'pb-20 md:pb-0'}`}>
            <div className={`max-w-6xl mx-auto min-h-full flex flex-col box-border p-3 sm:p-4 lg:p-6 ${view === 'learned' || view === 'mistakes' || view === 'confusions' ? 'justify-start' : 'justify-center'}`}>
              {view === 'dashboard' && (
                <Dashboard
                  words={words}
                  learnedIds={learnedIds}
                  dueCount={summary.dueCount}
                  newWordCount={summary.newWordCount}
                  mistakeCount={mistakeIds.length}
                  unitsCompleted={summary.unitsCompleted}
                  unitsTotal={summary.unitsTotal}
                  achievementsCount={achievements.length}
                  streak={streak.current}
                  confusionCount={confusionCount}
                  stage={stage}
                  todayInitialDue={todayInitialDue}
                  todayReviewed={todayReviewed}
                  todayHasActivity={todayHasActivity}
                  todayNewLearned={todayNewLearned}
                  accuracy={summary.accuracy}
                  onStartStudy={startStudy}
                  onViewTodayReviewed={() => setView('todayReviewed')}
                  onStartNewWord={startNewWord}
                  onStartQuiz={openQuizEntry}
                  onViewUnits={() => setView('units')}
                  onViewMistakes={() => setView('mistakes')}
                  onViewConfusions={() => setView('confusions')}
                  onViewAchievements={() => setView('achievements')}
                  onViewList={() => setView('list')}
                  onViewLearned={() => setView('learned')}
                  onViewStats={() => setView('stats')}
                  onViewSettings={() => setView('settings')}
                  onResetProgress={handleReset}
                />
              )}

              {view === 'study' && (
                <StudyMode
                  studyQueue={studyQueue}
                  learnedIds={learnedIds}
                  source={studySource}
                  onSubmit={(id, fb) => {
                    const w = words.find(x => x.id === id);
                    submitFeedback(w ?? id, fb);
                  }}
                  onGoHome={() => {
                    // 同步清队列，避免 setView 后还残留旧 studyQueue 引发的空白
                    setStudyQueue([]);
                    if (studySource === 'confusion') {
                      setView('confusions');
                    } else if (studySource === 'unit') {
                      setView('units');
                    } else if (studySource === 'mistakes') {
                      setView('mistakes');
                    } else {
                      setView('dashboard');
                    }
                  }}
                />
              )}

              {view === 'quizEntry' && (
                <QuizEntry
                  onGoHome={() => setView('dashboard')}
                  onStartDaily={startQuizDaily}
                  onStartSprint={startQuizSprint}
                  onStartChallenge={() => {
                    // 弹一个选择：发起挑战 vs 输入挑战码
                    setView('challengeInput');
                  }}
                />
              )}

              {view === 'challengeInput' && (
                <ChallengeInput
                  onGoHome={() => setView('quizEntry')}
                  onSubmit={acceptChallenge}
                  onStartChallenge={startChallenge}
                />
              )}

              {view === 'quiz' && quizQuestions.length > 0 && (
                <>
                  {/* 挑战模式且我方已完成 → 显示对比页 */}
                  {quizMode === 'challenge' && opponentResult && myChallengeResult ? (
                    <ChallengeResult
                      myScore={myChallengeResult.score}
                      myTimeSec={myChallengeResult.timeSec}
                      opponentScore={opponentResult.score}
                      opponentTimeSec={opponentResult.timeSec}
                      totalQuestions={quizQuestions.length}
                      onGoHome={() => {
                        setMyChallengeResult(null);
                        setOpponentResult(null);
                        setChallengeSeed(undefined);
                        setView('dashboard');
                      }}
                      onRematch={() => {
                        setMyChallengeResult(null);
                        setView('quizEntry');
                      }}
                    />
                  ) : (
                    <QuizMode
                      key={`${quizMode}-${quizMountKey}`}
                      questions={quizQuestions}
                      onGoHome={() => setView('dashboard')}
                      onRestart={restartQuiz}
                      onAnswer={(correct, wordId) => {
                    const w = wordId ? quizQuestions.find(q => q.word.id === wordId)?.word : undefined;
                    recordQuizAnswer(correct, w);
                  }}
                      mode={quizMode}
                      challengeSeed={quizMode === 'challenge' ? challengeSeed : undefined}
                      onFinish={handleChallengeFinish}
                      feedbackDelayMs={quizFeedbackDelayMs}
                    />
                  )}
                </>
              )}

              {view === 'units' && (
                <UnitsView
                  stage={stage}
                  units={units}
                  words={words}
                  learnedIds={learnedIds}
                  onGoHome={() => setView('dashboard')}
                  onStartUnit={startUnit}
                />
              )}

              {view === 'achievements' && (
                <AchievementsView
                  achievements={achievements}
                  learnedCount={learnedIds.size}
                  totalInStage={words.length}
                  currentStreak={streak.current}
                  longestStreak={streak.longest}
                  onGoHome={() => setView('dashboard')}
                />
              )}

              {view === 'stats' && (
                <StatsView
                  stage={stage}
                  words={words}
                  learnedIds={learnedIds}
                  mistakeIds={mistakeIds}
                  dueCount={summary.dueCount}
                  totalCorrect={summary.totalCorrect}
                  totalAnswered={summary.totalAnswered}
                  accuracy={summary.accuracy}
                  currentStreak={streak.current}
                  longestStreak={streak.longest}
                  unitsCompleted={summary.unitsCompleted}
                  unitsTotal={summary.unitsTotal}
                  achievementsCount={achievements.length}
                  recentDays={recentDays}
                  onGoHome={() => setView('dashboard')}
                />
              )}

              {view === 'list' && (
                <WordList
                  words={words}
                  learnedIds={learnedIds}
                  onMarkAsLearned={markLearned}
                  onUnmarkLearned={unmarkLearned}
                  title="词典"
                  showMarkButton={true}
                  dataVersion={listDataVersion}
                />
              )}

              {view === 'learned' && (
                <LearnedView
                  words={words}
                  learnedIds={learnedIds}
                  srsMap={srsMap}
                  onGoHome={() => setView('dashboard')}
                  onMarkLearned={markLearned}
                  onUnmarkLearned={unmarkLearned}
                  dataVersion={learnedDataVersion}
                />
              )}

              {view === 'todayReviewed' && (
                <TodayReviewedView
                  words={words}
                  reviewedIds={todayReviewedIds}
                  learnedIds={learnedIds}
                  srsMap={srsMap}
                  onGoHome={() => setView('dashboard')}
                  onMarkLearned={markLearned}
                  onUnmarkLearned={unmarkLearned}
                />
              )}

              {view === 'mistakes' && (
                <MistakesView
                  words={words}
                  mistakeIds={mistakeIds}
                  srsMap={srsMap}
                  onGoHome={() => setView('dashboard')}
                  onStartReview={startMistakesReview}
                  onClearMistakes={clearMistakes}
                />
              )}

              {view === 'confusions' && (
                <ConfusionView
                  words={words}
                  srsMap={srsMap}
                  learnedIds={learnedIds}
                  onGoHome={() => setView('dashboard')}
                  onStartPair={(queue) => {
                    setStudyQueue(queue);
                    setStudySource('confusion');
                    setView('study');
                  }}
                />
              )}

              {view === 'settings' && (
                <SettingsView
                  stage={stage}
                  onGoHome={() => setView('dashboard')}
                  onAfterImport={() => setView('dashboard')}
                  quizFeedbackDelayMs={quizFeedbackDelayMs}
                  setQuizFeedbackDelayMs={setQuizFeedbackDelayMs}
                />
              )}
            </div>
          </main>

          {/* Mobile Navigation（专注模式下隐藏） */}
          <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-1 pb-safe md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] h-16 ${focusMode ? 'hidden' : 'flex'}`}>
            <MobileNavButton active={view === 'dashboard'} onClick={() => setView('dashboard')}>
              <IconHome />
              <span>首页</span>
            </MobileNavButton>
            <MobileNavButton active={view === 'study'} onClick={startStudy}>
              <IconBook />
              <span>学习</span>
            </MobileNavButton>
            <MobileNavButton active={view === 'units'} onClick={() => setView('units')}>
              <IconGrid />
              <span>闯关</span>
            </MobileNavButton>
            <MobileNavButton active={view === 'achievements'} onClick={() => setView('achievements')}>
              <IconTrophy />
              <span>勋章</span>
            </MobileNavButton>
          </nav>
        </div>
      </div>

      {/* 移动端边缘滑动返回提示 */}
      <EdgeSwipeIndicator enabled={view !== 'dashboard'} />
    </ErrorBoundary>
  );
}

function NavButton({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {icon}
      <span className="font-medium whitespace-nowrap">{label}</span>
    </button>
  );
}

function MobileNavButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center p-1 rounded-lg transition-colors duration-200 ${
        active ? 'text-indigo-600' : 'text-slate-400 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}
