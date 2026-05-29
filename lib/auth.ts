import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import {
  isAdminEmail,
  isEmailAllowed,
} from "./store";

const COOKIE_NAME = "cifra_session";
const OTP_COOKIE_NAME = "cifra_otp";
const SESSION_DAYS = 14;
const OTP_MINUTES = 10;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 8) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set in environment variables");
    }
    return "cifra-dev-fallback-secret-not-for-production";
  }
  return s;
}

function signOtp(email: string, code: string, expiresAt: number): string {
  return createHmac("sha256", secret())
    .update(`${normalizeEmail(email)}:${code.trim()}:${expiresAt}`)
    .digest("hex");
}

function signSession(email: string, deviceId: string, expiresAt: number): string {
  return createHmac("sha256", secret())
    .update(`${normalizeEmail(email)}:${deviceId}:${expiresAt}`)
    .digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export { isEmailAllowed };

export function isAdmin(email: string): boolean {
  return isAdminEmail(email);
}

export function createSession(email: string, deviceId: string): string {
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const nonce = randomBytes(8).toString("hex");
  const payload = {
    e: normalizeEmail(email),
    d: deviceId,
    exp: expiresAt,
    n: nonce,
    sig: signSession(email, deviceId, expiresAt),
  };
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
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
  try {
    const parsed = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    ) as { e: string; d: string; exp: number; sig: string };

    if (!parsed?.e || !parsed?.d || !parsed?.exp || !parsed?.sig) return null;
    if (Date.now() > parsed.exp) return null;
    if (parsed.d !== deviceId) return null;

    const expected = signSession(parsed.e, parsed.d, parsed.exp);
    if (!safeEqualHex(parsed.sig, expected)) return null;

    return {
      email: parsed.e,
      isAdmin: isAdmin(parsed.e),
      deviceId: parsed.d,
    };
  } catch {
    return null;
  }
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

/** Код + cookie для проверки (работает на Vercel без общей памяти между запросами) */
export function issueLoginCode(email: string): {
  code: string;
  otpCookie: { value: string; maxAge: number };
} {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const exp = Date.now() + OTP_MINUTES * 60 * 1000;
  const sig = signOtp(email, code, exp);
  const payload = Buffer.from(
    JSON.stringify({ e: normalizeEmail(email), exp, sig }),
    "utf-8"
  ).toString("base64url");

  console.log(`[Цифра] Код входа для ${email}: ${code}`);

  return {
    code,
    otpCookie: {
      value: payload,
      maxAge: OTP_MINUTES * 60,
    },
  };
}

export function verifyLoginCode(
  email: string,
  code: string,
  otpCookieValue: string | undefined
): boolean {
  if (!otpCookieValue) return false;

  try {
    const parsed = JSON.parse(
      Buffer.from(otpCookieValue, "base64url").toString("utf-8")
    ) as { e: string; exp: number; sig: string };

    const normalized = normalizeEmail(email);
    if (parsed.e !== normalized) return false;
    if (Date.now() > parsed.exp) return false;

    const expected = signOtp(email, code, parsed.exp);
    return safeEqualHex(parsed.sig, expected);
  } catch {
    return false;
  }
}

export function otpCookieOptions(maxAge: number): {
  name: string;
  value: string;
  options: object;
} {
  const secure = process.env.NODE_ENV === "production";
  return {
    name: OTP_COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure,
      sameSite: "lax" as const,
      path: "/",
      maxAge,
    },
  };
}

export { COOKIE_NAME, OTP_COOKIE_NAME };
