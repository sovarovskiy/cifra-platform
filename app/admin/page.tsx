import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AdminEmails } from "@/components/AdminEmails";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/");

  return (
    <AppShell email={user.email} isAdmin={user.isAdmin}>
      <AdminEmails />
    </AppShell>
  );
}
