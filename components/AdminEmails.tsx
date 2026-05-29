"use client";

import { useCallback, useEffect, useState } from "react";

type Row = { email: string; is_admin: number; created_at: string };

export function AdminEmails() {
  const [emails, setEmails] = useState<Row[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newAdmin, setNewAdmin] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/emails");
    if (!res.ok) return;
    const data = await res.json();
    setEmails(data.emails);
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
      <div className="card-panel p-6">
        <h2 className="text-lg font-bold">Разрешённые почты</h2>
        <p className="mt-1 text-sm text-slate-600">
          Список хранится в базе приложения и обновляется сразу: можно добавлять
          менеджеров, менять роль (админ / пользователь) и удалять доступ.
          Главный администратор из <code className="text-xs">.env</code> удалить
          нельзя.
        </p>

        <form onSubmit={add} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-surface-muted px-4 py-2.5 text-sm"
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
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <ul className="card-panel divide-y divide-surface-muted overflow-hidden">
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
                  <span className="ml-2 rounded-md bg-brand-100 px-2 py-0.5 text-xs text-brand-800">
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
