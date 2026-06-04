import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MenuNav } from "@/components/MenuNav";
import { getCurrentUser } from "@/lib/auth";
import { POZHARKA_MENU_ITEMS } from "@/lib/app-menu";

export const dynamic = "force-dynamic";

export default async function MenuPozharkaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell isAdmin={user.isAdmin}>
      <MenuNav
        label="Пожарка"
        backHref="/menu"
        backLabel="Меню"
        items={POZHARKA_MENU_ITEMS}
        ariaLabel="Разделы пожарной безопасности"
      />
    </AppShell>
  );
}
