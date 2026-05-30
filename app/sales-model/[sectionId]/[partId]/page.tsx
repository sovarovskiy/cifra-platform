import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SalesModelBlocks } from "@/components/SalesModelContent";
import { getCurrentUser } from "@/lib/auth";
import { getSalesModelPart, getSalesModelSection } from "@/lib/sales-model-content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ sectionId: string; partId: string }> };

export default async function SalesModelPartPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { sectionId, partId } = await params;
  const section = getSalesModelSection(sectionId);
  const part = getSalesModelPart(sectionId, partId);
  if (!section || !part) notFound();

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <p className="text-step-label">
          Модель продаж · {part.number}
        </p>
        <Link href={`/sales-model/${section.id}`} className="sales-breadcrumb mt-2">
          ← Раздел {section.number}
        </Link>

        <article className="content-card sales-article mt-4 flex-1">
          <h1 className="text-brand-title text-lg">{part.title}</h1>
          <SalesModelBlocks blocks={part.blocks} />
        </article>
      </div>
    </AppShell>
  );
}
