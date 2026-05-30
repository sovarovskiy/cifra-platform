import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AdminPanel } from "@/components/AdminPanel";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/");

  return (
    <AppShell isAdmin={user.isAdmin}>
      <AdminPanel />
    </AppShell>
  );
}
