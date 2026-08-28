import { Word } from '../types';
import { DATA_PART_1 } from '../data_chunk1';
import { DATA_PART_2 } from '../data_chunk2';
import { DATA_PART_3 } from '../data_chunk3';
import { parseVocabulary } from '../utils/parser';

/**
 * 高中（高考）英语词库 - 完整 3817 词
 *
 * 数据来源：data_chunk1/2/3.ts（与原项目兼容）
 * 处理过程：
 *   1. 拼接三块原始文本
 *   2. 复用 parser 把文本解析成 Word 数组
 *   3. 给每个词打 stage='senior' 标签
 *   4. 默认 difficulty=3（中等），后续可按高考高频词分级覆盖
 */
const RAW_SENIOR_DATA = DATA_PART_1 + DATA_PART_2 + DATA_PART_3;
const PARSED: Word[] = parseVocabulary(RAW_SENIOR_DATA);

/** 高考词汇数组（含 stage='senior' 标签） */
export const SENIOR_WORDS: Word[] = PARSED.map(w => ({
  ...w,
  stage: 'senior',
  difficulty: w.difficulty ?? 3,
}));

/**
 * 兼容旧代码：原始文本形式
 * 历史调用方 App.tsx 使用 RAW_DATA 字符串
 */
export const RAW_DATA = RAW_SENIOR_DATA;
