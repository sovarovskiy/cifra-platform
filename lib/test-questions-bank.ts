/**
 * Банк ~200 вопросов. Только серверные маршруты — не импортировать в client components.
 */
import { buildTestQuestionBankManifest } from "./test-questions-generator";
import type { TestQuestion, TestQuestionBank } from "./test-questions-types";

export const TEST_QUESTION_BANK: TestQuestionBank = buildTestQuestionBankManifest();

export function getTestQuestions(): TestQuestion[] {
  return TEST_QUESTION_BANK.questions;
}
