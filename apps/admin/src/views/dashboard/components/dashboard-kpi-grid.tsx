import {
  AlertTriangle,
  CalendarPlus,
  Clock3,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { AnalyticsDashboardClaims } from "@repo/shared";
import { Card, CardContent, Skeleton } from "@repo/ui";
import { formatDashboardNumber } from "../dashboard.utils";
import { DashboardWidgetState } from "./dashboard-widget-state";

type DashboardKpiGridProps = {
  data?: AnalyticsDashboardClaims;
  error: boolean;
  loading: boolean;
  onRetry: () => void;
};

export function DashboardKpiGrid({
  data,
  error,
  loading,
  onRetry,
}: DashboardKpiGridProps) {
  const locale = useLocale();
  const t = useTranslations("Dashboard");

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <DashboardWidgetState
        description={t("states.metricsErrorDescription")}
        onRetry={onRetry}
        title={t("states.retry")}
      />
    );
  }

  const items: Array<{
    description: string;
    icon: LucideIcon;
    title: string;
    tone?: "danger";
    value: string;
  }> = [
    {
      description: t("kpis.totalDescription"),
      icon: ClipboardList,
      title: t("kpis.total"),
      value: formatDashboardNumber(data.total, locale),
    },
    {
      description: t("kpis.createdTodayDescription"),
      icon: CalendarPlus,
      title: t("kpis.createdToday"),
      value: formatDashboardNumber(data.createdToday, locale),
    },
    {
      description: t("kpis.overdueDescription"),
      icon: AlertTriangle,
      title: t("kpis.overdue"),
      tone: "danger",
      value: formatDashboardNumber(data.overdue, locale),
    },
    {
      description:
        data.averageResolutionHours === null
          ? t("kpis.noResolvedClaims")
          : t("kpis.averageResolutionDescription"),
      icon: Clock3,
      title: t("kpis.averageResolution"),
      value:
        data.averageResolutionHours === null
          ? "–"
          : t("kpis.hours", {
              value: Math.round(data.averageResolutionHours * 10) / 10,
            }),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ description, icon: Icon, title, tone, value }) => (
        <Card key={title}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {title}
              </p>
              <div
                className={
                  tone === "danger"
                    ? "flex size-9 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                    : "flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                }
              >
                <Icon className="size-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-slate-950 dark:text-slate-50">
              {value}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
