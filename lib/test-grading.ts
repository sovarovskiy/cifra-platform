import type { TestQuestion, TestQuestionOption } from "./test-questions-types";
import { TEST_BANK_CONFIG, isTestPassed } from "./test-questions-types";

export type ClientTestOption = {
  id: string;
  label: string;
};

export type ClientTestQuestion = {
  id: string;
  topic: string;
  text: string;
  options: ClientTestOption[];
};

export function toClientQuestion(q: TestQuestion): ClientTestQuestion {
  return {
    id: q.id,
    topic: q.topic,
    text: q.text,
    options: q.options.map((o) => ({ id: o.id, label: o.label })),
  };
}

export type TestAnswerInput = {
  questionId: string;
  optionId: string;
};

export type GradedWrong = {
  question_id: string;
  question_text: string;
  chosen_label: string;
  correct_label: string;
  explanation?: string;
};

export type GradeTestResult = {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  passThreshold: number;
  wrong: GradedWrong[];
};

function findOption(
  options: TestQuestionOption[],
  optionId: string
): TestQuestionOption | undefined {
  return options.find((o) => o.id === optionId);
}

function correctOption(options: TestQuestionOption[]): TestQuestionOption | undefined {
  return options.find((o) => o.correct);
}

export function gradeTestAnswers(
  bankById: Map<string, TestQuestion>,
  answers: TestAnswerInput[],
  total: number = TEST_BANK_CONFIG.questionsPerAttempt
): GradeTestResult {
  const wrong: GradedWrong[] = [];
  let score = 0;

  for (const a of answers) {
    const q = bankById.get(a.questionId);
    if (!q) continue;
    const chosen = findOption(q.options, a.optionId);
    const correct = correctOption(q.options);
    if (chosen?.correct) {
      score += 1;
    } else {
      wrong.push({
        question_id: q.id,
        question_text: q.text,
        chosen_label: chosen?.label ?? "—",
        correct_label: correct?.label ?? "—",
        explanation: q.explanation,
      });
    }
  }

  const percent = total > 0 ? Math.round((score / total) * 1000) / 10 : 0;

  return {
    score,
    total,
    percent,
    passed: isTestPassed(score, total),
    passThreshold: TEST_BANK_CONFIG.passThreshold,
    wrong,
  };
}
