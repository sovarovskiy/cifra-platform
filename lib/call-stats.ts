import fs from "fs";
import os from "os";
import path from "path";
import { nanoid } from "nanoid";
import { getRedis, hasRedisStore } from "./kv";
import type {
  FunnelId,
  NonTargetFlowId,
  PriorityId,
  QualificationState,
} from "./scoring";
import {
  calculateFunnel,
  calculateNonTargetResult,
  calculatePriority,
  funnelIdFromNonTarget,
  FUNNEL_ORDER,
  getFunnelLabel,
} from "./scoring";

export type CallOutcomeType = "target" | "non_target";

export type CallCompletion = {
  id: string;
  completed_at: string;
  user_email: string;
  manager_name?: string;
  outcome_type: CallOutcomeType;
  funnel_id: FunnelId;
  funnel_label: string;
  priority_id: PriorityId;
  non_target_flow?: NonTargetFlowId;
  segment?: string;
  lead_source?: "transfer" | "application";
};

export type FunnelStatRow = {
  funnel_id: FunnelId;
  funnel_label: string;
  count: number;
  percent: number;
};

export type CallStatsResult = {
  total_calls: number;
  funnels: FunnelStatRow[];
  filters: {
    from: string;
    to: string;
    email: string | null;
  };
};

export type CallStatsFilters = CallStatsResult["filters"];

const REDIS_KEY = "cifra:calls:v1";

let callsPathCache: string | null = null;

function isServerlessEnv(): boolean {
  return (
    process.env.VERCEL === "1" ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !!process.env.VERCEL_ENV
  );
}

function resolveCallsPath(): string {
  if (callsPathCache) return callsPathCache;

  if (isServerlessEnv() && !hasRedisStore()) {
    callsPathCache = path.join(os.tmpdir(), "cifra-calls.json");
    return callsPathCache;
  }

  const localPath = path.join(process.cwd(), "data", "calls.json");
  try {
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(localPath)) {
      fs.writeFileSync(localPath, "[]", "utf-8");
    }
    callsPathCache = localPath;
    return localPath;
  } catch {
    callsPathCache = path.join(os.tmpdir(), "cifra-calls.json");
    return callsPathCache;
  }
}

function parseCompletions(raw: string): CallCompletion[] {
  const data = JSON.parse(raw) as CallCompletion[];
  return Array.isArray(data) ? data : [];
}

function readCallsFile(): CallCompletion[] {
  const filePath = resolveCallsPath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf-8");
      return [];
    }
    return parseCompletions(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    console.error("[Цифра] readCallsFile:", e);
    return [];
  }
}

function writeCallsFile(rows: CallCompletion[]): void {
  const filePath = resolveCallsPath();
  const payload = JSON.stringify(rows, null, 2);
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, payload, "utf-8");
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "EROFS" || err.code === "EACCES") {
      callsPathCache = path.join(os.tmpdir(), "cifra-calls.json");
      const dir = path.dirname(callsPathCache);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(callsPathCache, payload, "utf-8");
      return;
    }
    throw e;
  }
}

async function readCompletions(): Promise<CallCompletion[]> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get<string>(REDIS_KEY);
      if (!raw) {
        await writeCompletions([]);
        return [];
      }
      if (typeof raw === "string") return parseCompletions(raw);
      return parseCompletions(JSON.stringify(raw));
    } catch (e) {
      console.error("[Цифра] readCompletions redis:", e);
      return [];
    }
  }
  return readCallsFile();
}

async function writeCompletions(rows: CallCompletion[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY, JSON.stringify(rows));
    return;
  }
  writeCallsFile(rows);
}

function normEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseDateBoundary(value: string, endOfDay: boolean): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  return d;
}

export function buildCompletionFromWizard(input: {
  userEmail: string;
  state: QualificationState;
  outcomeType: CallOutcomeType;
  nonTargetFlow?: NonTargetFlowId;
}): CallCompletion {
  const { userEmail, state, outcomeType, nonTargetFlow } = input;

  if (outcomeType === "non_target" && nonTargetFlow) {
    const nt = calculateNonTargetResult(nonTargetFlow, state);
    const funnelId = funnelIdFromNonTarget(nonTargetFlow);
    return {
      id: nanoid(),
      completed_at: new Date().toISOString(),
      user_email: normEmail(userEmail),
      manager_name: state.managerName?.trim() || undefined,
      outcome_type: "non_target",
      funnel_id: funnelId,
      funnel_label: nt.funnelLabel,
      priority_id:
        nt.priorityLabel === "Точно не делаем"
          ? "dont"
          : nt.priorityLabel === "Когда будут возможности по ресурсу"
            ? "when_resources"
            : "urgent",
      non_target_flow: nonTargetFlow,
      segment: state.segment,
      lead_source: state.leadSource,
    };
  }

  const funnel = calculateFunnel(state);
  const priority = calculatePriority(state);

  return {
    id: nanoid(),
    completed_at: new Date().toISOString(),
    user_email: normEmail(userEmail),
    manager_name: state.managerName?.trim() || undefined,
    outcome_type: "target",
    funnel_id: funnel.funnel,
    funnel_label: funnel.funnelLabel,
    priority_id: priority.priority,
    segment: state.segment,
    lead_source: state.leadSource,
  };
}

export async function addCallCompletion(completion: CallCompletion): Promise<void> {
  const rows = await readCompletions();
  rows.push(completion);
  await writeCompletions(rows);
}

export function getDefaultStatsRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { from: fmt(from), to: fmt(now) };
}

export async function getCallStats(filters: {
  from: string;
  to: string;
  email?: string | null;
}): Promise<CallStatsResult> {
  const fromDate = parseDateBoundary(filters.from, false);
  const toDate = parseDateBoundary(filters.to, true);
  if (!fromDate || !toDate) {
    throw new Error("INVALID_DATE_RANGE");
  }

  const emailFilter = filters.email?.trim()
    ? normEmail(filters.email)
    : null;

  const rows = await readCompletions();
  const filtered = rows.filter((row) => {
    const at = new Date(row.completed_at);
    if (at < fromDate || at > toDate) return false;
    if (emailFilter && row.user_email !== emailFilter) return false;
    return true;
  });

  const counts = Object.fromEntries(FUNNEL_ORDER.map((id) => [id, 0])) as Record<
    FunnelId,
    number
  >;

  for (const row of filtered) {
    counts[row.funnel_id] = (counts[row.funnel_id] ?? 0) + 1;
  }

  const total = filtered.length;
  const funnels: FunnelStatRow[] = FUNNEL_ORDER.map((funnelId) => {
    const count = counts[funnelId] ?? 0;
    return {
      funnel_id: funnelId,
      funnel_label: getFunnelLabel(funnelId),
      count,
      percent: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    };
  });

  return {
    total_calls: total,
    funnels,
    filters: {
      from: filters.from,
      to: filters.to,
      email: emailFilter,
    },
  };
}
