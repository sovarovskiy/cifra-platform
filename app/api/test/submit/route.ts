import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  gradeTestAnswers,
  type TestAnswerInput,
} from "@/lib/test-grading";
import { getTestQuestions, TEST_QUESTION_BANK } from "@/lib/test-questions-bank";
import { addTestAttempt } from "@/lib/test-stats";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { answers?: TestAnswerInput[] };
  const answers = body.answers;

  if (!Array.isArray(answers) || answers.length !== TEST_QUESTION_BANK.questionsPerAttempt) {
    return NextResponse.json(
      {
        error: `Нужно ровно ${TEST_QUESTION_BANK.questionsPerAttempt} ответов`,
      },
      { status: 400 }
    );
  }

  const ids = new Set<string>();
  for (const a of answers) {
    if (!a?.questionId || !a?.optionId) {
      return NextResponse.json({ error: "Некорректный ответ" }, { status: 400 });
    }
    if (ids.has(a.questionId)) {
      return NextResponse.json({ error: "Повтор вопроса" }, { status: 400 });
    }
    ids.add(a.questionId);
  }

  const bank = getTestQuestions();
  const bankById = new Map(bank.map((q) => [q.id, q]));

  for (const id of ids) {
    if (!bankById.has(id)) {
      return NextResponse.json({ error: "Неизвестный вопрос" }, { status: 400 });
    }
  }

  const graded = gradeTestAnswers(
    bankById,
    answers,
    TEST_QUESTION_BANK.questionsPerAttempt
  );

  const attempt = await addTestAttempt({
    userEmail: user.email,
    score: graded.score,
    total: graded.total,
    percent: graded.percent,
    passed: graded.passed,
    wrong: graded.wrong,
  });

  return NextResponse.json({
    id: attempt.id,
    score: graded.score,
    total: graded.total,
    percent: graded.percent,
    passed: graded.passed,
    passThreshold: graded.passThreshold,
    wrong: graded.wrong,
  });
}
