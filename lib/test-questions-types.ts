export type TestQuestionOption = {
  id: string;
  label: string;
  correct: boolean;
};

export type TestQuestion = {
  id: string;
  topic: string;
  text: string;
  options: TestQuestionOption[];
  explanation: string;
};

export type TestQuestionBank = {
  version: number;
  questionsPerAttempt: number;
  passThreshold: number;
  passThresholdPercent: number;
  randomize: boolean;
  totalInBank: number;
  topics: string[];
  questions: TestQuestion[];
};

export const TEST_BANK_CONFIG = {
  questionsPerAttempt: 20,
  passThreshold: 16,
  passThresholdPercent: 80,
  randomize: true,
} as const;

/** Случайные N вопросов без повторов */
export function pickRandomQuestions(
  bank: TestQuestion[],
  count: number = TEST_BANK_CONFIG.questionsPerAttempt
): TestQuestion[] {
  const copy = [...bank];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

export function isTestPassed(
  score: number,
  total: number = TEST_BANK_CONFIG.questionsPerAttempt
): boolean {
  return score >= TEST_BANK_CONFIG.passThreshold && score <= total;
}
