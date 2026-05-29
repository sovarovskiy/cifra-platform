import { NextResponse } from "next/server";
import { ensureAdminSeed } from "@/lib/store";

export async function GET() {
  try {
    ensureAdminSeed();
    return NextResponse.json({
      ok: true,
      adminConfigured: !!process.env.ADMIN_EMAIL,
      hasSecret: !!process.env.SESSION_SECRET,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
