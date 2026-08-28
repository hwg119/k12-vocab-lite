import React, { useState, useRef } from 'react';
import { Stage } from '../types';
import { exportBundle, importBundle, downloadBundle, readBundleFromFile } from '../utils';
import { IconArrowLeft } from './Icons';

interface SettingsViewProps {
  stage: Stage;
  onGoHome: () => void;
  onAfterImport: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  stage,
  onGoHome,
  onAfterImport,
}) => {
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    const bundle = exportBundle();
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
        <h3 className="text-lg font-bold text-slate-800 mb-2">🎓 当前学段</h3>
        <p className="text-sm text-slate-600">
          当前选中学段：<span className="font-bold text-indigo-600">{stage}</span>
        </p>
        <p className="text-xs text-slate-400 mt-2">
          切换学段使用页面顶部的下拉切换器。每个学段数据完全独立。
        </p>
      </div>

      <div className="text-xs text-slate-400 text-center mt-6">
        所有数据本地存储（浏览器 LocalStorage），不上传任何服务器。
      </div>
    </div>
  );
};
