"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui";

export function DealerStatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("Dealers");

  return (
    <Badge
      className={
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
      }
      variant="secondary"
    >
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}
