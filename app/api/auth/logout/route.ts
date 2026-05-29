import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookies, COOKIE_NAME } from "@/lib/auth";
import { deleteSessionByToken } from "@/lib/store";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) deleteSessionByToken(token);
  const res = NextResponse.json({ ok: true });
  for (const c of clearSessionCookies()) {
    res.cookies.set(c.name, "", c.options as Parameters<typeof res.cookies.set>[2]);
  }
  return res;
}
