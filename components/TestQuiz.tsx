"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientTestQuestion, GradedWrong } from "@/lib/test-grading";

type Phase = "intro" | "quiz" | "result";

type QuestionsPayload = {
  questions: ClientTestQuestion[];
  total: number;
  passThreshold: number;
  passThresholdPercent: number;
  bankSize: number;
};

type SubmitPayload = {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  passThreshold: number;
  wrong: GradedWrong[];
};

export function TestQuiz() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<QuestionsPayload | null>(null);
  const [questions, setQuestions] = useState<ClientTestQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Array<{ questionId: string; optionId: string }>
  >([]);
  const [result, setResult] = useState<SubmitPayload | null>(null);

  const checkSession = useCallback(async () => {
    const res = await fetch("/api/session/check", { credentials: "same-origin" });
    if (res.status === 401) router.push("/login?reason=session");
  }, [router]);

  useEffect(() => {
    const t = setInterval(checkSession, 30000);
    checkSession();
    return () => clearInterval(t);
  }, [checkSession]);

  const progress = useMemo(() => {
    if (!meta || phase !== "quiz") return 0;
    return Math.round(((index + 1) / meta.total) * 100);
  }, [index, meta, phase]);

  const startTest = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/test/questions", { credentials: "same-origin" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Не удалось загрузить вопросы");
      return;
    }

    const payload = data as QuestionsPayload;
    setMeta(payload);
    setQuestions(payload.questions);
    setIndex(0);
    setAnswers([]);
    setResult(null);
    setPhase("quiz");
  };

  const current = questions[index];

  const chooseOption = async (optionId: string) => {
    if (!current) return;
    const nextAnswers = [
      ...answers,
      { questionId: current.id, optionId },
    ];
    setAnswers(nextAnswers);

    if (!meta || index + 1 >= meta.total) {
      setLoading(true);
      setError("");
      const res = await fetch("/api/test/submit", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: nextAnswers }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? "Не удалось отправить ответы");
        return;
      }

      setResult(data as SubmitPayload);
      setPhase("result");
      return;
    }

    setIndex(index + 1);
  };

  if (phase === "intro") {
    return (
      <div className="content-card space-y-4">
        <h2 className="text-brand-title text-lg">Тест знаний</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          20 случайных вопросов из банка (~200) по скрипту ОГЗ, JTBD, воронкам и
          модели продаж. Порог «сдал» — не менее 16 из 20 (80%).
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          className="btn-wizard"
          disabled={loading}
          onClick={startTest}
        >
          {loading ? "Загрузка…" : "Начать тест"}
        </button>
      </div>
    );
  }

  if (phase === "result" && result && meta) {
    return (
      <div className="content-card space-y-4">
        <h2 className="text-brand-title text-lg">Результат</h2>
        <p
          className={`text-lg font-semibold ${result.passed ? "text-emerald-700" : "text-amber-800"}`}
        >
          {result.passed ? "Сдал" : "Не сдал"} — {result.score} из {result.total}{" "}
          ({result.percent}%)
        </p>
        <p className="text-sm text-slate-600">
          Порог: {result.passThreshold} из {result.total} (
          {meta.passThresholdPercent}%)
        </p>

        {result.wrong.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-step-label">Ошибки ({result.wrong.length})</h3>
            <ul className="space-y-3">
              {result.wrong.map((w) => (
                <li key={w.question_id} className="panel-inset p-3 text-sm">
                  <p className="font-medium text-slate-900">{w.question_text}</p>
                  <p className="mt-2 text-red-700">
                    Ваш ответ: {w.chosen_label}
                  </p>
                  <p className="mt-1 text-emerald-800">
                    Верно: {w.correct_label}
                  </p>
                  {w.explanation && (
                    <p className="mt-2 text-slate-600 italic">{w.explanation}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="button" className="btn-wizard" onClick={() => setPhase("intro")}>
          Пройти снова
        </button>
      </div>
    );
  }

  if (!current || !meta) {
    return <p className="text-sm text-slate-600">Загрузка вопроса…</p>;
  }

  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
      <div className="wizard-progress">
        <div className="progress-row">
          <span className="text-step-label">
            Вопрос {index + 1} / {meta.total}
          </span>
          <span className="progress-pct">{progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="content-card wizard-card flex-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">{current.topic}</p>
        <p className="script-text mt-2">{current.text}</p>

        <div className="wizard-actions">
          {current.options.map((o) => (
            <button
              key={o.id}
              type="button"
              className="btn-wizard"
              disabled={loading}
              onClick={() => chooseOption(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
