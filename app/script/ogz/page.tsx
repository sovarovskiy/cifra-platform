import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CallWizard } from "@/components/CallWizard";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OgzScriptPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell isAdmin={user.isAdmin}>
      <CallWizard />
    </AppShell>
  );
}
