"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  applyPatch,
  getStep,
  NON_TARGET_TEXTS,
  resolveNext,
  SCRIPT_STEPS,
  type AnswerOption,
} from "@/lib/script-engine";
import type { QualificationState } from "@/lib/scoring";
import {
  calculateFunnel,
  calculatePriority,
  SEGMENT_PHRASES,
} from "@/lib/scoring";
import jtbdData from "@/data/jtbd.json";

const START_STEP = "ctx_source";

type JtbdEntry = {
  title: string;
  mainTask?: string;
  salesLanguage?: string;
  inherits?: string;
};

export function CallWizard() {
  const router = useRouter();
  const [stepId, setStepId] = useState(START_STEP);
  const [state, setState] = useState<QualificationState>({ hasOgzInterest: true });
  const [inputValue, setInputValue] = useState("");
  const [nonTarget, setNonTarget] = useState<keyof typeof NON_TARGET_TEXTS | null>(null);
  const [finished, setFinished] = useState(false);

  const step = getStep(stepId);

  const progress = useMemo(() => {
    const idx = SCRIPT_STEPS.findIndex((s) => s.id === stepId);
    return Math.round(((idx + 1) / SCRIPT_STEPS.length) * 100);
  }, [stepId]);

  const checkSession = useCallback(async () => {
    const res = await fetch("/api/session/check");
    if (res.status === 401) {
      router.push("/login?reason=session");
    }
  }, [router]);

  useEffect(() => {
    const t = setInterval(checkSession, 30000);
    checkSession();
    return () => clearInterval(t);
  }, [checkSession]);

  useEffect(() => {
    const s = getStep(stepId);
    if (s?.showIf && !s.showIf(state)) {
      const nextId = s.next ?? "result";
      if (nextId !== stepId) setStepId(nextId);
    }
  }, [stepId, state]);

  const goNext = useCallback(
    (answer: AnswerOption | null, inputOverride?: string) => {
      if (!step) return;

      let patch = answer?.patch ?? {};
      if (step.input && step.inputKey) {
        const key = step.inputKey;
        if (step.input === "number") {
          const num = Number(inputOverride ?? inputValue);
          if (!Number.isFinite(num)) return;
          patch = { ...patch, [key]: num } as Partial<QualificationState>;
        } else {
          patch = {
            ...patch,
            [key]: inputOverride ?? inputValue,
          } as Partial<QualificationState>;
        }
      }

      const newState = applyPatch(state, patch);
      setState(newState);
      setInputValue("");

      const next = resolveNext(step, answer, newState);
      if (answer?.endFlow) {
        setNonTarget(
          answer.endFlow === "non_target_a"
            ? "non_target_a"
            : answer.endFlow === "non_target_b"
              ? "non_target_b"
              : "non_target_c"
        );
        return;
      }
      if (next === "result") {
        setFinished(true);
        return;
      }
      let target = next;
      let hops = 0;
      while (hops < 20) {
        const nextStep = getStep(target);
        if (!nextStep) break;
        if (nextStep.showIf && !nextStep.showIf(newState)) {
          target = nextStep.next ?? "result";
          hops++;
          continue;
        }
        break;
      }
      if (target === "result") {
        setFinished(true);
        return;
      }
      setStepId(target);
    },
    [step, state, inputValue]
  );

  const results = useMemo(() => {
    if (!finished) return null;
    const funnel = calculateFunnel(state);
    const priority = calculatePriority(state);
    const segment = state.segment ?? "—";
    const phrase = SEGMENT_PHRASES[segment] ?? "";
    const jtbd = (jtbdData as Record<string, JtbdEntry>)[segment];
    const jtbdResolved =
      jtbd?.mainTask
        ? jtbd
        : jtbd?.inherits
          ? (jtbdData as Record<string, JtbdEntry>)[jtbd.inherits]
          : undefined;

    return { funnel, priority, segment, phrase, jtbd: jtbdResolved, jtbdTitle: jtbd?.title };
  }, [finished, state]);

  if (nonTarget) {
    const nt = NON_TARGET_TEXTS[nonTarget];
    return (
      <ResultLayout title={nt.title}>
        <p className="rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          {nt.managerText}
        </p>
        <button
          type="button"
          className="btn-primary mt-6"
          onClick={() => window.location.reload()}
        >
          Новый звонок
        </button>
      </ResultLayout>
    );
  }

  if (finished && results) {
    return (
      <ResultLayout title="Итог квалификации">
        <section className="space-y-4">
          <div className="rounded-xl bg-brand-500/10 p-4 ring-1 ring-brand-200">
            <h3 className="text-sm font-semibold text-brand-800">Воронка CRM</h3>
            <p className="mt-1 text-xl font-bold text-slate-900">{results.funnel.funnelLabel}</p>
            {results.funnel.block && (
              <p className="text-xs text-slate-600">{results.funnel.block}</p>
            )}
            <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
              {results.funnel.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          <div
            className={`rounded-xl p-4 ring-1 ${
              results.priority.priority === "urgent"
                ? "bg-emerald-50 ring-emerald-200"
                : results.priority.priority === "dont"
                  ? "bg-red-50 ring-red-200"
                  : "bg-slate-50 ring-slate-200"
            }`}
          >
            <h3 className="text-sm font-semibold text-slate-800">Приоритет работы</h3>
            <p className="mt-1 text-lg font-bold">{results.priority.label}</p>
            <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
              {results.priority.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="card-panel p-4">
            <h3 className="text-sm font-semibold">Сегмент JTBD: {results.segment}</h3>
            {results.jtbdTitle && (
              <p className="text-sm text-slate-600">{results.jtbdTitle}</p>
            )}
            {results.jtbd?.mainTask && (
              <p className="mt-2 text-sm text-slate-800">{results.jtbd.mainTask}</p>
            )}
            {results.phrase && (
              <p className="mt-3 rounded-lg bg-surface-muted p-3 text-sm italic leading-relaxed">
                {results.phrase}
              </p>
            )}
          </div>

          <CrmSummary state={state} />
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigator.clipboard.writeText(buildCrmText(state, results))}
          >
            Копировать для CRM
          </button>
          <button
            type="button"
            className="btn-ghost ml-2"
            onClick={() => window.location.reload()}
          >
            Новый звонок
          </button>
        </section>
      </ResultLayout>
    );
  }

  if (!step) return <p>Шаг не найден</p>;

  if (step.showIf && !step.showIf(state)) {
    return <p className="text-sm text-slate-500">Переход…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
        <span>{step.block}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="card-panel p-6">
        <p className="text-base font-medium leading-relaxed text-slate-900 whitespace-pre-wrap">
          {step.managerText}
        </p>
        {step.hint && (
          <p className="mt-3 text-xs leading-relaxed text-slate-500">{step.hint}</p>
        )}

        {step.input && (
          <div className="mt-6 space-y-2">
            <input
              type={step.input === "number" ? "number" : "text"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={step.inputPlaceholder}
              className="w-full rounded-xl border border-surface-muted px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => goNext(null)}
            >
              Далее
            </button>
            {step.id === "budget_main" && (
              <button
                type="button"
                className="btn-ghost w-full text-sm"
                onClick={() => setStepId("budget_fallback")}
              >
                Клиент не назвал сумму / затрудняется
              </button>
            )}
          </div>
        )}

        {step.answers && (
          <div className="mt-6 flex flex-col gap-2">
            {step.answers.map((a) => (
              <button
                key={a.id}
                type="button"
                className="btn-answer"
                onClick={() => goNext(a)}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-panel p-6">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function CrmSummary({ state }: { state: QualificationState }) {
  const rows: [string, string][] = [
    ["Тип клиента", state.clientType ?? "—"],
    ["Потенциал", state.potential?.toString() ?? "—"],
    ["Контакт", state.contactRole?.toUpperCase() ?? "—"],
    ["Регион", state.region === "mo" ? "МО" : state.region === "regions" ? "Регионы" : "—"],
    ["Чек", state.budgetClass ?? "—"],
    ["Готовность", state.readiness ?? "—"],
    ["Срок выбора", state.contractorTimeline ?? "—"],
    ["Сегмент", state.segment ?? "—"],
  ];
  return (
    <div className="card-panel p-4">
      <h3 className="text-sm font-semibold">Параметры для CRM</h3>
      <dl className="mt-2 grid gap-1 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-surface-muted py-1">
            <dt className="text-slate-500">{k}</dt>
            <dd className="font-medium text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function buildCrmText(
  state: QualificationState,
  results: {
    funnel: ReturnType<typeof calculateFunnel>;
    priority: ReturnType<typeof calculatePriority>;
    segment: string;
  }
) {
  return [
    `Воронка: ${results.funnel.funnelLabel}`,
    `Приоритет: ${results.priority.label}`,
    `Сегмент: ${results.segment}`,
    `Тип: ${state.clientType ?? "—"}`,
    `Потенциал: ${state.potential ?? "—"}`,
    `ЛПР/ЛВР/ЛИР: ${state.contactRole ?? "—"}`,
    `Регион: ${state.region ?? "—"}`,
    `Чек: ${state.budgetClass ?? "—"}`,
    `Бюджет ₽: ${state.budgetRub ?? "—"}`,
    `Готовность: ${state.readiness ?? "—"}`,
    `Срок выбора: ${state.contractorTimeline ?? "—"}`,
    `Тендер выигран: ${state.tenderWon ? "да" : "нет"}`,
  ].join("\n");
}
