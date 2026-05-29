"use client";

import { useState } from "react";
import { getDeviceId } from "@/lib/device-id";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [devCode, setDevCode] = useState("");

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    const res = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email }),
    });
    let data: { error?: string; message?: string; devCode?: string } = {};
    try {
      data = await res.json();
    } catch {
      setLoading(false);
      setError("Сервер не ответил. Запустите: npm run dev в папке cifra-platform");
      return;
    }
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? `Ошибка ${res.status}`);
      return;
    }
    setInfo(data.message ?? "Код показан на экране ниже.");
    setDevCode(data.devCode ?? "");
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email, code, deviceId: getDeviceId() }),
    });
    let data: { error?: string } = {};
    try {
      data = await res.json();
    } catch {
      setLoading(false);
      setError("Сервер не ответил. Проверьте, что npm run dev запущен.");
      return;
    }
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? `Ошибка ${res.status}`);
      return;
    }
    window.location.href = "/";
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="content-card p-6">
        <p className="text-eyebrow">Аналитическая платформа</p>
        <h1 className="text-brand-title mt-1">Цифра</h1>
        <p className="text-hint mt-2">Вход по корпоративной почте из списка разрешённых</p>

        {step === "email" ? (
          <form onSubmit={requestCode} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-ink">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input mt-2"
                placeholder="name@company.ru"
              />
            </label>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Отправка…" : "Получить код"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-8 space-y-4">
            <p className="text-sm text-ink">
              Код для <strong>{email}</strong>
            </p>
            {info && <p className="panel-inset text-xs text-brand">{info}</p>}
            {devCode && (
              <p className="rounded-[14px] bg-brand px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] text-white">
                {devCode}
              </p>
            )}
            <label className="block">
              <span className="text-sm font-medium text-ink">Код из 6 цифр</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="field-input mt-2 text-center text-lg tracking-widest"
              />
            </label>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Вход…" : "Войти"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
              }}
            >
              Другой email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
