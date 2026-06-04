import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PozharkaArticleView } from "@/components/PozharkaArticleView";
import { getCurrentUser } from "@/lib/auth";
import { getSp551ParkingsMedia } from "@/lib/pozharka-sp551-parkings";

export const dynamic = "force-dynamic";

export default async function Sp551ParkingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const media = getSp551ParkingsMedia();

  return (
    <AppShell isAdmin={user.isAdmin}>
      <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
        <Link href="/pozharka/obuchenie" className="info-breadcrumb">
          ← Обучение
        </Link>

        <PozharkaArticleView media={media} />
      </div>
    </AppShell>
  );
}
