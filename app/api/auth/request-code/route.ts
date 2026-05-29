import { NextResponse } from "next/server";
import { checkEmailAllowed, issueLoginCode, normalizeEmail, OTP_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: "Укажите email" }, { status: 400 });
    }
    const normalized = normalizeEmail(email);
    if (!(await checkEmailAllowed(normalized))) {
      return NextResponse.json(
        {
          error:
            "Доступ запрещён. Почта должна быть в списке (ADMIN_EMAIL / ALLOWED_EMAILS на сервере).",
        },
        { status: 403 }
      );
    }

    const { code, otpCookie } = issueLoginCode(normalized);
    const res = NextResponse.json({
      ok: true,
      message: "Код показан на экране ниже. Введите его в течение 10 минут.",
      devCode: code,
    });

    const secure = process.env.NODE_ENV === "production";
    res.cookies.set(OTP_COOKIE_NAME, otpCookie.value, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: otpCookie.maxAge,
    });

    return res;
  } catch (e) {
    console.error("[Цифра] request-code:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка сервера" },
      { status: 500 }
    );
  }
}
