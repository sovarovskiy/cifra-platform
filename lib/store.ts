import fs from "fs";
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

const dataDir = path.join(process.cwd(), "data");
const storePath = path.join(dataDir, "store.json");

function defaultStore(): StoreData {
  return { allowed_emails: [], sessions: [] };
}

function readStore(): StoreData {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(storePath)) {
      writeStore(defaultStore());
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
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf-8");
}

function norm(email: string): string {
  return email.trim().toLowerCase();
}

/** Главный админ из .env — всегда в списке с правами admin (нельзя удалить через UI) */
export function getRootAdminEmail(): string | null {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return admin || null;
}

export function isRootAdmin(email: string): boolean {
  const root = getRootAdminEmail();
  return !!root && norm(email) === root;
}

export function ensureAdminSeed(): void {
  const admin = getRootAdminEmail();
  if (!admin) return;
  const data = readStore();
  const idx = data.allowed_emails.findIndex((e) => norm(e.email) === admin);
  if (idx >= 0) {
    if (!data.allowed_emails[idx].is_admin) {
      data.allowed_emails[idx].is_admin = true;
      writeStore(data);
    }
    return;
  }
  data.allowed_emails.push({
    email: admin,
    is_admin: true,
    created_at: new Date().toISOString(),
  });
  writeStore(data);
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
