import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SalesModelNavLink } from "@/components/SalesModelNavLink";
import { getCurrentUser } from "@/lib/auth";
import { listJtbdSegments } from "@/lib/jtbd";

export const dynamic = "force-dynamic";

export default async function JtbdPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const segments = listJtbdSegments();

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <p className="text-step-label">JTBD</p>
        <p className="mt-2 text-sm text-white/70">
          Jobs To Be Done — сегменты клиентов, их задачи и формулировки для продаж
        </p>

        <nav className="mt-6 flex flex-col gap-3" aria-label="Сегменты JTBD">
          {segments.map((segment) => (
            <SalesModelNavLink
              key={segment.id}
              href={`/jtbd/${encodeURIComponent(segment.id)}`}
              meta={segment.id}
              title={segment.title}
              subtitle={segment.inherits ? `На базе ${segment.inherits}` : undefined}
            />
          ))}
        </nav>
      </div>
    </AppShell>
  );
}
