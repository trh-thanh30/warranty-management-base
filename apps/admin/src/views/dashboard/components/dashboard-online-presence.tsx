"use client";

import { useTranslations } from "next-intl";
import { useOnlinePresence } from "../hooks/use-online-presence";

export function DashboardOnlinePresence() {
  const t = useTranslations("Dashboard.presence");
  const query = useOnlinePresence();
  const unavailable = query.isError || !query.data;

  return (
    <span
      className="inline-flex flex-wrap items-center gap-2"
      title={t("description")}
    >
      {(["web", "admin"] as const).map((source) => (
        <span
          key={source}
          className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium normal-case text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
          aria-label={
            unavailable ? t("unavailable", { source: t(source) }) : undefined
          }
        >
          <span
            aria-hidden="true"
            className={`size-2 shrink-0 rounded-full ${unavailable ? "bg-slate-400" : "bg-green-500"}`}
          />
          <span className="tabular-nums">
            {t("online", {
              source: t(source),
              count: unavailable ? "—" : query.data![source],
            })}
          </span>
        </span>
      ))}
    </span>
  );
}
