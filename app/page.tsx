import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <p className="text-step-label">Главная</p>

        <article className="content-card info-article mt-4">
          <p className="text-base leading-relaxed text-ink">
            Страница находится в разработке и пока не активна, но вы уже можете
            пользоваться кнопкой меню
          </p>
        </article>
      </div>
    </AppShell>
  );
}
