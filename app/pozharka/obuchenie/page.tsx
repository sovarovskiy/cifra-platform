import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MenuNav } from "@/components/MenuNav";
import { getCurrentUser } from "@/lib/auth";
import { OBUCHENIE_MENU_ITEMS } from "@/lib/app-menu";

export const dynamic = "force-dynamic";

export default async function PozharkaObucheniePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell isAdmin={user.isAdmin}>
      <MenuNav
        label="Обучение"
        backHref="/menu/pozharka"
        backLabel="Пожарка"
        items={OBUCHENIE_MENU_ITEMS}
        ariaLabel="Материалы обучения"
      />
    </AppShell>
  );
}
