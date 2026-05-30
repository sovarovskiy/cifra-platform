import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ReferenceSheetEmbed } from "@/components/ReferenceSheetEmbed";
import { ReferenceTable } from "@/components/ReferenceTable";
import { getCurrentUser } from "@/lib/auth";
import { fetchReferenceTable } from "@/lib/google-reference";
import { REFERENCE_SETUP_HINT, REFERENCE_SHEET_TITLE } from "@/lib/reference-sheet";

export const dynamic = "force-dynamic";

export default async function ReferencePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await fetchReferenceTable();
  const useApiTable = rows !== null && rows.length > 0;

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <p className="text-step-label">Референс</p>

        <article className="content-card info-article mt-4 flex-1">
          <h1 className="text-brand-title text-lg">{REFERENCE_SHEET_TITLE}</h1>
          <p className="text-hint mt-2">
            Актуальные данные из Google Таблицы — только просмотр, без формул
          </p>

          {useApiTable ? (
            <ReferenceTable rows={rows} />
          ) : (
            <>
              <ReferenceSheetEmbed title={REFERENCE_SHEET_TITLE} />
              <p className="info-note mt-3 text-sm">{REFERENCE_SETUP_HINT}</p>
            </>
          )}

          <a href="/api/reference/pdf" className="menu-item mt-4">
            <span className="menu-item-text">
              <span className="menu-item-title">Скачать PDF</span>
            </span>
          </a>
        </article>
      </div>
    </AppShell>
  );
}
