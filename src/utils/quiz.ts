import { Word, QuizQuestion } from '../types';
import { shuffleArray, sample, seededRng, hashSeed } from './array';

/**
 * 生成测验题目
 *
 * 默认使用真随机；若传入 seed，则生成可复现的题目顺序和选项布局，
 * 同一 seed + 同一词库可在两端还原完全一致的题目。
 *
 * @param allWords - 所有单词数组
 * @param count - 题目数量（默认 20）
 * @param seed - 可选种子字符串（如挑战码）；传入时题目确定
 * @returns 测验题目数组
 */
export function generateQuiz(
  allWords: Word[],
  count: number = 20,
  seed?: string
): QuizQuestion[] {
  if (allWords.length === 0) return [];
  if (allWords.length < 4) {
    throw new Error('单词数量不足以生成测验（至少需要4个单词）');
  }

  const rng = seed ? seededRng(hashSeed(seed)) : Math.random;
  const selectedWords = sample(allWords, count, rng);

  return selectedWords.map(word => {
    // 干扰项与正确选项的布局也由同一 rng 派生，保证双端一致
    const distractors = sample(
      allWords.filter(w => w.id !== word.id),
      3,
      rng
    ).map(w => w.chinese);

    const options = shuffleArray([word.chinese, ...distractors], rng);

    return {
      word,
      options,
      correctIndex: options.indexOf(word.chinese),
    };
  });
}

/**
 * 计算测验得分
 * @param answers - 用户答案数组
 * @param questions - 测验题目数组
 * @returns 得分
 */
export function calculateScore(answers: number[], questions: QuizQuestion[]): number {
  return answers.reduce((score, answer, index) => {
    return score + (answer === questions[index].correctIndex ? 1 : 0);
  }, 0);
}

/**
 * 获取得分评级
 * @param score - 得分
 * @param total - 总分
 * @returns 评级信息
 */
export function getScoreRating(score: number, total: number): {
  grade: string;
  message: string;
  color: string;
} {
  const percentage = (score / total) * 100;

  if (percentage >= 90) {
    return { grade: 'A+', message: '太棒了！完美表现！', color: 'text-emerald-500' };
  } else if (percentage >= 80) {
    return { grade: 'A', message: '非常好！继续保持！', color: 'text-emerald-500' };
  } else if (percentage >= 70) {
    return { grade: 'B', message: '不错！还有进步空间！', color: 'text-blue-500' };
  } else if (percentage >= 60) {
    return { grade: 'C', message: '及格了，继续努力！', color: 'text-amber-500' };
  } else {
    return { grade: 'D', message: '加油！多多复习！', color: 'text-rose-500' };
  }
}