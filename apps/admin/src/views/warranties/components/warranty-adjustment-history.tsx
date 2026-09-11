"use client";

import type {
  WarrantyAdjustmentHistoryEntry,
  WarrantyAdjustmentValue,
} from "@repo/shared";
import { formatDate } from "@repo/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { ChevronDown, Clock3, History, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { formatWarrantyMoneyLimit } from "../warranties.utils";
import { getWarrantyAdjustmentHistory } from "../warranty-adjustment-history.utils";

type WarrantyAdjustmentHistoryProps = {
  metadata: Record<string, unknown> | null;
};

const ADJUSTMENT_FIELDS = [
  "startDate",
  "durationMonths",
  "coverageLimitAmount",
  "maxClaimCount",
  "maxAmountPerClaim",
  "terms",
] as const;

export function WarrantyAdjustmentHistory({
  metadata,
}: WarrantyAdjustmentHistoryProps) {
  const t = useTranslations("Warranties");
  const locale = useLocale();
  const history = useMemo(
    () =>
      getWarrantyAdjustmentHistory(metadata).sort(
        (left, right) =>
          new Date(right.adjustedAt).getTime() -
          new Date(left.adjustedAt).getTime(),
      ),
    [metadata],
  );

  if (history.length === 0) return null;

  return (
    <Card>
      <CardHeader className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="size-4 text-slate-500 dark:text-slate-400" />
          <CardTitle>{t("adjustmentHistory.title")}</CardTitle>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("adjustmentHistory.description")}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {history.map((entry, index) => (
          <AdjustmentHistoryEntryCard
            entry={entry}
            key={`${entry.adjustedAt}-${entry.reason}-${index}`}
            locale={locale}
            t={t}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function AdjustmentHistoryEntryCard({
  entry,
  locale,
  t,
}: {
  entry: WarrantyAdjustmentHistoryEntry;
  locale: string;
  t: ReturnType<typeof useTranslations<"Warranties">>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const changedFields = ADJUSTMENT_FIELDS.filter((field) =>
    entry.changedFields.includes(field),
  );

  return (
    <article className="rounded-lg border border-slate-200  dark:border-slate-800 dark:bg-slate-900/40">
      <button
        type="button"
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
        onClick={() => setIsOpen((open) => !open)}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">
            {entry.reason}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" />
              {formatDate(entry.adjustedAt, { locale, showTime: true })}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1 break-all">
              <UserRound className="size-3.5 shrink-0" />
              {entry.adjustedByUser?.name ??
                entry.adjustedByUser?.email ??
                entry.adjustedByUserId ??
                t("adjustmentHistory.systemActor")}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs font-medium uppercase tracking-wide text-slate-500 sm:inline dark:text-slate-400">
            {t("adjustmentHistory.changedFields", {
              count: changedFields.length,
            })}
          </span>
          <ChevronDown
            className={`size-4 text-slate-500 transition-transform duration-200 dark:text-slate-400 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-slate-200 px-4 pb-4 pt-3 dark:border-slate-800">
            <span className="mb-3 inline-flex text-xs font-medium uppercase tracking-wide text-slate-500 sm:hidden dark:text-slate-400">
              {t("adjustmentHistory.changedFields", {
                count: changedFields.length,
              })}
            </span>
            <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/40">
              {changedFields.map((field) => {
                const change = entry.changes[field];
                return (
                  <div
                    className="grid gap-2 border-b border-slate-200 px-3 py-2.5 last:border-b-0 dark:border-slate-800 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-center"
                    key={field}
                  >
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {t(`adjustmentFields.${field}`)}
                    </span>
                    <div className="grid min-w-0 gap-1 text-sm sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
                      <span className="min-w-0 break-words text-slate-500 dark:text-slate-400">
                        {renderAdjustmentValue(
                          field,
                          change?.before,
                          locale,
                          t,
                        )}
                      </span>
                      <span
                        className="hidden text-slate-400 sm:inline"
                        aria-hidden="true"
                      >
                        {"->"}
                      </span>
                      <span className="min-w-0 break-words font-medium text-slate-950 dark:text-slate-50">
                        {renderAdjustmentValue(field, change?.after, locale, t)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function formatAdjustmentValue(
  field: string,
  value: WarrantyAdjustmentValue | undefined,
  locale: string,
  t: ReturnType<typeof useTranslations<"Warranties">>,
) {
  if (value === undefined) return t("adjustmentHistory.valueUnavailable");
  if (value === null || value === "") {
    return field === "terms" || field === "startDate"
      ? t("adjustmentHistory.valueUnavailable")
      : t("unlimited");
  }

  if (field === "startDate") {
    return formatDate(String(value), { locale, showTime: true });
  }
  if (field === "durationMonths") {
    return t("durationValue", { count: Number(value) });
  }
  if (field === "maxClaimCount") {
    return t("claimCountValue", { count: Number(value) });
  }
  if (field === "coverageLimitAmount" || field === "maxAmountPerClaim") {
    return formatWarrantyMoneyLimit(String(value), locale, t("unlimited"));
  }

  return String(value);
}

function renderAdjustmentValue(
  field: string,
  value: WarrantyAdjustmentValue | undefined,
  locale: string,
  t: ReturnType<typeof useTranslations<"Warranties">>,
) {
  const formatted = formatAdjustmentValue(field, value, locale, t);
  if (field !== "terms" || value === undefined || value === null) {
    return formatted;
  }

  return <span dangerouslySetInnerHTML={{ __html: String(value) }} />;
}
