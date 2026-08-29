import React, { useMemo } from 'react';
import { Word, Stage } from '../../types';
import { STAGE_META } from '../../data';
import { getStageColors } from '../../utils/colors';
import {
  IconBook,
  IconCheck,
  IconTrophy,
  IconList,
  IconTrash,
  IconAlertCircle,
  IconGrid,
  IconChart,
  IconQuestion,
} from '../Icons';

interface DashboardProps {
  words: Word[];
  learnedIds: Set<string>;
  dueCount: number;
  /** 从未学过的词数（用于「开始学习」按钮） */
  newWordCount: number;
  mistakeCount: number;
  unitsCompleted: number;
  unitsTotal: number;
  achievementsCount: number;
  streak: number;
  confusionCount: number;
  stage: Stage;
  /** 今日初始待复习数（每天首次打开时快照） */
  todayInitialDue: number;
  /** 今日已复习数 */
  todayReviewed: number;
  /** 今日是否有学习活动 */
  todayHasActivity: boolean;
  onStartStudy: () => void;
  /** 仅学新词（从未学过的） */
  onStartNewWord: () => void;
  onStartQuiz: () => void;
  onViewUnits: () => void;
  onViewMistakes: () => void;
  onViewConfusions: () => void;
  onViewAchievements: () => void;
  onViewList: () => void;
  onViewLearned: () => void;
  onViewStats: () => void;
  onViewSettings: () => void;
  onResetProgress: () => void;
}

// ---- 今日复习文案引擎 ----

/** 从数组中根据 seed 取一个稳定的文案（同一页面不闪烁） */
const pick = (arr: string[], seed: number) => arr[seed % arr.length];

/** 开始前的引导文案 */
const START_COPY = [
  '今天有 {n} 个词在等你翻牌',
  '{n} 个词排着队要复习，来吧',
  '大脑今天的保养额度：{n} 个词',
  '有 {n} 个词需要巩固，开始吧',
  '{n} 个词待复习，挑战一下',
];

/** 进行中的鼓励文案 */
const PROGRESS_COPY = [
  '已完成 {done}/{total}，你的大脑正在升级',
  '{done}/{total} 已拿下，继续冲',
  '词汇量 +{done}，大脑没生锈',
  '过半了！{done}/{total}，稳',
  '{done}/{total}，进度条在涨',
];

/** 收尾冲刺文案 */
const FINISHING_COPY = [
  '就差 {left} 个了，别松劲',
  '{left} 个词：胜利就在眼前',
  '最后 {left} 个，冲刺！',
  '{left} 个，马上搞定！',
  '收尾 {left} 个，一口气端了它们',
];

/** 完成后的庆祝文案（酷炫风） */
const DONE_COPY = [
  '今日保底已达成，大脑未生锈！',
  '全部搞定！你的词汇量又涨了',
  '今日复习完成，记忆已加固',
  '搞定！今天的你比昨天更强',
  '复习完毕，大脑已充能',
  '全部通关！去干点别的吧',
  '今天的记忆维护已完成，大脑在线',
  '搞定，大脑今日份的营养已摄入',
];

/** 无任务时的文案 */
const NO_TASK_COPY = [
  '今天没有到期词，去学点新的吧',
  '暂无复习任务，词库很安全',
  '没有待复习的词，可以放松一下',
];

