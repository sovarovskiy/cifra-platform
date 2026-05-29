"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  applyPatch,
  formatManagerText,
  getStep,
  NON_TARGET_MODULE,
  NON_TARGET_TEXTS,
  detectNonTargetFlow,
  resolveNext,
  SCRIPT_STEPS,
  type AnswerOption,
  type NonTargetFlow,
} from "@/lib/script-engine";
import type { QualificationState } from "@/lib/scoring";
import {
  calculateFunnel,
  calculatePriority,
  SEGMENT_PHRASES,
} from "@/lib/scoring";
import jtbdData from "@/data/jtbd.json";

const START_STEP = "ctx_source";
const MANAGER_NAME_KEY = "cifra_manager_name";

type JtbdEntry = {
  title: string;
  mainTask?: string;
  salesLanguage?: string;
  inherits?: string;
};

type HistoryEntry = {
  stepId: string;
  state: QualificationState;
  inputValue: string;
};

function initialState(): QualificationState {
  const base: QualificationState = { hasOgzInterest: true };
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(MANAGER_NAME_KEY);
    if (saved) base.managerName = saved;
  }
  return base;
}

function inputValueForStep(stepId: string, s: QualificationState): string {
  const step = getStep(stepId);
  if (!step?.inputKey) return "";
  const v = s[step.inputKey];
  if (v === undefined || v === null) return "";
  return String(v);
}

