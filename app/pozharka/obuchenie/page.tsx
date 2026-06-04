import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PozharkaObucheniePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <Link href="/menu/pozharka" className="info-breadcrumb">
          ← Пожарка
        </Link>
        <p className="text-step-label mt-3">Обучение</p>

        <article className="content-card info-article mt-4 flex-1">
          <p className="text-sm text-white/80">
            Раздел в разработке. Здесь будут материалы и задания по пожарной
            безопасности.
          </p>
        </article>
      </div>
    </AppShell>
  );
}
