"use client";

import { useState } from "react";
import { AdminEmails } from "@/components/AdminEmails";
import { AdminStats } from "@/components/AdminStats";
import { AdminTestStats } from "@/components/AdminTestStats";

type Tab = "access" | "stats" | "tests";

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>("access");

  return (
    <div className="space-y-4">
      <p className="text-step-label">Администрирование</p>

      <div className="admin-tabs" role="tablist" aria-label="Разделы админки">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "access"}
          className={`admin-tab ${tab === "access" ? "admin-tab--active" : ""}`}
          onClick={() => setTab("access")}
        >
          Доступ
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "stats"}
          className={`admin-tab ${tab === "stats" ? "admin-tab--active" : ""}`}
          onClick={() => setTab("stats")}
        >
          Звонки
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "tests"}
          className={`admin-tab ${tab === "tests" ? "admin-tab--active" : ""}`}
          onClick={() => setTab("tests")}
        >
          Тесты
        </button>
      </div>

      {tab === "access" ? (
        <AdminEmails />
      ) : tab === "stats" ? (
        <AdminStats />
      ) : (
        <AdminTestStats />
      )}
    </div>
  );
}
