import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MainMenu } from "@/components/MainMenu";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell isAdmin={user.isAdmin}>
      <MainMenu />
    </AppShell>
  );
}
