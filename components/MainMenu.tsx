import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { APP_MENU_ITEMS } from "@/lib/app-menu";
import { HomeButton } from "@/components/HomeButton";

export function MainMenu() {
  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
      <p className="text-step-label">Меню</p>
      <p className="mt-2 text-sm text-white/70">Выберите раздел</p>

      <nav className="mt-6 flex flex-col gap-3" aria-label="Разделы приложения">
        {APP_MENU_ITEMS.map((item) => (
          <Link key={item.id} href={item.href} className="menu-item">
            <span className="menu-item-text">
              <span className="menu-item-title">{item.title}</span>
              <span className="menu-item-desc">{item.description}</span>
            </span>
            <ChevronRight size={22} strokeWidth={2} aria-hidden className="shrink-0 opacity-90" />
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <HomeButton />
      </div>
    </div>
  );
}
