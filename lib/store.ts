import fs from "fs";
import os from "os";
import path from "path";

export type AllowedEmail = {
  email: string;
  is_admin: boolean;
  created_at: string;
};

export type SessionRow = {
  token: string;
  email: string;
  device_id: string;
  created_at: string;
  expires_at: string;
};

type StoreData = {
  allowed_emails: AllowedEmail[];
  sessions: SessionRow[];
};

let storePathCache: string | null = null;

function defaultStore(): StoreData {
  return { allowed_emails: [], sessions: [] };
}

function norm(email: string): string {
  return email.trim().toLowerCase();
}

/** На Vercel диск только для чтения — пишем в /tmp */
function resolveStorePath(): string {
  if (storePathCache) return storePathCache;

  const isServerless =
    process.env.VERCEL === "1" ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !!process.env.VERCEL_ENV;

  if (isServerless) {
    storePathCache = path.join(os.tmpdir(), "cifra-store.json");
    return storePathCache;
  }

  const localPath = path.join(process.cwd(), "data", "store.json");
  try {
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(localPath)) {
      fs.writeFileSync(localPath, JSON.stringify(defaultStore(), null, 2), "utf-8");
    } else {
      fs.accessSync(dir, fs.constants.W_OK);
    }
    storePathCache = localPath;
    return localPath;
  } catch {
    storePathCache = path.join(os.tmpdir(), "cifra-store.json");
    return storePathCache;
  }
}

export function getResolvedStorePathForDebug(): string {
  return resolveStorePath();
}

export function canWriteStoreForDebug(): { ok: boolean; path: string; error?: string } {
  const p = resolveStorePath();
  try {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const probe = `${p}.probe`;
    fs.writeFileSync(probe, "ok", "utf-8");
    fs.unlinkSync(probe);
    return { ok: true, path: p };
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    return { ok: false, path: p, error: err.code ? `${err.code}: ${err.message}` : String(err) };
  }
}

function readStore(): StoreData {
  const storePath = resolveStorePath();
  try {
    const dir = path.dirname(storePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(storePath)) {
      writeStore(defaultStore());
      return defaultStore();
    }
    const raw = fs.readFileSync(storePath, "utf-8");
    const data = JSON.parse(raw) as StoreData;
    if (!Array.isArray(data.allowed_emails)) data.allowed_emails = [];
    if (!Array.isArray(data.sessions)) data.sessions = [];
    return data;
  } catch (e) {
    console.error("[Цифра] readStore:", e);
    return defaultStore();
  }
}

function writeStore(data: StoreData): void {
  let storePath = resolveStorePath();
  const payload = JSON.stringify(data, null, 2);

  try {
    const dir = path.dirname(storePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(storePath, payload, "utf-8");
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "EROFS" || err.code === "EACCES") {
      storePathCache = path.join(os.tmpdir(), "cifra-store.json");
      storePath = storePathCache;
      const dir = path.dirname(storePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(storePath, payload, "utf-8");
      return;
    }
    throw e;
  }
}

function parseEmailsFromEnv(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;\s]+/)
    .map((e) => norm(e))
    .filter(Boolean);
}

/** Главный админ из .env */
export function getRootAdminEmail(): string | null {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return admin || null;
}

export function isRootAdmin(email: string): boolean {
  const root = getRootAdminEmail();
  return !!root && norm(email) === root;
}

/** Синхронизация почт из ADMIN_EMAIL и ALLOWED_EMAILS (для Vercel) */
export function ensureAdminSeed(): void {
  const fromEnv = new Set<string>();
  const root = getRootAdminEmail();
  if (root) fromEnv.add(root);
  for (const e of parseEmailsFromEnv(process.env.ALLOWED_EMAILS)) {
    fromEnv.add(e);
  }

  if (fromEnv.size === 0) return;

  const data = readStore();
  let changed = false;

  for (const email of fromEnv) {
    const isRoot = email === root;
    const idx = data.allowed_emails.findIndex((e) => norm(e.email) === email);
    if (idx >= 0) {
      if (isRoot && !data.allowed_emails[idx].is_admin) {
        data.allowed_emails[idx].is_admin = true;
        changed = true;
      }
    } else {
      data.allowed_emails.push({
        email,
        is_admin: isRoot,
        created_at: new Date().toISOString(),
      });
      changed = true;
    }
  }

  if (changed) writeStore(data);
}

export function listAllowedEmails(): AllowedEmail[] {
  ensureAdminSeed();
  return readStore().allowed_emails.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function upsertAllowedEmail(email: string, isAdmin: boolean): void {
  const data = readStore();
  const n = norm(email);
  const idx = data.allowed_emails.findIndex((e) => norm(e.email) === n);
  if (idx >= 0) {
    data.allowed_emails[idx].is_admin = isAdmin;
  } else {
    data.allowed_emails.push({
      email: n,
      is_admin: isAdmin,
      created_at: new Date().toISOString(),
    });
  }
  writeStore(data);
}

export function deleteAllowedEmail(email: string): void {
  const data = readStore();
  const n = norm(email);
  data.allowed_emails = data.allowed_emails.filter((e) => norm(e.email) !== n);
  data.sessions = data.sessions.filter((s) => norm(s.email) !== n);
  writeStore(data);
}

export function isEmailAllowed(email: string): boolean {
  ensureAdminSeed();
  const n = norm(email);
  return readStore().allowed_emails.some((e) => norm(e.email) === n);
}

export function isAdminEmail(email: string): boolean {
  ensureAdminSeed();
  const n = norm(email);
  return readStore().allowed_emails.some(
    (e) => norm(e.email) === n && e.is_admin
  );
}

export function deleteSessionsForEmail(email: string): void {
  const data = readStore();
  const n = norm(email);
  data.sessions = data.sessions.filter((s) => norm(s.email) !== n);
  writeStore(data);
}

export function createSessionRow(
  token: string,
  email: string,
  deviceId: string,
  expiresAt: string
): void {
  const data = readStore();
  const n = norm(email);
  data.sessions = data.sessions.filter((s) => norm(s.email) === n);
  data.sessions.push({
    token,
    email: n,
    device_id: deviceId,
    created_at: new Date().toISOString(),
    expires_at: expiresAt,
  });
  writeStore(data);
}

export function getSessionByToken(token: string): SessionRow | null {
  const row = readStore().sessions.find((s) => s.token === token);
  return row ?? null;
}

export function deleteSessionByToken(token: string): void {
  const data = readStore();
  data.sessions = data.sessions.filter((s) => s.token !== token);
  writeStore(data);
}
