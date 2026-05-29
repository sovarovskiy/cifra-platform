import { NextResponse } from "next/server";
import {
  consumeLoginCode,
  createSession,
  isEmailAllowed,
  normalizeEmail,
  setSessionCookies,
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

    if (!consumeLoginCode(normalized, code)) {
      return NextResponse.json(
        { error: "Неверный или просроченный код. Запросите новый." },
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
    return res;
  } catch (e) {
    console.error("[Цифра] verify:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Ошибка сервера при входе. Перезапустите npm run dev.",
      },
      { status: 500 }
    );
  }
}
