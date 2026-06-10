"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { isIos, isStandalonePwa } from "@/lib/pwa";

type Props = {
  variant?: "banner" | "welcome";
  onContinueInBrowser?: () => void;
};

export function InstallAppPrompt({
  variant = "banner",
  onContinueInBrowser,
}: Props) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalonePwa()) {
      setHidden(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (hidden) return null;

  const isWelcome = variant === "welcome";

  async function install() {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setHidden(true);
      setDeferred(null);
      return;
    }
    if (isIos()) {
      setShowIosHelp(true);
    }
  }

  return (
    <div
      className={
        isWelcome
          ? "content-card mb-6 overflow-hidden p-0"
          : "content-card fixed bottom-0 left-0 right-0 z-30 mx-4 mb-4 rounded-[20px] p-4 shadow-lg"
      }
    >
      <div className={isWelcome ? "bg-brand p-6 text-white" : "p-1"}>
        <div className="flex items-start gap-4">
          <BrandLogo size={isWelcome ? 64 : 48} className="shrink-0 rounded-[14px] shadow-icon" />
          <div className="min-w-0">
            <p className={isWelcome ? "text-eyebrow text-white/80" : "text-eyebrow"}>
              PWA
            </p>
            <h2
              className={
                isWelcome ? "mt-1 text-xl font-bold text-white" : "text-brand-title mt-1"
              }
            >
              Аналитическая платформа «Цифра»
            </h2>
          </div>
        </div>
        <p
          className={
            isWelcome ? "mt-3 text-sm text-white/90" : "text-hint mt-2"
          }
        >
          Установите приложение на главный экран — так удобнее на звонках.
        </p>

        <div className={`flex flex-col gap-3 ${isWelcome ? "mt-5" : "mt-4"}`}>
          <button
            type="button"
            onClick={install}
            className={
              isWelcome
                ? "flex min-h-[52px] items-center justify-center rounded-[14px] bg-white text-base font-semibold text-brand shadow-md"
                : "btn-primary"
            }
          >
            Установить приложение
          </button>
          {onContinueInBrowser && isWelcome && (
            <button
              type="button"
              onClick={onContinueInBrowser}
              className="flex min-h-[52px] items-center justify-center rounded-[14px] border border-white/50 text-base font-semibold text-white hover:bg-white/10"
            >
              Продолжить в браузере
            </button>
          )}
        </div>
      </div>

      {showIosHelp && (
        <div className="border-t border-[#E2E8F0] bg-white p-4 text-sm text-ink">
          <p className="font-semibold">iPhone / iPad (Safari)</p>
          <ol className="text-hint mt-2 list-inside list-decimal space-y-1">
            <li>«Поделиться» внизу</li>
            <li>«На экран Домой»</li>
            <li>«Добавить»</li>
          </ol>
          <button
            type="button"
            className="btn-ghost-link mt-3 w-full"
            onClick={() => setShowIosHelp(false)}
          >
            Понятно
          </button>
        </div>
      )}
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
