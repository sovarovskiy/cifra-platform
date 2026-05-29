import { NextResponse } from "next/server";
import { issueLoginCode, isEmailAllowed, normalizeEmail } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: "Укажите email" }, { status: 400 });
    }
    const normalized = normalizeEmail(email);
    if (!isEmailAllowed(normalized)) {
      return NextResponse.json(
        {
          error:
            "Доступ запрещён. Проверьте ADMIN_EMAIL в .env и перезапустите сервер.",
        },
        { status: 403 }
      );
    }
    const code = issueLoginCode(normalized);
    return NextResponse.json({
      ok: true,
      message: "Код показан на экране ниже.",
      devCode: code,
    });
  } catch (e) {
    console.error("[Цифра] request-code:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка сервера" },
      { status: 500 }
    );
  }
}
