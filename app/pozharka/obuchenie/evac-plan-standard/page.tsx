import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PozharkaArticleView } from "@/components/PozharkaArticleView";
import { getCurrentUser } from "@/lib/auth";
import { getPozharkaArticleConfig } from "@/lib/pozharka-article-registry";

export const dynamic = "force-dynamic";

export default async function EvacPlanStandardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const config = getPozharkaArticleConfig("evac-plan-standard");
  if (!config) notFound();

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <Link href="/pozharka/obuchenie" className="info-breadcrumb">
          ← Обучение
        </Link>

        <PozharkaArticleView
          title={config.pageTitle}
          blocks={config.content.blocks}
          relatedTopics={config.content.relatedTopics}
          media={config.media}
          imagesTitle={config.imagesTitle}
          importHint={config.importHint}
        />
      </div>
    </AppShell>
  );
}
