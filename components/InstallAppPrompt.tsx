"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isIos,
  isStandalonePwa,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa";

type Props = {
  /** Компактная полоска внизу (в приложении) или полноэкранный блок (страница входа) */
  variant?: "welcome" | "compact";
  onContinueInBrowser?: () => void;
};

export function InstallAppPrompt({
  variant = "welcome",
  onContinueInBrowser,
}: Props) {
  const [standalone, setStandalone] = useState(true);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setStandalone(isStandalonePwa());

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setStandalone(isStandalonePwa());
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (isIos()) {
      setShowIosHelp(true);
      return;
    }
    if (!deferred) {
      setShowIosHelp(true);
      return;
    }
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }, [deferred]);

  if (standalone || installed) return null;

  const isWelcome = variant === "welcome";

  return (
    <div
      className={
        isWelcome
          ? "card-panel mb-6 overflow-hidden border-2 border-brand-200 p-0"
          : "fixed bottom-0 left-0 right-0 z-30 border-t border-brand-200 bg-white/95 p-4 shadow-lg backdrop-blur-md"
      }
    >
      <div className={isWelcome ? "bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white" : ""}>
        <div className={isWelcome ? "" : "mx-auto max-w-4xl"}>
          <p
            className={
              isWelcome
                ? "text-xs font-semibold uppercase tracking-wider text-brand-100"
                : "text-xs font-semibold uppercase tracking-wider text-brand-600"
            }
          >
            Установка на смартфон
          </p>
          <h2
            className={
              isWelcome
                ? "mt-1 text-xl font-bold"
                : "mt-1 text-base font-bold text-slate-900"
            }
          >
            Аналитическая платформа «Цифра»
          </h2>
          <p
            className={
              isWelcome
                ? "mt-2 text-sm text-brand-50"
                : "mt-1 text-sm text-slate-600"
            }
          >
            Установите приложение на главный экран — так удобнее работать на
            звонках. После установки эта кнопка исчезнет.
          </p>

          <div className={`flex flex-col gap-2 ${isWelcome ? "mt-5" : "mt-3"} sm:flex-row`}>
            <button
              type="button"
              onClick={install}
              className={
                isWelcome
                  ? "rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-btn"
                  : "btn-primary flex-1"
              }
            >
              Установить приложение
            </button>
            {onContinueInBrowser && isWelcome && (
              <button
                type="button"
                onClick={onContinueInBrowser}
                className={
                  isWelcome
                    ? "rounded-xl border border-white/40 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
                    : "btn-ghost"
                }
              >
                Продолжить в браузере
              </button>
            )}
          </div>
        </div>
      </div>

      {showIosHelp && (
        <div className="border-t border-surface-muted bg-white p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">iPhone / iPad (Safari)</p>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Нажмите «Поделиться» внизу экрана</li>
            <li>Выберите «На экран Домой»</li>
            <li>Подтвердите «Добавить»</li>
          </ol>
          <p className="mt-2 text-xs text-slate-500">
            Android (Chrome): кнопка «Установить» появится автоматически, если
            браузер поддерживает установку.
          </p>
          <button
            type="button"
            className="btn-ghost mt-3 text-xs"
            onClick={() => setShowIosHelp(false)}
          >
            Понятно
          </button>
        </div>
      )}
    </div>
  );
}
