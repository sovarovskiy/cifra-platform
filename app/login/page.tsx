"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { InstallAppPrompt } from "@/components/InstallAppPrompt";
import { LoginForm } from "@/components/LoginForm";
import { isStandalonePwa } from "@/lib/pwa";

function LoginContent() {
  const searchParams = useSearchParams();
  const kicked = searchParams.get("reason") === "session";
  const [standalone, setStandalone] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const installed = isStandalonePwa();
    setStandalone(installed);
    setShowLogin(installed);
  }, []);

  return (
    <div className="mx-auto w-full max-w-md">
      {kicked && (
        <p className="glass-speech mb-4 rounded-xl px-4 py-3 text-center text-sm text-amber-900">
          Сессия завершена: выполнен вход с другого устройства.
        </p>
      )}

      {!standalone && (
        <InstallAppPrompt
          variant="welcome"
          onContinueInBrowser={() => setShowLogin(true)}
        />
      )}

      {(showLogin || standalone) && (
        <div className={standalone ? "" : "mt-2"}>
          <LoginForm />
        </div>
      )}

      {!standalone && !showLogin && (
        <p className="mt-4 text-center text-xs text-white/50">
          После установки откройте приложение «Цифра» с главного экрана.
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Suspense
        fallback={
          <div className="card-panel p-8 text-center text-sm text-muted">
            Загрузка…
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
