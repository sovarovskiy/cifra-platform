import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  for (const c of clearSessionCookies()) {
    res.cookies.set(c.name, "", c.options as Parameters<typeof res.cookies.set>[2]);
  }
  return res;
}
