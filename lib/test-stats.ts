import fs from "fs";
import os from "os";
import path from "path";
import { nanoid } from "nanoid";
import { getRedis, hasRedisStore } from "./kv";
import type { GradedWrong } from "./test-grading";
import { TEST_BANK_CONFIG } from "./test-questions-types";

export type TestAttempt = {
  id: string;
  completed_at: string;
  user_email: string;
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  pass_threshold: number;
  wrong: GradedWrong[];
};

export type TestUserStatRow = {
  user_email: string;
  attempts: number;
  passed_count: number;
  last_completed_at: string | null;
  last_score: number | null;
  last_total: number | null;
  last_passed: boolean | null;
  avg_percent: number;
};

export type TestStatsResult = {
  total_attempts: number;
  pass_rate_percent: number;
  users: TestUserStatRow[];
  filters: {
    from: string;
    to: string;
    email: string | null;
  };
};

const REDIS_KEY = "cifra:test-attempts:v1";

let attemptsPathCache: string | null = null;

function isServerlessEnv(): boolean {
  return (
    process.env.VERCEL === "1" ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !!process.env.VERCEL_ENV
  );
}

function resolveAttemptsPath(): string {
  if (attemptsPathCache) return attemptsPathCache;

  if (isServerlessEnv() && !hasRedisStore()) {
    attemptsPathCache = path.join(os.tmpdir(), "cifra-test-attempts.json");
    return attemptsPathCache;
  }

  const localPath = path.join(process.cwd(), "data", "test-attempts.json");
  try {
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(localPath)) {
      fs.writeFileSync(localPath, "[]", "utf-8");
    }
    attemptsPathCache = localPath;
    return localPath;
  } catch {
    attemptsPathCache = path.join(os.tmpdir(), "cifra-test-attempts.json");
    return attemptsPathCache;
  }
}

function parseAttempts(raw: string): TestAttempt[] {
  const data = JSON.parse(raw) as TestAttempt[];
  return Array.isArray(data) ? data : [];
}

function readAttemptsFile(): TestAttempt[] {
  const filePath = resolveAttemptsPath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf-8");
      return [];
    }
    return parseAttempts(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    console.error("[Цифра] readAttemptsFile:", e);
    return [];
  }
}

function writeAttemptsFile(rows: TestAttempt[]): void {
  const filePath = resolveAttemptsPath();
  const payload = JSON.stringify(rows, null, 2);
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, payload, "utf-8");
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "EROFS" || err.code === "EACCES") {
      attemptsPathCache = path.join(os.tmpdir(), "cifra-test-attempts.json");
      const dir = path.dirname(attemptsPathCache);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(attemptsPathCache, payload, "utf-8");
      return;
    }
    throw e;
  }
}

async function readAttempts(): Promise<TestAttempt[]> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get<string>(REDIS_KEY);
      if (!raw) {
        await writeAttempts([]);
        return [];
      }
      if (typeof raw === "string") return parseAttempts(raw);
      return parseAttempts(JSON.stringify(raw));
    } catch (e) {
      console.error("[Цифра] readAttempts redis:", e);
      return [];
    }
  }
  return readAttemptsFile();
}

async function writeAttempts(rows: TestAttempt[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY, JSON.stringify(rows));
    return;
  }
  writeAttemptsFile(rows);
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

export function getDefaultTestStatsRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { from: fmt(from), to: fmt(now) };
}

export async function addTestAttempt(input: {
  userEmail: string;
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  wrong: GradedWrong[];
}): Promise<TestAttempt> {
  const row: TestAttempt = {
    id: nanoid(),
    completed_at: new Date().toISOString(),
    user_email: normEmail(input.userEmail),
    score: input.score,
    total: input.total,
    percent: input.percent,
    passed: input.passed,
    pass_threshold: TEST_BANK_CONFIG.passThreshold,
    wrong: input.wrong,
  };
  const rows = await readAttempts();
  rows.push(row);
  await writeAttempts(rows);
  return row;
}

export async function getTestStats(filters: {
  from: string;
  to: string;
  email?: string | null;
}): Promise<TestStatsResult> {
  const fromDate = parseDateBoundary(filters.from, false);
  const toDate = parseDateBoundary(filters.to, true);
  if (!fromDate || !toDate) {
    throw new Error("INVALID_DATE_RANGE");
  }

  const emailFilter = filters.email?.trim()
    ? normEmail(filters.email)
    : null;

  const rows = await readAttempts();
  const filtered = rows.filter((row) => {
    const at = new Date(row.completed_at);
    if (at < fromDate || at > toDate) return false;
    if (emailFilter && row.user_email !== emailFilter) return false;
    return true;
  });

  const byUser = new Map<string, TestAttempt[]>();
  for (const row of filtered) {
    const list = byUser.get(row.user_email) ?? [];
    list.push(row);
    byUser.set(row.user_email, list);
  }

  const users: TestUserStatRow[] = [...byUser.entries()]
    .map(([user_email, attempts]) => {
      const sorted = [...attempts].sort(
        (a, b) =>
          new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );
      const last = sorted[0];
      const passed_count = attempts.filter((a) => a.passed).length;
      const avg_percent =
        attempts.length > 0
          ? Math.round(
              (attempts.reduce((s, a) => s + a.percent, 0) / attempts.length) * 10
            ) / 10
          : 0;
      return {
        user_email,
        attempts: attempts.length,
        passed_count,
        last_completed_at: last?.completed_at ?? null,
        last_score: last?.score ?? null,
        last_total: last?.total ?? null,
        last_passed: last?.passed ?? null,
        avg_percent,
      };
    })
    .sort((a, b) => a.user_email.localeCompare(b.user_email, "ru"));

  const passedTotal = filtered.filter((r) => r.passed).length;

  return {
    total_attempts: filtered.length,
    pass_rate_percent:
      filtered.length > 0
        ? Math.round((passedTotal / filtered.length) * 1000) / 10
        : 0,
    users,
    filters: {
      from: filters.from,
      to: filters.to,
      email: emailFilter,
    },
  };
}
