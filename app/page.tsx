import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DocumentPagesView } from "@/components/DocumentPagesView";
import { getCurrentUser } from "@/lib/auth";
import { getHomeOgzContent } from "@/lib/home-ogz";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const content = getHomeOgzContent();

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <p className="text-step-label">Главная</p>

        <article className="content-card info-article mt-4 flex-1">
          <h1 className="text-brand-title text-lg">ОГЗ</h1>

          <DocumentPagesView
            urls={content.imageUrls}
            title="ОГЗ"
            pdfUrl={content.pdfUrl}
            importHint="импорт-огз-главная.cmd"
          />
        </article>
      </div>
    </AppShell>
  );
}
