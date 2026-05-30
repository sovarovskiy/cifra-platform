import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { JTBD_INTRO_PARAGRAPHS, JTBD_INTRO_TITLE } from "@/lib/jtbd-intro";

export const dynamic = "force-dynamic";

export default async function JtbdIntroPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <p className="text-step-label">JTBD</p>
        <Link href="/jtbd" className="info-breadcrumb mt-2">
          ← Раздел JTBD
        </Link>

        <article className="content-card info-article mt-4 flex-1">
          <h1 className="text-brand-title text-lg">{JTBD_INTRO_TITLE}</h1>
          <div className="info-prose mt-4">
            {JTBD_INTRO_PARAGRAPHS.map((paragraph, index) => (
              <p key={index} className="info-paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>
    </AppShell>
  );
}
