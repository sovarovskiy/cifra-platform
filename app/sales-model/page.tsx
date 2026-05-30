import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SalesModelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <p className="text-step-label">Модель продаж</p>
        <div className="content-card mt-4 flex-1">
          <h2 className="text-brand-title text-lg">Раздел в разработке</h2>
          <p className="text-hint mt-3">
            Здесь будет модель продаж: этапы воронки, действия менеджера и связь с CRM.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
