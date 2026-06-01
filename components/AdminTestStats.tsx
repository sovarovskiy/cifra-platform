"use client";

import { useCallback, useEffect, useState } from "react";
import type { TestUserStatRow } from "@/lib/test-stats";

function getDefaultStatsRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { from: fmt(from), to: fmt(now) };
}

type StatsResponse = {
  total_attempts: number;
  pass_rate_percent: number;
  users: TestUserStatRow[];
  users_list?: string[];
  filters: {
    from: string;
    to: string;
    email: string | null;
  };
};

export function AdminTestStats() {
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

    const res = await fetch(`/api/admin/test/stats?${params.toString()}`);
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

  const emailOptions = stats?.users_list ?? [];

  return (
    <div className="space-y-6">
      <div className="content-card">
        <h2 className="text-brand-title text-lg">Статистика тестов</h2>
        <p className="mt-1 text-sm text-slate-600">
          Порог «сдал» — 16 из 20. Каждая попытка сохраняется отдельно.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="text-step-label">С</span>
            <input
              type="date"
              className="field-input mt-1 w-full"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-step-label">По</span>
            <input
              type="date"
              className="field-input mt-1 w-full"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="text-step-label">Email</span>
            <select
              className="field-input mt-1 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            >
              <option value="">Все</option>
              {emailOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="button" className="btn-wizard mt-4" onClick={load} disabled={loading}>
          {loading ? "Загрузка…" : "Обновить"}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {stats && !loading && (
        <>
          <div className="content-card grid gap-2 sm:grid-cols-2">
            <p className="text-sm">
              Попыток за период: <strong>{stats.total_attempts}</strong>
            </p>
            <p className="text-sm">
              Доля «сдал»: <strong>{stats.pass_rate_percent}%</strong>
            </p>
          </div>

          <div className="content-card overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-step-label">
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Попыток</th>
                  <th className="py-2 pr-3">Сдал (раз)</th>
                  <th className="py-2 pr-3">Средний %</th>
                  <th className="py-2 pr-3">Последний</th>
                  <th className="py-2">Статус</th>
                </tr>
              </thead>
              <tbody>
                {stats.users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-slate-500">
                      Нет попыток за выбранный период
                    </td>
                  </tr>
                ) : (
                  stats.users.map((row) => (
                    <tr key={row.user_email} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-mono text-xs">{row.user_email}</td>
                      <td className="py-2 pr-3">{row.attempts}</td>
                      <td className="py-2 pr-3">{row.passed_count}</td>
                      <td className="py-2 pr-3">{row.avg_percent}%</td>
                      <td className="py-2 pr-3">
                        {row.last_score != null && row.last_total != null
                          ? `${row.last_score}/${row.last_total}`
                          : "—"}
                      </td>
                      <td className="py-2">
                        {row.last_passed == null
                          ? "—"
                          : row.last_passed
                            ? "Сдал"
                            : "Не сдал"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