export function CallWizard() {
  const router = useRouter();
  const [stepId, setStepId] = useState(START_STEP);
  const [state, setState] = useState<QualificationState>(() => initialState());
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const s = initialState();
    return [{ stepId: START_STEP, state: s, inputValue: "" }];
  });
  const [nonTarget, setNonTarget] = useState<NonTargetFlow | null>(null);
  const [finished, setFinished] = useState(false);

  const step = getStep(stepId);

  const progress = useMemo(() => {
    const idx = SCRIPT_STEPS.findIndex((s) => s.id === stepId);
    return Math.round(((idx + 1) / SCRIPT_STEPS.length) * 100);
  }, [stepId]);

  const checkSession = useCallback(async () => {
    const res = await fetch("/api/session/check", { credentials: "same-origin" });
    if (res.status === 401) router.push("/login?reason=session");
  }, [router]);

  useEffect(() => {
    const t = setInterval(checkSession, 30000);
    checkSession();
    return () => clearInterval(t);
  }, [checkSession]);

  const resolveTarget = useCallback((start: string, s: QualificationState): string => {
    let target = start;
    let hops = 0;
    while (hops < 20) {
      const nextStep = getStep(target);
      if (!nextStep) break;
      if (nextStep.showIf && !nextStep.showIf(s)) {
        target = nextStep.next ?? "result";
        hops++;
        continue;
      }
      break;
    }
    return target;
  }, []);

  const goToStep = useCallback(
    (target: string, newState: QualificationState, pushHistory: boolean) => {
      if (target === "result") {
        setFinished(true);
        setNonTarget(null);
        return;
      }
      const resolved = resolveTarget(target, newState);
      if (resolved === "result") {
        setFinished(true);
        setNonTarget(null);
        return;
      }
      const nextInput = inputValueForStep(resolved, newState);
      if (pushHistory) {
        setHistory((h) => [
          ...h,
          { stepId: resolved, state: newState, inputValue: nextInput },
        ]);
      }
      setStepId(resolved);
      setState(newState);
      setInputValue(nextInput);
      setFinished(false);
      setNonTarget(null);
    },
    [resolveTarget]
  );

  useEffect(() => {
    const s = getStep(stepId);
    if (s?.showIf && !s.showIf(state)) {
      const target = resolveTarget(s.next ?? "result", state);
      if (target !== stepId) goToStep(target, state, false);
    }
  }, [stepId, state, resolveTarget, goToStep]);

  const goBack = useCallback(() => {
    if (history.length <= 1) return;
    const nextHistory = history.slice(0, -1);
    const prev = nextHistory[nextHistory.length - 1];
    setHistory(nextHistory);
    setStepId(prev.stepId);
    setState(prev.state);
    setInputValue(prev.inputValue);
    setFinished(false);
    setNonTarget(null);
  }, [history]);

  const finishNonTarget = useCallback(
    (flow: NonTargetFlow, newState: QualificationState) => {
      setState(newState);
      setNonTarget(flow);
      setFinished(false);
    },
    []
  );

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
          const val = (inputOverride ?? inputValue).trim();
          if (!val) {
            if (step.optional) {
              const newState = applyPatch(state, patch);
              const next = resolveNext(step, answer, newState);
              goToStep(next, newState, true);
              return;
            }
            return;
          }
          patch = { ...patch, [key]: val } as Partial<QualificationState>;
        }
      }

      const newState = applyPatch(state, patch);

      if (step.id === "ctx_manager_name" && newState.managerName) {
        localStorage.setItem(MANAGER_NAME_KEY, newState.managerName);
      }

      const nonTargetFlow = answer?.endFlow ?? detectNonTargetFlow(newState);
      if (nonTargetFlow) {
        finishNonTarget(nonTargetFlow, newState);
        return;
      }

      const next = resolveNext(step, answer, newState);
      if (next === "non_target") {
        const flow = detectNonTargetFlow(newState);
        if (flow) {
          finishNonTarget(flow, newState);
          return;
        }
      }
      goToStep(next, newState, true);
    },
    [step, state, inputValue, goToStep, finishNonTarget]
  );

  const displayText = step ? formatManagerText(step.managerText, state) : "";

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

  const canGoBack = history.length > 1 && !finished && !nonTarget;

  if (nonTarget) {
    const nt = NON_TARGET_TEXTS[nonTarget];
    const phrase = formatManagerText(nt.managerText, state);
    return (
      <ResultLayout
        title={NON_TARGET_MODULE.title}
        onBack={goBack}
        canGoBack={history.length > 1}
      >
        <p className="text-sm text-slate-600">{NON_TARGET_MODULE.description}</p>
        <h3 className="mt-4 text-sm font-bold text-amber-900">{nt.title}</h3>
        <p className="mt-1 text-xs text-amber-800">{nt.subtitle}</p>
        <p className="glass-speech mt-3 rounded-xl p-4 text-sm leading-relaxed text-amber-950 whitespace-pre-wrap">
          {phrase}
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
      <ResultLayout title="Итог квалификации" onBack={goBack} canGoBack={history.length > 1}>
        <section className="space-y-4">
          <div className="glass-inset rounded-xl p-4">
            <h3 className="text-sm font-semibold text-brand-700">Воронка CRM</h3>
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
            className={`glass-inset rounded-xl p-4 ${
              results.priority.priority === "urgent"
                ? "border-emerald-200/60"
                : results.priority.priority === "dont"
                  ? "border-red-200/60"
                  : ""
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
              <p className="glass-inset mt-3 rounded-lg p-3 text-sm italic leading-relaxed">
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="wizard-block-label">{step.block}</span>
        <span className="text-xs font-medium text-brand-700">{progress}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="wizard-card p-6">
        <p className="text-base font-medium leading-relaxed text-slate-900 whitespace-pre-wrap">
          {displayText}
        </p>
        {step.hint && (
          <p className="mt-3 text-xs leading-relaxed text-slate-500">{step.hint}</p>
        )}

        {step.input && (
          <div className="mt-6 space-y-2">
            <input
              type={step.input === "number" ? "number" : "text"}
              inputMode={
                step.input === "tel"
                  ? "tel"
                  : step.input === "number"
                    ? "numeric"
                    : undefined
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={step.inputPlaceholder}
              className="glass-input"
            />
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => goNext(null)}
            >
              Далее
            </button>
            {step.optional && (
              <button
                type="button"
                className="btn-ghost w-full text-sm"
                onClick={() => goNext(null, "")}
              >
                Пропустить
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
                className={
                  step.id === "budget_main"
                    ? "btn-answer-wizard btn-answer-budget"
                    : "btn-answer-wizard"
                }
                onClick={() => goNext(a)}
              >
                <span>{a.label}</span>
              </button>
            ))}
            {step.id === "budget_main" && (
              <button
                type="button"
                className="btn-ghost-wizard w-full"
                onClick={() => goToStep("budget_fallback", state, true)}
              >
                Клиент не назвал сумму / затрудняется
              </button>
            )}
          </div>
        )}

        {canGoBack && (
          <button type="button" className="btn-ghost-wizard mt-4 w-full" onClick={goBack}>
            ← Назад
          </button>
        )}
      </div>
    </div>
  );
}

function ResultLayout({
  title,
  children,
  onBack,
  canGoBack,
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  canGoBack?: boolean;
}) {
  return (
    <div className="wizard-card p-6">
      <h2 className="text-xl font-bold text-brand-800">{title}</h2>
      <div className="mt-4">{children}</div>
      {canGoBack && onBack && (
        <button type="button" className="btn-ghost mt-4 w-full" onClick={onBack}>
          ← Назад
        </button>
      )}
    </div>
  );
}

function CrmSummary({ state }: { state: QualificationState }) {
  const source =
    state.leadSource === "transfer"
      ? "Скорозвон"
      : state.leadSource === "application"
        ? "Заявка"
        : "—";
  const rows: [string, string][] = [
    ["Источник", source],
    ["Телефон клиента", state.clientPhone ?? "—"],
    ["ID сделки", state.dealId ?? "—"],
    ["Менеджер", state.managerName ?? "—"],
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
    `Телефон: ${state.clientPhone ?? "—"}`,
    `ID сделки: ${state.dealId ?? "—"}`,
    `Менеджер: ${state.managerName ?? "—"}`,
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
