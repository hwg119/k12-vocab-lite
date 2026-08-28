import { useState, useEffect, useCallback, useMemo } from 'react';
import { Word, AppView } from './types';
import { STAGE_META } from './data';
import {
  generateQuiz,
  sample,
  selectDueWords,
  pickMistakes,
  buildDailySummaries,
  groupConfusionPairs,
} from './utils';
import { useStage } from './hooks';
import {
  Dashboard,
  StudyMode,
  QuizMode,
  QuizEntry,
  WordList,
  MistakesView,
  StageSwitcher,
  UnitsView,
  AchievementsView,
  StatsView,
  ConfusionView,
  SettingsView,
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
    submitFeedback,
    recordQuizAnswer,
    resetProgress,
    focusMode,
    setFocusMode,
  } = useStage();

  // 近 7 日学习摘要（用于周报柱状图）
  const recentDays = useMemo(() => buildDailySummaries(studyDays, 7), [studyDays]);
  // 当前学段易混词配对数量
  const confusionCount = useMemo(() => groupConfusionPairs(words).length, [words]);

  const [view, setView] = useState<AppView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [studyQueue, setStudyQueue] = useState<Word[]>([]);
  const [studySource, setStudySource] = useState<'default' | 'review' | 'mistakes' | 'unit'>('default');
  const [quizQuestions, setQuizQuestions] = useState<ReturnType<typeof generateQuiz>>([]);
  const [quizMode, setQuizMode] = useState<'daily' | 'sprint'>('daily');

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

  // 启动学习模式 - SRS 优先
  const startStudy = useCallback(() => {
    const priority = selectDueWords(words, srsMap, sessionSize);
    const pool = priority.length > 0 ? priority : words.map(w => w.id);
    const session = sample(words.filter(w => pool.includes(w.id)), sessionSize);
    setStudyQueue(session);
    setStudySource('review');
    setView('study');
  }, [words, srsMap]);

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
    setView('quiz');
  }, [words]);

  // 启动冲刺模式
  const startQuizSprint = useCallback(() => {
    setQuizQuestions(generateQuiz(words, 20));
    setQuizMode('sprint');
    setView('quiz');
  }, [words]);

  // 测验重玩
  const restartQuiz = useCallback(() => {
    if (quizMode === 'sprint') startQuizSprint();
    else startQuizDaily();
  }, [quizMode, startQuizDaily, startQuizSprint]);

  // 切到下一个 view 时清残留队列
  useEffect(() => {
    if (view !== 'study') setStudyQueue([]);
    if (view !== 'quiz') setQuizQuestions([]);
  }, [view]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen(p => !p), []);

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
          <header className={`bg-white shadow-sm shrink-0 z-30 relative pt-safe ${focusMode ? 'opacity-30 hover:opacity-100 transition-opacity' : ''}`}>
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
                <h1 className="md:hidden text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className={`${stageBadgeColors[stage]} text-white rounded-lg p-1 text-sm sm:text-base`}>VM</span>
                  Vocab Master
                </h1>
              </div>

              <div className="md:hidden">
                <StageSwitcher current={stage} onChange={setStage} />
              </div>

              <div className="flex items-center gap-2">
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
                {view !== 'dashboard' && (
                  <button
                    onClick={() => setView('dashboard')}
                    className="text-sm text-slate-500 hover:text-indigo-600 transition-colors font-medium px-3 py-1.5 rounded-md hover:bg-slate-100"
                  >
                    回首页
                  </button>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 relative w-full overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
            <div className="max-w-6xl mx-auto min-h-full flex flex-col justify-center box-border p-3 sm:p-4 lg:p-6">
              {view === 'dashboard' && (
                <Dashboard
                  words={words}
                  learnedIds={learnedIds}
                  dueCount={summary.dueCount}
                  mistakeCount={mistakeIds.length}
                  unitsCompleted={summary.unitsCompleted}
                  unitsTotal={summary.unitsTotal}
                  achievementsCount={achievements.length}
                  streak={streak.current}
                  confusionCount={confusionCount}
                  stage={stage}
                  onStartStudy={startStudy}
                  onStartQuiz={openQuizEntry}
                  onViewUnits={() => setView('units')}
                  onViewMistakes={() => setView('mistakes')}
                  onViewConfusions={() => setView('confusions')}
                  onViewAchievements={() => setView('achievements')}
                  onViewList={() => setView('list')}
                  onViewStats={() => setView('stats')}
                  onViewSettings={() => setView('settings')}
                  onResetProgress={handleReset}
                />
              )}

              {view === 'study' && studyQueue.length > 0 && (
                <StudyMode
                  studyQueue={studyQueue}
                  learnedIds={learnedIds}
                  source={studySource}
                  onSubmit={(id, fb) => submitFeedback(id, fb)}
                  onGoHome={() => setView('dashboard')}
                />
              )}

              {view === 'quizEntry' && (
                <QuizEntry
                  onGoHome={() => setView('dashboard')}
                  onStartDaily={startQuizDaily}
                  onStartSprint={startQuizSprint}
                />
              )}

              {view === 'quiz' && quizQuestions.length > 0 && (
                <QuizMode
                  questions={quizQuestions}
                  onGoHome={() => setView('dashboard')}
                  onRestart={restartQuiz}
                  onAnswer={(correct) => recordQuizAnswer(correct)}
                  mode={quizMode}
                />
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
                  title="词典"
                  showMarkButton={true}
                />
              )}

              {view === 'learned' && (
                <WordList
                  words={words.filter(w => learnedIds.has(w.id))}
                  learnedIds={learnedIds}
                  onMarkAsLearned={markLearned}
                  title="已掌握"
                  showMarkButton={false}
                />
              )}

              {view === 'mistakes' && (
                <MistakesView
                  words={words}
                  mistakeIds={mistakeIds}
                  srsMap={srsMap}
                  onGoHome={() => setView('dashboard')}
                  onStartReview={startMistakesReview}
                />
              )}

              {view === 'confusions' && (
                <ConfusionView
                  words={words}
                  onGoHome={() => setView('dashboard')}
                  onStartPair={(queue) => {
                    setStudyQueue(queue);
                    setStudySource('unit');
                    setView('study');
                  }}
                />
              )}

              {view === 'settings' && (
                <SettingsView
                  stage={stage}
                  onGoHome={() => setView('dashboard')}
                  onAfterImport={() => setView('dashboard')}
                />
              )}
            </div>
          </main>

          {/* Mobile Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-1 pb-safe md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] h-16">
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
