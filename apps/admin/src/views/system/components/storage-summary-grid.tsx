"use client";

import type { StorageUsageSummary } from "@repo/shared";
import { Card, CardContent } from "@repo/ui";
import {
  Archive,
  FileWarning,
  Files,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatBytes, formatCount } from "../system.utils";

type SummaryItem = {
  description: string;
  icon: LucideIcon;
  title: string;
  value: string;
  warning?: boolean;
};

export function StorageSummaryGrid({ usage }: { usage: StorageUsageSummary }) {
  const locale = useLocale();
  const t = useTranslations("StorageMonitoring");
  const items: SummaryItem[] = [
    {
      description: formatBytes(usage.totalBytes, locale),
      icon: Archive,
      title: t("summary.totalObjects"),
      value: formatCount(usage.totalObjects, locale),
    },
    {
      description: formatBytes(usage.certificates.bytes, locale),
      icon: Files,
      title: t("summary.certificates"),
      value: formatCount(usage.certificates.objects, locale),
    },
    {
      description: t("summary.perCertificate"),
      icon: Gauge,
      title: t("summary.averageSize"),
      value: formatBytes(usage.certificates.averageBytes, locale),
    },
    {
      description: formatBytes(usage.certificates.orphanedBytes, locale),
      icon: FileWarning,
      title: t("summary.orphaned"),
      value: formatCount(usage.certificates.orphanedObjects, locale),
      warning: usage.certificates.orphanedObjects > 0,
    },
  ];

  return (
    <section
      aria-label={t("summary.sectionLabel")}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map(({ description, icon: Icon, title, value, warning }) => (
        <Card key={title}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {title}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-slate-950 dark:text-slate-50">
                  {value}
                </p>
              </div>
              <div
                className={
                  warning
                    ? "flex size-10 items-center justify-center rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    : "flex size-10 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                }
              >
                <Icon aria-hidden="true" className="size-5" />
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
