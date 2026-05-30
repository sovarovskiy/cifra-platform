"use client";

import { useState } from "react";
import { AdminEmails } from "@/components/AdminEmails";
import { AdminStats } from "@/components/AdminStats";

type Tab = "access" | "stats";

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
          Статистика
        </button>
      </div>

      {tab === "access" ? <AdminEmails /> : <AdminStats />}
    </div>
  );
}
