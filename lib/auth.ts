import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import {
  createSessionRow,
  deleteSessionByToken,
  getSessionByToken,
  isAdminEmail,
  isEmailAllowed,
} from "./store";

const COOKIE_NAME = "cifra_session";
const SESSION_DAYS = 14;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export { isEmailAllowed };

export function isAdmin(email: string): boolean {
  return isAdminEmail(email);
}

export function createSession(email: string, deviceId: string): string {
  const token = randomBytes(32).toString("hex");
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  createSessionRow(token, email, deviceId, expires.toISOString());
  return token;
}

export type SessionUser = {
  email: string;
  isAdmin: boolean;
  deviceId: string;
};

export function getSessionFromToken(
  token: string,
  deviceId: string
): SessionUser | null {
  const row = getSessionByToken(token);
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    deleteSessionByToken(token);
    return null;
  }
  if (row.device_id !== deviceId) return null;

  return {
    email: row.email,
    isAdmin: isAdmin(row.email),
    deviceId: row.device_id,
  };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const deviceId = cookieStore.get("cifra_device")?.value;
  if (!token || !deviceId) return null;
  return getSessionFromToken(token, deviceId);
}

export function setSessionCookies(
  token: string,
  deviceId: string
): { name: string; value: string; options: object }[] {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const secure = process.env.NODE_ENV === "production";
  return [
    {
      name: COOKIE_NAME,
      value: token,
      options: {
        httpOnly: true,
        secure,
        sameSite: "lax" as const,
        path: "/",
        maxAge,
      },
    },
    {
      name: "cifra_device",
      value: deviceId,
      options: {
        httpOnly: true,
        secure,
        sameSite: "lax" as const,
        path: "/",
        maxAge,
      },
    },
  ];
}

export function clearSessionCookies(): { name: string; options: object }[] {
  return [
    { name: COOKIE_NAME, options: { path: "/", maxAge: 0 } },
    { name: "cifra_device", options: { path: "/", maxAge: 0 } },
  ];
}

const pendingCodes = new Map<
  string,
  { code: string; expires: number }
>();

export function issueLoginCode(email: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  pendingCodes.set(normalizeEmail(email), {
    code,
    expires: Date.now() + 10 * 60 * 1000,
  });
  console.log(`[Цифра] Код входа для ${email}: ${code}`);
  return code;
}

export function consumeLoginCode(email: string, code: string): boolean {
  const key = normalizeEmail(email);
  const pending = pendingCodes.get(key);
  if (!pending || pending.expires < Date.now()) {
    pendingCodes.delete(key);
    return false;
  }
  if (pending.code !== code.trim()) return false;
  pendingCodes.delete(key);
  return true;
}

export { COOKIE_NAME };
