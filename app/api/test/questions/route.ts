import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toClientQuestion } from "@/lib/test-grading";
import { getTestQuestions, TEST_QUESTION_BANK } from "@/lib/test-questions-bank";
import { pickRandomQuestions } from "@/lib/test-questions-types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bank = getTestQuestions();
  if (bank.length < TEST_QUESTION_BANK.questionsPerAttempt) {
    return NextResponse.json(
      { error: "Банк вопросов не готов" },
      { status: 503 }
    );
  }

  const picked = pickRandomQuestions(bank, TEST_QUESTION_BANK.questionsPerAttempt);

  return NextResponse.json({
    questions: picked.map(toClientQuestion),
    total: TEST_QUESTION_BANK.questionsPerAttempt,
    passThreshold: TEST_QUESTION_BANK.passThreshold,
    passThresholdPercent: TEST_QUESTION_BANK.passThresholdPercent,
    bankSize: TEST_QUESTION_BANK.totalInBank,
  });
}
