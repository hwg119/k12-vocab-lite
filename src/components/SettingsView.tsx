import React, { useState, useRef } from 'react';
import { Stage } from '../types';
import { exportBundle, importBundle, downloadBundle, readBundleFromFile } from '../utils';
import { APP_VERSION, LATEST_VERSION, PLATFORM, isUpToDate } from '../version';
import { IconArrowLeft } from './Icons';

interface SettingsViewProps {
  stage: Stage;
  onGoHome: () => void;
  onAfterImport: () => void;
  quizFeedbackDelayMs: number;
  setQuizFeedbackDelayMs: (ms: number) => void;
}

const FEEDBACK_OPTIONS: { value: number; label: string; desc: string }[] = [
  { value: 0, label: '立即', desc: '答完直接切下一题（最快）' },
  { value: 500, label: '0.5 秒', desc: '快速节奏' },
  { value: 1000, label: '1.0 秒', desc: '推荐（默认）' },
  { value: 1500, label: '1.5 秒', desc: '可看清对错与正解' },
  { value: 2500, label: '2.5 秒', desc: '从容校对' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  stage,
  onGoHome,
  onAfterImport,
  quizFeedbackDelayMs,
  setQuizFeedbackDelayMs,
}) => {
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    const bundle = exportBundle();
    if (PLATFORM === 'android') {
      // Android：用 data: URL 触发，由原生接收写入公共 Download 目录（卸载后仍保留，可换机/重装导入）
      const json = JSON.stringify(bundle, null, 2);
      const utf8 = unescape(encodeURIComponent(json));
      const b64 = btoa(utf8);
      const ts = new Date(bundle.exportedAt).toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const a = document.createElement('a');
      a.href = `data:application/json;base64,${b64}`;
      a.download = `k12-vocab-backup-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        setStatus(`已导出全部学段数据，请到手机 文件管理器 › Download 目录查看（K12 可离线备份，卸载/换机后导入即可恢复）`);
      }, 800);
      return;
    }
    downloadBundle(bundle);
    setStatus(`已导出 ${Object.keys(bundle.stages).length} 个学段的数据`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const bundle = await readBundleFromFile(f);
      const { stagesImported } = importBundle(bundle);
      setStatus(`已恢复 ${stagesImported} 个学段的数据，刷新页面后生效`);
      // 给用户 1.5s 看到状态，再 reload
      setTimeout(() => {
        onAfterImport();
        window.location.reload();
      }, 1500);
    } catch (err) {
      setStatus(`导入失败：${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      // 清空 input 以便下次再选同一文件
      e.target.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in px-2">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onGoHome}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          回首页
        </button>
        <h2 className="text-xl font-bold text-slate-800">设置</h2>
        <div className="w-16"></div>
      </div>

      {/* 数据备份 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-1">📦 数据备份 / 还原</h3>
        <p className="text-sm text-slate-500 mb-4">
          导出当前全部学段的学习进度到 JSON 文件；导入可换设备恢复学习数据。
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            📤 导出全部学段
          </button>
          <button
            onClick={handleImportClick}
            className="px-5 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            📥 导入备份
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {status && (
          <p className="mt-3 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
            {status}
          </p>
        )}
      </div>

      {/* 学段说明 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-1">⏱ 答题反馈时长</h3>
        <p className="text-sm text-slate-500 mb-4">
          测验答题后展示"对/错"反馈的停留时间。<br />
          冲刺模式（60s）下，反馈期内会<span className="font-semibold text-indigo-600">冻结倒计时</span>，不会浪费答题时间。
        </p>

        <div className="grid grid-cols-5 gap-2 mb-3">
          {FEEDBACK_OPTIONS.map(opt => {
            const active = quizFeedbackDelayMs === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setQuizFeedbackDelayMs(opt.value)}
                className={[
                  'py-2 rounded-lg text-sm font-medium border transition-colors',
                  active
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600',
                ].join(' ')}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400">
          当前：<span className="font-mono text-slate-700">{quizFeedbackDelayMs} ms</span>
          {' · '}
          {FEEDBACK_OPTIONS.find(o => o.value === quizFeedbackDelayMs)?.desc ?? '自定义'}
        </p>
      </div>

      {/* 学段说明 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">🎓 当前学段</h3>
        <p className="text-sm text-slate-600">
          当前选中学段：<span className="font-bold text-indigo-600">{stage}</span>
        </p>
        <p className="text-xs text-slate-400 mt-2">
          切换学段使用页面顶部的下拉切换器。每个学段数据完全独立。
        </p>
      </div>

      {/* 版本信息 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-3">📱 版本信息</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-slate-500">当前版本</span>
          <span className="font-mono font-bold text-slate-800">{APP_VERSION}</span>

          <span className="text-slate-500">最新版本</span>
          <span className="font-mono font-bold text-slate-800">{LATEST_VERSION}</span>

          <span className="text-slate-500">运行平台</span>
          <span className="font-mono text-slate-800">
            {PLATFORM === 'android' ? '🤖 Android' : '🌐 Web'}
          </span>

          <span className="text-slate-500">更新状态</span>
          <span>
            {isUpToDate() ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                ✅ 已是最新
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium">
                ⚠️ 有新版本
              </span>
            )}
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {PLATFORM === 'android'
            ? '请前往 GitHub Releases 下载最新 APK 后覆盖安装；或自行重新 build 后部署。'
            : 'Web 端：刷新页面即可拉到最新版本（PWA 自动更新）。'}
        </p>
      </div>

      <div className="text-xs text-slate-400 text-center mt-6">
        所有数据本地存储（浏览器 LocalStorage），不上传任何服务器。
      </div>
    </div>
  );
};
