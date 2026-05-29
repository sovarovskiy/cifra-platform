import { NextResponse } from "next/server";
import {
  canWriteStoreForDebug,
  ensureAdminSeed,
  getPersistenceMode,
  getPersistenceWarning,
  getResolvedStorePathForDebug,
} from "@/lib/store";

export async function GET() {
  try {
    await ensureAdminSeed();
    return NextResponse.json({
      ok: true,
      adminConfigured: !!process.env.ADMIN_EMAIL,
      hasSecret: !!process.env.SESSION_SECRET,
      vercel: process.env.VERCEL ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      vercelSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      storePath: getResolvedStorePathForDebug(),
      storeWritable: canWriteStoreForDebug(),
      persistence: getPersistenceMode(),
      persistenceWarning: getPersistenceWarning(),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown" },
      { status: 500 }
    );
  }
}
