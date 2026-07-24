"use client";

import type { StorageUsageSummary } from "@repo/shared";
import { Badge, Card, CardContent } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { storageAlertConfig } from "../system.constants";
import { clampPercentage, formatBytes } from "../system.utils";

type StorageCapacityCardProps = {
  usage: StorageUsageSummary;
};

export function StorageCapacityCard({ usage }: StorageCapacityCardProps) {
  const locale = useLocale();
  const t = useTranslations("StorageMonitoring");
  const alert = storageAlertConfig[usage.alertLevel];
  const AlertIcon = alert.icon;
  const progress = clampPercentage(usage.usagePercent);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {t("capacity.title")}
              </p>
              <Badge variant={alert.badgeVariant}>
                <AlertIcon aria-hidden="true" className="mr-1.5 size-3.5" />
                {t(`alerts.${usage.alertLevel}`)}
              </Badge>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums text-slate-950 dark:text-slate-50">
              {formatBytes(usage.totalBytes, locale)}
              <span className="ml-2 text-base font-normal text-slate-500 dark:text-slate-400">
                {usage.capacityBytes
                  ? t("capacity.of", {
                      capacity: formatBytes(usage.capacityBytes, locale),
                    })
                  : t("capacity.used")}
              </span>
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {usage.capacityBytes
                ? t("capacity.configuredDescription")
                : t("capacity.unconfiguredDescription")}
            </p>
          </div>
          <p className="text-left text-2xl font-semibold tabular-nums text-slate-950 dark:text-slate-50 lg:text-right">
            {usage.usagePercent === null
              ? t("capacity.notConfigured")
              : `${usage.usagePercent.toLocaleString(locale, {
                  maximumFractionDigits: 2,
                })}%`}
          </p>
        </div>
        <div
          aria-label={t("capacity.progressLabel")}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={usage.usagePercent === null ? undefined : progress}
          className="h-3 bg-slate-100 dark:bg-slate-800"
          role="progressbar"
        >
          <div
            className={cn(
              "h-full transition-[width] duration-300 motion-reduce:transition-none",
              alert.barClassName,
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
