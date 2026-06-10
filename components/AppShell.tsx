"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KeyRound, LayoutGrid, LogOut } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { HomeButton } from "@/components/HomeButton";
import { isAppHome, isMenuPage } from "@/lib/app-menu";

type Props = {
  isAdmin: boolean;
  children: React.ReactNode;
};

export function AppShell({ isAdmin, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const onMenu = isMenuPage(pathname);
  const onAppHome = isAppHome(pathname);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="app-header">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo size={40} className="shrink-0 rounded-[10px] shadow-icon" />
            <div className="min-w-0">
              <p className="text-eyebrow">Аналитическая платформа</p>
              <h1 className="text-brand-title">Цифра</h1>
            </div>
          </div>
          <nav className="flex items-center gap-3" aria-label="Навигация">
            <Link
              href="/menu"
              className={`header-icon-btn ${onMenu ? "header-icon-btn--active" : ""}`}
              aria-label="Меню"
              title="Меню"
            >
              <LayoutGrid size={20} strokeWidth={2} />
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`header-icon-btn ${pathname === "/admin" ? "header-icon-btn--active" : ""}`}
                aria-label="Доступ"
                title="Доступ"
              >
                <KeyRound size={20} strokeWidth={2} />
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="header-icon-btn--logout flex items-center justify-center"
              aria-label="Выйти"
              title="Выйти"
            >
              <LogOut size={20} strokeWidth={2} />
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-lg min-w-0 px-4 pb-8 pt-4">
        {children}
        {!onAppHome && !onMenu && <HomeButton />}
      </main>
    </div>
  );
}