export const Dashboard: React.FC<DashboardProps> = ({
  words,
  learnedIds,
  dueCount,
  newWordCount,
  mistakeCount,
  unitsCompleted,
  unitsTotal,
  achievementsCount,
  streak,
  confusionCount,
  stage,
  todayInitialDue,
  todayReviewed,
  todayHasActivity,
  onStartStudy,
  onStartNewWord,
  onStartQuiz,
  onViewUnits,
  onViewMistakes,
  onViewConfusions,
  onViewAchievements,
  onViewList,
  onViewLearned,
  onViewStats,
  onViewSettings,
  onResetProgress,
}) => {
  const total = words.length;
  const learned = learnedIds.size;
  const progress = total > 0 ? Math.round((learned / total) * 100) : 0;
  const meta = STAGE_META[stage];
  const colors = getStageColors(stage);

  // ---- 今日复习卡片状态计算 ----
  const todayDone = todayInitialDue > 0;
  const reviewDone = todayDone && dueCount === 0 && todayHasActivity;
  const reviewProgress = todayInitialDue > 0
    ? Math.min(1, todayReviewed / todayInitialDue)
    : 0;
  const remainingLeft = dueCount;

  // 稳定文案 seed：基于日期，同一天内文案不变
  const copySeed = useMemo(() => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }, []);

  // 根据状态选文案
  const reviewCopy = (() => {
    if (dueCount === 0 && !todayHasActivity) {
      return pick(NO_TASK_COPY, copySeed);
    }
    if (reviewDone) {
      return pick(DONE_COPY, copySeed + 1);
    }
    // dueCount=0 但 todayInitialDue=0（今天没待复习的词，但做了其他练习）也视为完成
    if (dueCount === 0 && todayHasActivity) {
      return pick(DONE_COPY, copySeed + 5);
    }
    if (todayReviewed > 0 && reviewProgress >= 0.8) {
      return pick(FINISHING_COPY, copySeed + 2)
        .replace('{left}', String(remainingLeft));
    }
    if (todayReviewed > 0) {
      return pick(PROGRESS_COPY, copySeed + 3)
        .replace('{done}', String(todayReviewed))
        .replace('{total}', String(todayInitialDue));
    }
    return pick(START_COPY, copySeed + 4)
      .replace('{n}', String(dueCount));
  })();

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* 学段标题条 */}
      <div className={`bg-gradient-to-br ${colors.gradient} rounded-2xl p-5 text-white shadow-lg mb-6`}>
        <p className={`${colors.text} text-xs uppercase tracking-wider`}>{meta.subtitle}</p>
        <div className="flex items-baseline justify-between mt-1">
          <h2 className="text-2xl font-bold">{meta.title}英语词汇</h2>
          <span className={`${colors.text} text-sm`}>共 {total} 词</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 已掌握按钮 */}
          <button
            onClick={onViewLearned}
            className="w-full rounded-2xl p-5 text-left transition-all duration-200 border bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-emerald-600">已掌握</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-slate-800">{learned}</span>
                  <span className="text-sm text-slate-400">/ {total}</span>
                  <span className="text-sm font-bold text-emerald-600 ml-1">{progress}%</span>
                </div>
                <p className="text-xs mt-1.5 text-emerald-500">查看全部 →</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center shrink-0 ml-3">
                <IconCheck className="w-6 h-6 text-emerald-700" />
              </div>
            </div>
            {/* 今日已学习数 */}
            {todayReviewed > 0 && (
              <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between">
                <span className="text-xs text-emerald-600">今日已学</span>
                <span className="text-sm font-bold text-emerald-700">{todayReviewed} 词</span>
              </div>
            )}
          </button>

          {/* 开始学习 - 学新词 */}
          <button
            onClick={onStartNewWord}
            disabled={newWordCount === 0}
            className={`w-full rounded-2xl p-5 text-left transition-all duration-200 border ${
              newWordCount > 0
                ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:shadow-md hover:-translate-y-0.5'
                : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-xs uppercase tracking-wider ${newWordCount > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                  开始学习
                </p>
                <p className={`text-2xl font-bold mt-1 ${newWordCount > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
                  {newWordCount > 0 ? `${newWordCount} 个新词` : '已学完全部'}
                </p>
                <p className={`text-xs mt-1.5 ${newWordCount > 0 ? 'text-indigo-500' : 'text-slate-400'}`}>
                  {newWordCount > 0 ? '学点新词 →' : '恭喜通关'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ml-3 ${
                newWordCount > 0 ? 'bg-indigo-200' : 'bg-slate-200'
              }`}>
                <IconBook className={`w-6 h-6 ${newWordCount > 0 ? 'text-indigo-700' : 'text-slate-400'}`} />
              </div>
            </div>
          </button>

          {/* 今日复习 - SRS 复习进度（仅 todayInitialDue > 0 时显示） */}
          {todayInitialDue > 0 && (
          <button
            onClick={onStartStudy}
            disabled={reviewDone}
            className={`w-full rounded-2xl p-5 text-left transition-all duration-200 border overflow-hidden relative ${
              reviewDone
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:shadow-md'
                : dueCount > 0
                ? `bg-amber-50 ${colors.border} hover:shadow-md hover:-translate-y-0.5`
                : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
            }`}
          >
            {/* 完成态庆祝动画 */}
            {reviewDone && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="celebrate-particle absolute top-2 left-[15%] text-lg" style={{ animationDelay: '0s' }}>✨</div>
                <div className="celebrate-particle absolute top-1 left-[55%] text-base" style={{ animationDelay: '0.3s' }}>🎉</div>
                <div className="celebrate-particle absolute top-3 right-[20%] text-sm" style={{ animationDelay: '0.6s' }}>⭐</div>
                <div className="celebrate-particle absolute bottom-2 left-[35%] text-xs" style={{ animationDelay: '0.9s' }}>🌟</div>
              </div>
            )}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1 min-w-0">
                <p className={`text-xs uppercase tracking-wider ${
                  reviewDone ? 'text-emerald-600' : dueCount > 0 ? colors.textMuted : 'text-slate-400'
                }`}>
                  {reviewDone ? '今日复习' : '今日待复习'}
                </p>
                {/* 数字行：已复习 / 待复习 */}
                <div className={`text-2xl font-bold mt-1 ${
                  reviewDone ? 'text-emerald-700' : dueCount > 0 ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {todayInitialDue > 0 ? (
                    <>
                      <span className={reviewDone ? 'text-emerald-600' : 'text-emerald-600'}>{todayReviewed}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span>{todayInitialDue}</span>
                    </>
                  ) : (
                    <span>{dueCount}</span>
                  )}
                </div>
                {/* 进度条 */}
                {todayReviewed > 0 && !reviewDone && (
                  <div className="mt-2 mb-1">
                    <div className="w-full bg-white/60 rounded-full h-1.5">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${Math.round(reviewProgress * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {/* 动态文案 */}
                <p className={`text-xs mt-1.5 leading-snug ${
                  reviewDone ? 'text-emerald-600 font-medium' : dueCount > 0 ? 'text-amber-500' : 'text-slate-400'
                }`}>
                  {reviewCopy}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ml-3 ${
                reviewDone ? 'bg-emerald-200' : dueCount > 0 ? 'bg-amber-200' : 'bg-slate-200'
              }`}>
                {reviewDone ? (
                  <IconCheck className="w-6 h-6 text-emerald-700" />
                ) : (
                  <IconBook className={`w-6 h-6 ${dueCount > 0 ? 'text-amber-700' : 'text-slate-400'}`} />
                )}
              </div>
            </div>
          </button>
          )}

          {/* 连续打卡 */}
          {streak > 0 && (
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-4 border border-rose-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-500 uppercase tracking-wider">Streak</p>
                <p className="text-2xl font-bold text-rose-700 mt-0.5">🔥 {streak} 天</p>
              </div>
              <p className="text-xs text-rose-400">保持节奏</p>
            </div>
          )}
        </div>

        {/* 右侧 - 功能网格 */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard color="emerald" icon={<IconCheck />} title="每日测验" subtitle="随机 20 题" onClick={onStartQuiz} />
            <ActionCard color={unitsTotal > 0 && unitsCompleted === unitsTotal ? 'amber' : 'indigo'}
              icon={<IconGrid />} title="闯关模式" subtitle={`${unitsCompleted}/${unitsTotal} 单元`} onClick={onViewUnits} />
            <ActionCard color={mistakeCount > 0 ? 'rose' : 'slate'} icon={<IconAlertCircle />}
              title="易错生词本" subtitle={mistakeCount > 0 ? `已收录 ${mistakeCount} 个` : '保持良好'} onClick={onViewMistakes} />
            <ActionCard color={confusionCount > 0 ? 'amber' : 'slate'} icon={<IconQuestion />}
              title="易混词对比" subtitle={confusionCount > 0 ? `${confusionCount} 组配对` : '暂无配对'} onClick={onViewConfusions} />
            <ActionCard color="yellow" icon={<IconTrophy />}
              title="我的勋章" subtitle={`已解锁 ${achievementsCount}/7`} onClick={onViewAchievements} />
            <ActionCard color="indigo" icon={<IconChart />} title="数据周报"
              subtitle="近 7 日学习统计" onClick={onViewStats} />
            <ActionCard color="blue" icon={<IconList />} title="完整词典"
              subtitle={`浏览全部 ${total} 词`} onClick={onViewList} />
            <ActionCard color="slate" icon={<IconTrophy />} title="备份与设置"
              subtitle="数据导入/导出" onClick={onViewSettings} />
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={onResetProgress}
              className="text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <IconTrash className="w-4 h-4" />
              重置本学段进度
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActionCardProps {
  color: 'emerald' | 'rose' | 'amber' | 'blue' | 'indigo' | 'slate' | 'yellow';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

const COLOR_MAP: Record<ActionCardProps['color'], { tint: string; text: string }> = {
  emerald: { tint: 'bg-emerald-100 text-emerald-600',         text: 'group-hover:text-emerald-700' },
  rose:    { tint: 'bg-rose-100 text-rose-600',               text: 'group-hover:text-rose-700' },
  amber:   { tint: 'bg-amber-100 text-amber-600',             text: 'group-hover:text-amber-700' },
  blue:    { tint: 'bg-blue-100 text-blue-600',               text: 'group-hover:text-blue-700' },
  indigo:  { tint: 'bg-indigo-100 text-indigo-600',           text: 'group-hover:text-indigo-700' },
  yellow:  { tint: 'bg-yellow-100 text-yellow-600',           text: 'group-hover:text-yellow-700' },
  slate:   { tint: 'bg-slate-100 text-slate-500',             text: 'group-hover:text-slate-700' },
};

function ActionCard({ color, icon, title, subtitle, onClick }: ActionCardProps) {
  const tints = COLOR_MAP[color];
  return (
    <button
      onClick={onClick}
      className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-left flex items-center gap-4"
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ${tints.tint}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
    </button>
  );
}
