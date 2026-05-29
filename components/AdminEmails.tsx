"use client";

import { useCallback, useEffect, useState } from "react";

type Row = { email: string; is_admin: number; created_at: string };

export function AdminEmails() {
  const [emails, setEmails] = useState<Row[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newAdmin, setNewAdmin] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [persistWarning, setPersistWarning] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/emails");
    if (!res.ok) return;
    const data = await res.json();
    setEmails(data.emails);
    setPersistWarning(data.persistenceWarning ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, isAdmin: newAdmin }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Ошибка");
      return;
    }
    setNewEmail("");
    setNewAdmin(false);
    load();
  }

  async function setRole(email: string, isAdmin: boolean) {
    setSaving(email);
    setError("");
    const res = await fetch("/api/admin/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, isAdmin }),
    });
    const data = await res.json();
    setSaving(null);
    if (!res.ok) {
      setError(data.error ?? "Ошибка");
      return;
    }
    load();
  }

  async function remove(email: string) {
    if (!confirm(`Удалить доступ для ${email}?`)) return;
    setError("");
    const res = await fetch("/api/admin/emails", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Ошибка");
      return;
    }
    load();
  }

  return (
    <div className="space-y-6">
      <div className="content-card">
        <h2 className="text-brand-title text-lg">Разрешённые почты</h2>
        <p className="text-hint mt-2">
          Добавляйте менеджеров, меняйте роль (админ / пользователь) и удаляйте
          доступ. Главного администратора из настроек сервера удалить нельзя.
        </p>
        {persistWarning && (
          <p className="glass-speech mt-3 rounded-xl px-4 py-3 text-sm text-amber-900">
            {persistWarning}
          </p>
        )}

        <form onSubmit={add} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="glass-input mt-1"
              placeholder="manager@company.ru"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newAdmin}
              onChange={(e) => setNewAdmin(e.target.checked)}
            />
            Администратор
          </label>
          <button type="submit" className="btn-primary">
            Добавить
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>

      <ul className="content-card divide-y divide-[#E2E8F0] overflow-hidden p-0">
        {emails.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-slate-500">
            Список пуст
          </li>
        )}
        {emails.map((row) => {
          const isAdmin = row.is_admin === 1;
          const busy = saving === row.email;
          return (
            <li
              key={row.email}
              className="flex flex-col gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="font-medium">{row.email}</span>
                {isAdmin && (
                  <span className="ml-2 rounded-md bg-[#E5ECEC] px-2 py-0.5 text-xs font-medium text-brand">
                    админ
                  </span>
                )}
                <p className="mt-0.5 text-xs text-slate-400">
                  с {new Date(row.created_at).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 rounded-lg border border-surface-muted px-3 py-1.5">
                  <input
                    type="checkbox"
                    checked={isAdmin}
                    disabled={busy}
                    onChange={(e) => setRole(row.email, e.target.checked)}
                  />
                  <span className="text-xs">Админ</span>
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(row.email)}
                  className="rounded-lg px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Удалить
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
