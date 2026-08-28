import React from 'react';
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
  mistakeCount: number;
  unitsCompleted: number;
  unitsTotal: number;
  achievementsCount: number;
  streak: number;
  confusionCount: number;
  stage: Stage;
  onStartStudy: () => void;
  onStartQuiz: () => void;
  onViewUnits: () => void;
  onViewMistakes: () => void;
  onViewConfusions: () => void;
  onViewAchievements: () => void;
  onViewList: () => void;
  onViewStats: () => void;
  onViewSettings: () => void;
  onResetProgress: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  words,
  learnedIds,
  dueCount,
  mistakeCount,
  unitsCompleted,
  unitsTotal,
  achievementsCount,
  streak,
  confusionCount,
  stage,
  onStartStudy,
  onStartQuiz,
  onViewUnits,
  onViewMistakes,
  onViewConfusions,
  onViewAchievements,
  onViewList,
  onViewStats,
  onViewSettings,
  onResetProgress,
}) => {
  const total = words.length;
  const learned = learnedIds.size;
  const progress = total > 0 ? Math.round((learned / total) * 100) : 0;
  const meta = STAGE_META[stage];
  const colors = getStageColors(stage);

  // 圆形进度环
  const ringRadius = 36;
  const ringCircum = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircum * (1 - progress / 100);
  const ringColor = `rgb(${colors.ring})`;

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
          {/* 掌握进度 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">已掌握</p>
            <div className="flex items-center gap-5">
              <svg width="92" height="92" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={ringRadius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={ringCircum}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
                <text x="50" y="55" textAnchor="middle" className="text-xl font-bold" fill="#1e293b">
                  {progress}%
                </text>
              </svg>
              <div>
                <div className="text-3xl font-bold text-slate-800">{learned}</div>
                <div className="text-sm text-slate-400">/ {total}</div>
              </div>
            </div>
          </div>

          {/* 今日待复习 */}
          <button
            onClick={onStartStudy}
            disabled={dueCount === 0}
            className={`w-full rounded-2xl p-5 text-left transition-all duration-200 border ${
              dueCount > 0
                ? `bg-${colorClass}-50 border-${colorClass}-200 hover:shadow-md hover:-translate-y-0.5`
                : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs uppercase tracking-wider ${dueCount > 0 ? `text-${colorClass}-600` : 'text-slate-400'}`}>
                  今日待复习
                </p>
                <p className={`text-3xl font-bold mt-1 ${dueCount > 0 ? `text-${colorClass}-700` : 'text-slate-400'}`}>
                  {dueCount}
                </p>
                <p className={`text-xs mt-1 ${dueCount > 0 ? `text-${colorClass}-500` : 'text-slate-400'}`}>
                  {dueCount > 0 ? '点击开始复习' : '暂无到期词'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                dueCount > 0 ? `bg-${colorClass}-200` : 'bg-slate-200'
              }`}>
                <IconBook className={`w-6 h-6 ${dueCount > 0 ? `text-${colorClass}-700` : 'text-slate-400'}`} />
              </div>
            </div>
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
