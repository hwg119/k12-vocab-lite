export { parseVocabulary, generateStableId, isPhonetic, hasChinese, isPartSpeech } from './parser';
export { wordKey, matchWordKey } from './wordKey';
export { highlightDiff, pairDiffPositions } from './diff';
export type { DiffChar } from './diff';
export { shuffleArray, sample, chunk, seededRng, hashSeed } from './array';
export { generateQuiz, calculateScore, getScoreRating } from './quiz';
export {
  generateSeed,
  encodeChallenge,
  decodeChallenge,
  buildChallengeQuestions,
} from './challenge';
export type { ChallengeData } from './challenge';
export {
  createInitialSrs,
  applyReview,
  isDue,
  selectDueWords,
  pickMistakes,
  graduationThreshold,
  shouldGraduateFromMistakes,
  FEEDBACK_QUALITY,
} from './sm2';
export { planUnitsForStage, unitProgress } from './units';
export type { UnitsPlan } from './units';
export {
  recordActivity,
  computeStreak,
  totalCorrect,
  totalAnswered,
  overallAccuracy,
} from './streak';
export { evaluateAchievements, ACHIEVEMENT_DEFS } from './achievements';
export type { AchievementContext, StageSummary } from './achievements';
export { buildDailySummaries, weeklyComment } from './weekly';
export type { DailySummary } from './weekly';
export { groupConfusionPairs } from './confusion';
export type { ConfusionGroup } from './confusion';
export { exportBundle, importBundle, downloadBundle, readBundleFromFile } from './backup';
export { createInitialSpelling, applySpellingReview, shouldGraduateSpelling } from './sm2';
