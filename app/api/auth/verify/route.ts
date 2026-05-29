import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSession,
  isEmailAllowed,
  normalizeEmail,
  OTP_COOKIE_NAME,
  setSessionCookies,
  verifyLoginCode,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, code, deviceId } = (await req.json()) as {
      email?: string;
      code?: string;
      deviceId?: string;
    };

    if (!email || !code || !deviceId) {
      return NextResponse.json({ error: "Неполные данные" }, { status: 400 });
    }

    const normalized = normalizeEmail(email);
    if (!isEmailAllowed(normalized)) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const otpCookie = cookieStore.get(OTP_COOKIE_NAME)?.value;

    if (!verifyLoginCode(normalized, code, otpCookie)) {
      return NextResponse.json(
        {
          error:
            "Неверный или просроченный код. Нажмите «Другой email» или запросите код заново.",
        },
        { status: 401 }
      );
    }

    const token = createSession(normalized, deviceId);
    const res = NextResponse.json({ ok: true, email: normalized });

    for (const c of setSessionCookies(token, deviceId)) {
      res.cookies.set(
        c.name,
        c.value,
        c.options as Parameters<typeof res.cookies.set>[2]
      );
    }

    res.cookies.set(OTP_COOKIE_NAME, "", { path: "/", maxAge: 0 });

    return res;
  } catch (e) {
    console.error("[Цифра] verify:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Ошибка сервера при входе.",
      },
      { status: 500 }
    );
  }
}
