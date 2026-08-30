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
  /** 今日已复习数 */
  todayReviewed: number;
  /** 今日新学词数 */
  todayNewLearned: number;
  onStartBatch: () => void;
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

/** 开始前的引导文案 */
const START_COPY = [
  '今天有 {n} 个词在等你翻牌',
  '{n} 个词排着队要复习，来吧',
  '大脑今天的保养额度：{n} 个词',
  '有 {n} 个词需要巩固，开始吧',
  '{n} 个词待复习，挑战一下',
];

/** 「开始学习」按钮 - 首次学新词（温和 + 酷炫合并） */
const NEW_START_COPY = [
  // 温和风
  '今天还没学新词，开始就对了',
  '新词正在排队，开始吧',
  '新词海等你启航',
  '学新词就像呼吸，越多越自然',
  // 酷炫风
  '火力未启 · 你的神经突触正在待命 ⚡',
  '新词列队候场 · 按下开始就能开火 🔥',
  '空白卷子已铺开 · 等你落下第一笔 ✍️',
  '词典在喊你 · 第一发新词请求出战 🎯',
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
  todayReviewed,
  todayNewLearned,
  onStartBatch,
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
  // 稳定文案 seed：基于日期，同一天内文案不变
  const copySeed = useMemo(() => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }, []);

  // ---- 「立即学习」按钮文案：描述本批会学到的内容 ----
  const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  // 到期优先，不足补新词；文案随今日是否已学习浮动
  const partCopy = (() => {
    if (dueCount === 0 && newWordCount === 0) {
      return pickRandom(['所有词都已经吃透啦', '当前学段全部拿下']);
    }
    if (dueCount > 0 && newWordCount > 0) {
      return `${dueCount} 个待复习 · ${newWordCount} 个新词，自动混合安排`;
    }
    if (dueCount > 0) {
      return START_COPY[copySeed % START_COPY.length].replace('{n}', String(dueCount));
    }
    return pickRandom(NEW_START_COPY);
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
          {/* 已掌握按钮 - 饼图版 */}
          <button
            onClick={onViewLearned}
            className="w-full rounded-2xl p-5 text-left transition-all duration-200 border bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-3">
              {/* 饼图 */}
              <div className="relative w-16 h-16 shrink-0">
                <svg width="64" height="64" viewBox="0 0 36 36" className="-rotate-90">
                  <circle
                    cx="18" cy="18" r="15.9155"
                    fill="none"
                    stroke="#a7f3d0"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="18" cy="18" r="15.9155"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.5"
                    strokeDasharray={`${progress} 100`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-700">{progress}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-emerald-600">已掌握</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-bold text-slate-800">{learned}</span>
                  <span className="text-sm text-slate-400">/ {total}</span>
                </div>
                <p className="text-xs mt-1.5 text-emerald-500">查看全部 →</p>
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

          {/* 立即学习 - 单一入口（到期优先 + 新词） */}
          <button
            onClick={onStartBatch}
            disabled={dueCount === 0 && newWordCount === 0}
            className={`w-full rounded-2xl p-5 text-left transition-all duration-200 border ${
              dueCount + newWordCount > 0
                ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:shadow-md hover:-translate-y-0.5'
                : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-xs uppercase tracking-wider font-semibold ${dueCount + newWordCount > 0 ? 'text-indigo-700' : 'text-slate-400'}`}>
                  立即学习
                </p>
                <p className={`text-2xl font-bold mt-1 ${dueCount + newWordCount > 0 ? 'text-indigo-900' : 'text-slate-400'}`}>
                  {dueCount + newWordCount > 0 ? `${dueCount + newWordCount} 个单词` : '暂时没有可学的'}
                </p>
                <p className={`text-sm mt-1.5 leading-snug font-medium ${dueCount + newWordCount > 0 ? 'text-indigo-700' : 'text-slate-400'}`}>
                  {partCopy}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ml-3 ${
                dueCount + newWordCount > 0 ? 'bg-indigo-200' : 'bg-slate-200'
              }`}>
                <IconBook className={`w-6 h-6 ${dueCount + newWordCount > 0 ? 'text-indigo-700' : 'text-slate-400'}`} />
              </div>
            </div>
            {/* 底部：今日进度（巩固 + 新学激励数据） */}
            {(todayReviewed > 0 || todayNewLearned > 0) && dueCount + newWordCount > 0 && (
              <div className="mt-3 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {todayReviewed > 0 && (
                    <span className="text-indigo-700">
                      今日巩固 <span className="font-bold text-indigo-900">{todayReviewed}</span> 词
                    </span>
                  )}
                  {todayNewLearned > 0 && (
                    <span className="text-indigo-700">
                      今日新学 <span className="font-bold text-indigo-900">{todayNewLearned}</span> 词
                    </span>
                  )}
                </div>
                <span className="text-indigo-600 font-semibold">开始 →</span>
              </div>
            )}
          </button>

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
