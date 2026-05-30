"use client";

import { useCallback, useEffect, useState } from "react";
import type { FunnelStatRow } from "@/lib/call-stats";

function getDefaultStatsRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { from: fmt(from), to: fmt(now) };
}

type StatsResponse = {
  total_calls: number;
  funnels: FunnelStatRow[];
  users: string[];
  filters: {
    from: string;
    to: string;
    email: string | null;
  };
};

export function AdminStats() {
  const defaults = getDefaultStatsRange();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ from, to });
    if (email) params.set("email", email);

    const res = await fetch(`/api/admin/stats?${params.toString()}`);
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Ошибка загрузки");
      return;
    }

    setStats(data as StatsResponse);
  }, [from, to, email]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="content-card">
        <h2 className="text-brand-title text-lg">Статистика звонков</h2>
        <p className="text-hint mt-2">
          Количество завершённых квалификаций за период и распределение по воронкам CRM.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="text-sm font-medium">С даты</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="field-input mt-1"
            />
          </label>
          <label>
            <span className="text-sm font-medium">По дату</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="field-input mt-1"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium">Пользователь</span>
            <select
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input mt-1"
            >
              <option value="">Все пользователи</option>
              {(stats?.users ?? []).map((userEmail) => (
                <option key={userEmail} value={userEmail}>
                  {userEmail}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="button" className="btn-primary mt-4" onClick={load} disabled={loading}>
          {loading ? "Загрузка…" : "Применить фильтр"}
        </button>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>

      {stats && (
        <>
          <div className="content-card">
            <p className="text-step-label">Итого за период</p>
            <p className="mt-2 text-3xl font-bold text-brand">{stats.total_calls}</p>
            <p className="text-hint mt-1 text-sm">
              {stats.filters.email
                ? `Пользователь: ${stats.filters.email}`
                : "Все пользователи"}
            </p>
          </div>

          <div className="content-card overflow-hidden p-0">
            <div className="border-b border-[#E2E8F0] px-4 py-3">
              <h3 className="text-sm font-semibold">Конверсия по воронкам</h3>
              <p className="text-hint mt-1 text-xs">
                Доля завершённых звонков, ушедших в каждую воронку CRM
              </p>
            </div>

            {stats.total_calls === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                За выбранный период звонков нет
              </p>
            ) : (
              <ul className="divide-y divide-[#E2E8F0]">
                {stats.funnels.map((row) => (
                  <li key={row.funnel_id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{row.funnel_label}</span>
                      <span className="text-sm tabular-nums text-muted">
                        {row.count} · {row.percent}%
                      </span>
                    </div>
                    <div className="stats-bar mt-2">
                      <div
                        className="stats-bar-fill"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
