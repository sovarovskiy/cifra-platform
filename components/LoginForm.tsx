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
    setInfo(data.message ?? "Код смотрите в окне терминала (npm run dev).");
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
    // Полная перезагрузка — чтобы cookies точно подхватились сервером
    window.location.href = "/";
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card-panel p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          Аналитическая платформа
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Цифра</h1>
        <p className="mt-2 text-sm text-slate-600">
          Вход по корпоративной почте из списка разрешённых адресов
        </p>

        {step === "email" ? (
          <form onSubmit={requestCode} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-surface-muted bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                placeholder="name@company.ru"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Отправка…" : "Получить код"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-6 space-y-4">
            <p className="text-sm text-slate-600">
              Код для <strong>{email}</strong>
            </p>
            {info && (
              <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">{info}</p>
            )}
            {devCode && (
              <p className="rounded-xl bg-slate-900 px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] text-white">
                {devCode}
              </p>
            )}
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Код из 6 цифр</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-surface-muted bg-white px-4 py-3 text-center text-lg tracking-widest outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Вход…" : "Войти"}
            </button>
            <button
              type="button"
              className="btn-ghost w-full"
              onClick={() => setStep("email")}
            >
              Другой email
            </button>
          </form>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        Один аккаунт — одно устройство. Новый вход завершит сессию на предыдущем.
      </p>
    </div>
  );
}
