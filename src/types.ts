/**
 * 全局类型定义
 *
 * 设计原则：
 * 1. 向后兼容：所有字段可选，老数据无字段时优雅降级
 * 2. 学段隔离：每个 Word 携带 stage 标签
 * 3. SRS 字段：与 SM2 算法协同
 */

/** 学段标签：覆盖小学/初中/高中 K12 全学段 */
export type Stage = 'primary' | 'junior' | 'senior';

/** 难度分级：1(易) → 5(难)，用于闯关/排序 */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

/** 学习模式反馈信号 - SM2 算法三档映射 */
export type ReviewFeedback = 'know' | 'vague' | 'unknown';

/**
 * 单词核心数据
 * 原有字段：id / english / phonetic / chinese
 * 新增字段（全部可选，向后兼容）：
 *   - stage / difficulty 用于学段切换与闯关排序
 *   - mnemonic / exampleSentence 用于趣味助记与场景化例句
 *   - confusionGroupId 用于易混词配对
 */
export interface Word {
  id: string;
  english: string;
  phonetic: string;
  chinese: string;
  /** 学段，缺省按 senior 处理以保证向后兼容 */
  stage?: Stage;
  /** 难度等级 1-5 */
  difficulty?: Difficulty;
  /** 趣味助记（词根/谐音/联想） */
  mnemonic?: string;
  /** 校园/考试场景化例句 */
  exampleSentence?: string;
  /** 易混词组 ID，用于配对展示 */
  confusionGroupId?: string;
}

/** 应用视图枚举 - 在原有四视图基础上扩展 */
export type AppView =
  | 'dashboard'
  | 'study'
  | 'quiz'
  | 'quizEntry'
  | 'list'
  | 'learned'
  | 'mistakes'
  | 'review'
  | 'units'
  | 'achievements'
  | 'stats'
  | 'confusions'
  | 'settings';

export interface QuizQuestion {
  word: Word;
  options: string[];
  correctIndex: number;
}

/**
 * SRS 间隔重复状态 - 基于 SM2 算法
 *
 * 字段语义：
 * - repetitions: 已成功复习次数（连续答对次数，重置失败）
 * - easeFactor: 难度系数 (>= 1.3)，越小越接近遗忘
 * - intervalDays: 当前间隔（天）
 * - dueAt: 下次复习时间戳（毫秒）
 * - lastReviewedAt: 上次复习时间戳
 * - wrongCount: 错误次数（累计）
 */
export interface SrsState {
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  dueAt: number;
  lastReviewedAt: number;
  wrongCount: number;
}

/** 每日学习打卡记录 - 用于续航/连续天数统计 */
export interface StudyDayRecord {
  /** 当天 0 点的时间戳 */
  date: number;
  /** 当天累计学习次数（计入掌握或答题） */
  studyCount: number;
  /** 当天累计答对题数 */
  correctCount: number;
  /** 当天累计答题数 */
  totalCount: number;
}

/** 勋章成就定义 */
export type AchievementId =
  | 'starter'         // 入门萌新（首次学习）
  | 'vocab-100'       // 词汇进阶（掌握 100 词）
  | 'vocab-500'       // 词汇进阶（掌握 500 词）
  | 'frequency'       // 高频突破（掌握高频 500 词）
  | 'completionist'   // 全词掌握（掌握全部）
  | 'streak-7'        // 连续打卡 7 天
  | 'streak-30';      // 连续打卡 30 天

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  /** 解锁时该学段应累计掌握多少词 */
  unlockedAt?: number;
}

/** 闯关单元 */
export interface StudyUnit {
  index: number;
  title: string;
  wordIds: string[];
  unlocked: boolean;
  completed: boolean;
}

/** 数据导出/导入的备份包 */
export interface BackupBundle {
  version: 1;
  exportedAt: number;
  stages: {
    [key in Stage]?: {
      learnedIds: string[];
      mistakeIds: string[];
      srs: Record<string, SrsState>;
      achievements: Achievement[];
      units: StudyUnit[];
    };
  };
  currentStage: Stage;
}

/**
 * 学段隔离的 LocalStorage 键生成器
 * - 拼接学段标签，保证三套数据互不污染
 * - 同一学段所有键共享前缀，方便一次清空
 */
export const StorageKeys = {
  /** 已掌握 ID 集合 */
  learnedIds: (stage: Stage) => `vocab-${stage}-learned`,
  /** SRS 状态映射 wordId -> SrsState */
  srs: (stage: Stage) => `vocab-${stage}-srs`,
  /** 易错词 ID 列表（专项复习） */
  mistakes: (stage: Stage) => `vocab-${stage}-mistakes`,
  /** 勋章成就 */
  achievements: (stage: Stage) => `vocab-${stage}-achievements`,
  /** 闯关单元 */
  units: (stage: Stage) => `vocab-${stage}-units`,
  /** 当前选中学段 */
  currentStage: 'vocab-current-stage',
  /** 每日打卡记录 */
  studyDays: 'vocab-study-days',
  /** 用户偏好（专注模式/速度等） */
  settings: 'vocab-settings',
} as const;

/** 用户偏好设置 */
export interface Settings {
  /** 专注模式（隐藏趣味组件） */
  focusMode: boolean;
  /** 卡片翻转触发延迟（ms） */
  flipDelayMs: number;
  /** 默认每轮学习词数 */
  studySessionSize: number;
  /** 默认测验题数 */
  quizSize: number;
}

export const DEFAULT_SETTINGS: Settings = {
  focusMode: false,
  flipDelayMs: 200,
  studySessionSize: 50,
  quizSize: 20,
};
