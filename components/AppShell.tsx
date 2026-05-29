"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  email: string;
  isAdmin: boolean;
  children: React.ReactNode;
};

export function AppShell({ email, isAdmin, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="glass-nav sticky top-0 z-20">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
              Аналитическая платформа
            </p>
            <h1 className="text-lg font-bold text-slate-900">Цифра</h1>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className={`btn-ghost ${pathname === "/" ? "nav-link-active" : ""}`}
            >
              Звонок
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`btn-ghost ${pathname === "/admin" ? "nav-link-active" : ""}`}
              >
                Доступ
              </Link>
            )}
            <span className="hidden text-xs text-slate-500 sm:inline">{email}</span>
            <button type="button" onClick={logout} className="btn-ghost text-red-600">
              Выйти
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
