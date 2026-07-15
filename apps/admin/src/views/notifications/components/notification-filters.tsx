"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@repo/ui";
import type { NotificationStatusFilter } from "../notifications.types";

type NotificationFiltersProps = {
  onClear: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange?: (value: NotificationStatusFilter) => void;
  onTypeChange: (value: string) => void;
  search: string;
  status?: NotificationStatusFilter;
  type: string;
};

export function NotificationFilters({
  onClear,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  search,
  status,
  type,
}: NotificationFiltersProps) {
  const t = useTranslations("Notifications");

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_14rem_auto]">
      <label className="relative min-w-0">
        <span className="sr-only">{t("searchLabel")}</span>
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          value={search}
        />
      </label>
      <Input
        aria-label={t("typeFilter")}
        onChange={(event) => onTypeChange(event.target.value)}
        placeholder={t("typeFilter")}
        value={type}
      />
      {onStatusChange && status ? (
        <select
          aria-label={t("statusFilter")}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
          onChange={(event) =>
            onStatusChange(event.target.value as NotificationStatusFilter)
          }
          value={status}
        >
          <option value="ALL">{t("statuses.ALL")}</option>
          <option value="UNREAD">{t("statuses.UNREAD")}</option>
          <option value="READ">{t("statuses.READ")}</option>
        </select>
      ) : (
        <span className="hidden lg:block" />
      )}
      <Button onClick={onClear} variant="secondary">
        <X className="size-4" />
        {t("clearFilters")}
      </Button>
    </div>
  );
}
