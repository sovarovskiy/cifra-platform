import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MenuNav } from "@/components/MenuNav";
import { getCurrentUser } from "@/lib/auth";
import { OGZ_MENU_ITEMS } from "@/lib/app-menu";

export const dynamic = "force-dynamic";

export default async function MenuOgzPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell isAdmin={user.isAdmin}>
      <MenuNav
        label="ОГЗ"
        backHref="/menu"
        backLabel="Меню"
        items={OGZ_MENU_ITEMS}
        ariaLabel="Разделы ОГЗ"
      />
    </AppShell>
  );
}
