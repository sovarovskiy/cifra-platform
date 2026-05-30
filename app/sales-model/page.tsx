import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SalesModelNavLink } from "@/components/SalesModelNavLink";
import { getCurrentUser } from "@/lib/auth";
import { SALES_MODEL_SECTIONS } from "@/lib/sales-model-content";

export const dynamic = "force-dynamic";

export default async function SalesModelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <p className="text-step-label">Модель продаж</p>
        <p className="mt-2 text-sm text-white/70">Выберите раздел</p>

        <nav className="mt-6 flex flex-col gap-3" aria-label="Разделы модели продаж">
          {SALES_MODEL_SECTIONS.map((section) => (
            <SalesModelNavLink
              key={section.id}
              href={`/sales-model/${section.id}`}
              meta={`Раздел ${section.number}`}
              title={section.title}
              subtitle={`${section.parts.length} подразделов`}
            />
          ))}
        </nav>
      </div>
    </AppShell>
  );
}
