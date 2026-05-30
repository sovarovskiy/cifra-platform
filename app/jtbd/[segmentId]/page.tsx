import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { resolveJtbd } from "@/lib/jtbd";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ segmentId: string }> };

export default async function JtbdSegmentPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { segmentId } = await params;
  const segment = resolveJtbd(decodeURIComponent(segmentId));
  if (!segment) notFound();

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <p className="text-step-label">JTBD · {segment.id}</p>
        <Link href="/jtbd" className="info-breadcrumb mt-2">
          ← Все сегменты
        </Link>

        <article className="content-card info-article mt-4 flex-1">
          <h1 className="text-brand-title text-lg">{segment.title}</h1>
          <p className="info-code mt-1">Код сегмента: {segment.id}</p>

          {segment.inherits && (
            <p className="info-note mt-3">
              Вариант на базе сегмента{" "}
              <Link href={`/jtbd/${encodeURIComponent(segment.inherits)}`} className="info-link">
                {segment.inherits}
              </Link>
            </p>
          )}

          {segment.mainTask && (
            <section className="info-section">
              <h2 className="info-section-title">Главная задача клиента</h2>
              <p className="info-paragraph">{segment.mainTask}</p>
            </section>
          )}

          {segment.salesLanguage && (
            <section className="info-section">
              <h2 className="info-section-title">Язык продаж</h2>
              <p className="info-quote">{segment.salesLanguage}</p>
            </section>
          )}
        </article>
      </div>
    </AppShell>
  );
}
