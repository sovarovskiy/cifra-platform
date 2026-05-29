import { NextResponse } from "next/server";
import { getCurrentUser, normalizeEmail } from "@/lib/auth";
import {
  deleteAllowedEmail,
  getPersistenceMode,
  getPersistenceWarning,
  isRootAdmin,
  listAllowedEmails,
  upsertAllowedEmail,
} from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const emails = (await listAllowedEmails()).map((e) => ({
    email: e.email,
    is_admin: e.is_admin ? 1 : 0,
    created_at: e.created_at,
  }));
  return NextResponse.json({
    emails,
    persistence: getPersistenceMode(),
    persistenceWarning: getPersistenceWarning(),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { email, isAdmin } = (await req.json()) as {
    email?: string;
    isAdmin?: boolean;
  };
  if (!email) {
    return NextResponse.json({ error: "Укажите email" }, { status: 400 });
  }
  const normalized = normalizeEmail(email);
  if (isRootAdmin(normalized) && !isAdmin) {
    return NextResponse.json(
      { error: "У главного администратора нельзя снять роль admin" },
      { status: 400 }
    );
  }
  await upsertAllowedEmail(email, !!isAdmin);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { email } = (await req.json()) as { email?: string };
  if (!email) {
    return NextResponse.json({ error: "Укажите email" }, { status: 400 });
  }
  const normalized = normalizeEmail(email);
  if (isRootAdmin(normalized)) {
    return NextResponse.json(
      { error: "Нельзя удалить главного администратора (ADMIN_EMAIL в .env)" },
      { status: 400 }
    );
  }
  await deleteAllowedEmail(email);
  return NextResponse.json({ ok: true });
}
