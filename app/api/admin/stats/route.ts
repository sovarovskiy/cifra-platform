import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCallStats, getDefaultStatsRange } from "@/lib/call-stats";
import { listAllowedEmails } from "@/lib/store";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const defaults = getDefaultStatsRange();
  const from = url.searchParams.get("from") ?? defaults.from;
  const to = url.searchParams.get("to") ?? defaults.to;
  const email = url.searchParams.get("email");

  try {
    const stats = await getCallStats({ from, to, email });
    const users = (await listAllowedEmails()).map((row) => row.email);
    return NextResponse.json({ ...stats, users });
  } catch (e) {
    if (e instanceof Error && e.message === "INVALID_DATE_RANGE") {
      return NextResponse.json({ error: "Некорректный период дат" }, { status: 400 });
    }
    console.error("[admin/stats]", e);
    return NextResponse.json({ error: "Не удалось загрузить статистику" }, { status: 500 });
  }
}
