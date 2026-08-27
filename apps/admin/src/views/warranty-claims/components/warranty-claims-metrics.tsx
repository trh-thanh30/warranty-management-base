"use client";

import { AlertTriangle, CalendarClock, Inbox, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import type { WarrantyClaimMetrics } from "@repo/shared";
import { Card, CardContent, Skeleton } from "@repo/ui";

type WarrantyClaimsMetricsProps = {
  data?: WarrantyClaimMetrics;
  isLoading: boolean;
};

export function WarrantyClaimsMetrics({
  data,
  isLoading,
}: WarrantyClaimsMetricsProps) {
  const t = useTranslations("WarrantyClaims");
  const items = [
    {
      icon: Inbox,
      label: t("metrics.total"),
      value: data?.total ?? 0,
    },
    {
      icon: CalendarClock,
      label: t("metrics.createdToday"),
      value: data?.createdToday ?? 0,
    },
    {
      icon: Timer,
      label: t("metrics.createdThisMonth"),
      value: data?.createdThisMonth ?? 0,
    },
    {
      icon: AlertTriangle,
      label: t("metrics.overdue"),
      value: data?.overdue ?? 0,
    },
  ];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card className="min-w-0" key={item.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <item.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              {isLoading ? (
                <Skeleton className="mt-2 h-6 w-16" />
              ) : (
                <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                  {item.value}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
