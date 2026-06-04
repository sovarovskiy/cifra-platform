import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MAIN_MENU_SECTIONS } from "@/lib/app-menu";
import { HomeButton } from "@/components/HomeButton";

export function MainMenu() {
  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col">
      <p className="text-step-label">Меню</p>
      <p className="mt-2 text-sm text-white/70">Выберите раздел</p>

      <nav
        className="mt-6 flex flex-col gap-4"
        aria-label="Главные разделы приложения"
      >
        {MAIN_MENU_SECTIONS.map((section) => (
          <Link
            key={section.id}
            href={section.href}
            className="menu-item menu-item--main"
          >
            <span className="menu-item-text">
              <span className="menu-item-title">{section.title}</span>
              <span className="menu-item-desc">{section.description}</span>
            </span>
            <ChevronRight
              size={24}
              strokeWidth={2}
              aria-hidden
              className="shrink-0 opacity-90"
            />
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <HomeButton />
      </div>
    </div>
  );
}
