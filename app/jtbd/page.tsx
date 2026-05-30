import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SalesModelNavLink } from "@/components/SalesModelNavLink";
import { getCurrentUser } from "@/lib/auth";
import { JTBD_INTRO_TITLE } from "@/lib/jtbd-intro";
import { listJtbdPdfSegments } from "@/lib/jtbd";

export const dynamic = "force-dynamic";

export default async function JtbdPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const segments = listJtbdPdfSegments();

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <p className="text-step-label">JTBD</p>
        <p className="mt-2 text-sm text-white/70">
          Jobs To Be Done — сегменты клиентов, задачи и разборы для продаж
        </p>

        <nav className="mt-6 flex flex-col gap-3" aria-label="Раздел JTBD">
          <SalesModelNavLink
            href="/jtbd/intro"
            meta="Вводный"
            title={JTBD_INTRO_TITLE}
            subtitle="Зачем сегменты и как ими пользоваться"
          />

          <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-white/50">
            Сегменты
          </p>

          {segments.map((segment) => (
            <SalesModelNavLink
              key={segment.id}
              href={`/jtbd/${encodeURIComponent(segment.id)}`}
              meta={segment.id}
              title={segment.title}
              subtitle="Разбор с картинками"
            />
          ))}
        </nav>
      </div>
    </AppShell>
  );
}
