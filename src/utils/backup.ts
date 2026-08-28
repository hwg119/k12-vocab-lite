import { BackupBundle, Stage, SrsState } from '../types';
import { StorageKeys } from '../types';
import { STAGE_ORDER } from '../data';

/**
 * 数据备份 - 序列化/反序列化全学段学习状态
 *
 * 设计：
 *   - 版本号写入 bundle.version（目前 v1）
 *   - 用户选择导出时 → 收集全学段数据 → JSON.stringify → Blob → 下载
 *   - 用户选择导入时 → FileReader → JSON.parse → 校验 schema → 写回 localStorage → reload
 *
 * 注意：备份**不会**包含词库本身（词库已在打包中），只备份用户学习数据。
 */

const VERSION = 1;

interface RawStageBucket {
  learnedIds: string[];
  mistakeIds: string[];
  srs: Record<string, SrsState>;
}

function readBucket(stage: Stage): RawStageBucket {
  const li = window.localStorage.getItem(StorageKeys.learnedIds(stage));
  const mi = window.localStorage.getItem(StorageKeys.mistakes(stage));
  const sm = window.localStorage.getItem(StorageKeys.srs(stage));

  return {
    learnedIds: li ? safeJsonArray(li) : [],
    mistakeIds: mi ? safeJsonArray(mi) : [],
    srs: sm ? safeJsonObject(sm) : {},
  };
}

function safeJsonArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function safeJsonObject(raw: string): Record<string, SrsState> {
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' ? (v as Record<string, SrsState>) : {};
  } catch {
    return {};
  }
}

export function exportBundle(): BackupBundle {
  const stages: BackupBundle['stages'] = {};
  for (const s of STAGE_ORDER) {
    const bucket = readBucket(s);
    if (
      bucket.learnedIds.length === 0 &&
      bucket.mistakeIds.length === 0 &&
      Object.keys(bucket.srs).length === 0
    ) {
      continue;
    }
    stages[s] = {
      learnedIds: bucket.learnedIds,
      mistakeIds: bucket.mistakeIds,
      srs: bucket.srs,
      achievements: [],
      units: [],
    };
  }

  const cur = window.localStorage.getItem(StorageKeys.currentStage);
  const currentStage = (cur as Stage) || 'senior';

  return {
    version: VERSION,
    exportedAt: Date.now(),
    currentStage,
    stages,
  };
}

export function importBundle(bundle: BackupBundle): { stagesImported: number } {
  if (bundle.version !== VERSION) {
    throw new Error(`备份版本不匹配（期望 v${VERSION}，实到 v${bundle.version}）`);
  }
  if (!bundle.stages) {
    throw new Error('备份格式无效');
  }

  let count = 0;
  for (const s of STAGE_ORDER) {
    const bucket = bundle.stages[s];
    if (!bucket) continue;

    const li = StorageKeys.learnedIds(s);
    const mi = StorageKeys.mistakes(s);
    const sk = StorageKeys.srs(s);

    window.localStorage.setItem(li, JSON.stringify(bucket.learnedIds ?? []));
    window.localStorage.setItem(mi, JSON.stringify(bucket.mistakeIds ?? []));
    window.localStorage.setItem(sk, JSON.stringify(bucket.srs ?? {}));

    count += 1;
  }

  if (bundle.currentStage) {
    window.localStorage.setItem(StorageKeys.currentStage, bundle.currentStage);
  }

  return { stagesImported: count };
}

export function downloadBundle(bundle: BackupBundle): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const ts = new Date(bundle.exportedAt).toISOString().slice(0, 19).replace(/[:T]/g, '-');
  a.download = `k12-vocab-backup-${ts}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function readBundleFromFile(file: File): Promise<BackupBundle> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = String(reader.result);
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed.version !== VERSION) {
          reject(new Error('文件不是 k12-vocab 备份（版本不匹配）'));
          return;
        }
        resolve(parsed as BackupBundle);
      } catch (e) {
        reject(e as Error);
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}
