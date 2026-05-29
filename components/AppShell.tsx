"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KeyRound, LogOut, Phone } from "lucide-react";

type Props = {
  isAdmin: boolean;
  children: React.ReactNode;
};

export function AppShell({ isAdmin, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="app-header">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-eyebrow">Аналитическая платформа</p>
            <h1 className="text-brand-title">Цифра</h1>
          </div>
          <nav className="flex items-center gap-3" aria-label="Навигация">
            <Link
              href="/"
              className={`header-icon-btn ${pathname === "/" ? "header-icon-btn--active" : ""}`}
              aria-label="Звонок"
              title="Звонок"
            >
              <Phone size={20} strokeWidth={2} />
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
      <main className="mx-auto max-w-lg px-4 pb-8 pt-4">{children}</main>
    </div>
  );
}
