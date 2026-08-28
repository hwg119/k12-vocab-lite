import React, { useState } from 'react';
import { Stage } from '../types';
import { STAGE_META, STAGE_ORDER } from '../data';

interface StageSwitcherProps {
  current: Stage;
  onChange: (s: Stage) => void;
  /** 各学段已掌握词数（用于选项上角标） */
  counts?: Partial<Record<Stage, number>>;
}

/**
 * 学段切换器 - 简洁下拉式
 * 防沉迷：仅三档，不引入多余选项
 */
export const StageSwitcher: React.FC<StageSwitcherProps> = ({ current, onChange, counts }) => {
  const [open, setOpen] = useState(false);
  const meta = STAGE_META[current];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={`inline-block w-2 h-2 rounded-full bg-${meta.color}-500`}></span>
        <span>{meta.title}</span>
        <span className="text-slate-400 text-xs">▾</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          ></div>
          <ul
            role="listbox"
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden animate-fade-in"
          >
            {STAGE_ORDER.map(stageId => {
              const m = STAGE_META[stageId];
              const isCurrent = stageId === current;
              const cnt = counts?.[stageId] ?? 0;
              return (
                <li key={stageId}>
                  <button
                    role="option"
                    aria-selected={isCurrent}
                    onClick={() => {
                      onChange(stageId);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isCurrent ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full bg-${m.color}-500`}></span>
                    <span className="flex-1">
                      <span className="font-medium block">{m.title}</span>
                      <span className="text-xs text-slate-400">{m.subtitle}</span>
                    </span>
                    {cnt > 0 && (
                      <span className="text-xs text-slate-400 font-mono">{cnt}</span>
                    )}
                    {isCurrent && <span className="text-xs text-indigo-600">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};
