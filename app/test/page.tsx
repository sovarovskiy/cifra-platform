import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TestQuiz } from "@/components/TestQuiz";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell isAdmin={user.isAdmin}>
      <TestQuiz />
    </AppShell>
  );
}
