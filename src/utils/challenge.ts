/**
 * 挑战码工具：生成、编码、解码
 *
 * 挑战码是一串短字符串（11 字符 base32），承载：
 *   - seed: 6 字符种子（数字 + 大写字母，去除易混淆的 0/O/1/I）
 *   - score: 2 位十进制数（0-99 分）
 *   - timeSec: 3 位十进制数（0-999 秒）
 *
 * 双端解析出相同 seed 后，用 generateQuiz 即可还原完全一致的题目。
 * 防作弊能力弱（适合同学间轻量 PK，不是竞技赛事）。
 */

import { QuizQuestion } from '../types';
import { generateQuiz } from './quiz';

// 去除易混淆字符的 base32 字母表（Crockford 风格，去掉 0/O/1/I/L/U）
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
const ALPHABET_MAP: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) {
  ALPHABET_MAP[ALPHABET[i]] = i;
}

export interface ChallengeData {
  seed: string;
  score: number;
  timeSec: number;
}

export interface ChallengeResult extends ChallengeData {
  scoreRating: ReturnType<typeof getScoreRatingInline>;
}

/**
 * 生成 6 字符种子。默认排除易混淆字符。
 */
export function generateSeed(): string {
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}

/**
 * 编码挑战码：seed(6) + score(2 位) + timeSec(3 位) → base32 → 11 字符
 * 输入校验：score ∈ [0, 99], timeSec ∈ [0, 999]
 */
export function encodeChallenge(seed: string, score: number, timeSec: number): string {
  if (score < 0 || score > 99) throw new Error('score 必须在 0-99 之间');
  if (timeSec < 0 || timeSec > 999) throw new Error('timeSec 必须在 0-999 之间');
  if (seed.length !== 6) throw new Error('seed 长度必须为 6');

  // 11 位 5-bit 数据 → 11 个 base32 字符（55 bits 容纳）
  // 用 (seed, score, timeSec) 的位拼接直接编码
  // 6*5 + 7 + 10 = 47 bits，足够
  const payload: number[] = [];
  // seed: 6 * 5 bits = 30 bits
  for (const ch of seed) {
    payload.push(ALPHABET_MAP[ch] ?? 0);
  }
  // score: 7 bits (0-99 < 128)
  payload.push(score);
  // timeSec: 10 bits (0-999 < 1024)
  payload.push(timeSec);

  // 简化为 30 + 7 + 10 = 47 bits → ceil(47/5) = 10 个 base32 字符
  // 用第二个版本：拼接位流
  let bits = '';
  for (const v of payload.slice(0, 6)) {
    bits += v.toString(2).padStart(5, '0');
  }
  bits += payload[6].toString(2).padStart(7, '0');
  bits += payload[7].toString(2).padStart(10, '0');
  // bits.length === 47

  let out = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    out += ALPHABET[parseInt(chunk, 2)];
  }
  return out; // 10 字符
}

/**
 * 解码挑战码。失败抛出 Error。
 */
export function decodeChallenge(code: string): ChallengeData {
  const normalized = code.trim().toUpperCase().replace(/\s/g, '');
  if (normalized.length !== 10) {
    throw new Error(`挑战码长度应为 10 字符，实际 ${normalized.length}`);
  }
  let bits = '';
  for (const ch of normalized) {
    if (!(ch in ALPHABET_MAP)) {
      throw new Error(`挑战码包含无效字符: ${ch}`);
    }
    bits += ALPHABET_MAP[ch].toString(2).padStart(5, '0');
  }
  // bits.length === 50，最后 3 bit 补 0 不用
  bits = bits.slice(0, 47);

  const seedBits = bits.slice(0, 30);
  const scoreBits = bits.slice(30, 37);
  const timeBits = bits.slice(37, 47);

  let seed = '';
  for (let i = 0; i < 6; i++) {
    seed += ALPHABET[parseInt(seedBits.slice(i * 5, i * 5 + 5), 2)];
  }
  const score = parseInt(scoreBits, 2);
  const timeSec = parseInt(timeBits, 2);

  return { seed, score, timeSec };
}

/**
 * 内部：导入 getScoreRating，避免循环引用
 */
function getScoreRatingInline(score: number, total: number) {
  const percentage = total === 0 ? 0 : (score / total) * 100;
  if (percentage >= 90) return { grade: 'A+', message: '太棒了！完美表现！', color: 'text-emerald-500' };
  if (percentage >= 80) return { grade: 'A', message: '非常好！继续保持！', color: 'text-emerald-500' };
  if (percentage >= 70) return { grade: 'B', message: '不错！还有进步空间！', color: 'text-blue-500' };
  if (percentage >= 60) return { grade: 'C', message: '及格了，继续努力！', color: 'text-amber-500' };
  return { grade: 'D', message: '加油！多多复习！', color: 'text-rose-500' };
}

/**
 * 便捷：基于挑战码还原题目并解析对方成绩
 */
export function buildChallengeQuestions(allWords: import('../types').Word[], code: string): {
  questions: QuizQuestion[];
  opponent: ChallengeData;
} {
  const opponent = decodeChallenge(code);
  const questions = generateQuiz(allWords, 20, opponent.seed);
  return { questions, opponent };
}