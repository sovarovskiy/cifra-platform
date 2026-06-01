import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listAllowedEmails } from "@/lib/store";
import { getDefaultTestStatsRange, getTestStats } from "@/lib/test-stats";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const defaults = getDefaultTestStatsRange();
  const from = url.searchParams.get("from") ?? defaults.from;
  const to = url.searchParams.get("to") ?? defaults.to;
  const email = url.searchParams.get("email");

  try {
    const stats = await getTestStats({ from, to, email });
    const users = (await listAllowedEmails()).map((row) => row.email);
    return NextResponse.json({ ...stats, users_list: users });
  } catch (e) {
    if (e instanceof Error && e.message === "INVALID_DATE_RANGE") {
      return NextResponse.json({ error: "Некорректный период дат" }, { status: 400 });
    }
    console.error("[admin/test/stats]", e);
    return NextResponse.json({ error: "Не удалось загрузить статистику" }, { status: 500 });
  }
}
