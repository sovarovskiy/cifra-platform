import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/** Проверка активной сессии (одно устройство) */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { active: false, reason: "session_invalid" },
      { status: 401 }
    );
  }
  return NextResponse.json({ active: true, email: user.email, isAdmin: user.isAdmin });
}
