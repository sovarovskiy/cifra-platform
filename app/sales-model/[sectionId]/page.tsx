import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SalesModelNavLink } from "@/components/SalesModelNavLink";
import { getCurrentUser } from "@/lib/auth";
import { getSalesModelSection } from "@/lib/sales-model-content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ sectionId: string }> };

export default async function SalesModelSectionPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { sectionId } = await params;
  const section = getSalesModelSection(sectionId);
  if (!section) notFound();

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <p className="text-step-label">Модель продаж · раздел {section.number}</p>
        <h2 className="mt-2 text-base font-semibold leading-snug text-white">
          {section.title}
        </h2>

        <nav className="mt-6 flex flex-col gap-3" aria-label="Подразделы">
          {section.parts.map((part) => (
            <SalesModelNavLink
              key={part.id}
              href={`/sales-model/${section.id}/${part.id}`}
              meta={part.number}
              title={part.title}
            />
          ))}
        </nav>
      </div>
    </AppShell>
  );
}
