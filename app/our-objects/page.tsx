import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DocumentPagesView } from "@/components/DocumentPagesView";
import { getCurrentUser } from "@/lib/auth";
import { getOurObjectsContent } from "@/lib/our-objects";

export const dynamic = "force-dynamic";

export default async function OurObjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const content = getOurObjectsContent();

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <p className="text-step-label">Наши объекты</p>

        <article className="content-card info-article mt-4 flex-1">
          <h1 className="text-brand-title text-lg">Наши объекты</h1>
          <p className="text-hint mt-2">
            Примеры реализованных проектов — листайте вниз
          </p>

          <DocumentPagesView
            urls={content.imageUrls}
            title="Наши объекты"
            pdfUrl={content.pdfUrl}
            importHint="импорт-наши-объекты.cmd"
          />
        </article>
      </div>
    </AppShell>
  );
}
