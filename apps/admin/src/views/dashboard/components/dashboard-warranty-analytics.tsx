"use client";

import { ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type {
  AnalyticsDashboardTrends,
  AnalyticsDashboardWarranties,
} from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/chart";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  DASHBOARD_WARRANTY_STATUS_COLORS,
  DASHBOARD_WARRANTY_STATUS_ORDER,
} from "../dashboard.constants";
import { formatDashboardNumber, formatTrendDate } from "../dashboard.utils";
import { DashboardWidgetState } from "./dashboard-widget-state";

type DashboardWarrantyAnalyticsProps = {
  actions?: ReactNode;
  data?: AnalyticsDashboardWarranties;
  error: boolean;
  loading: boolean;
  onRetry: () => void;
  trendData?: AnalyticsDashboardTrends;
  trendError: boolean;
  trendLoading: boolean;
  onTrendRetry: () => void;
};

export function DashboardWarrantyAnalytics({
  actions,
  data,
  error,
  loading,
  onRetry,
  trendData,
  trendError,
  trendLoading,
  onTrendRetry,
}: DashboardWarrantyAnalyticsProps) {
  const locale = useLocale();
  const t = useTranslations("Dashboard.warranties");
  const statusT = useTranslations("Products.warrantyStatuses");

  if (loading) {
    return (
      <DashboardWidgetState
        description={t("loadingDescription")}
        loading
        title={t("loading")}
      />
    );
  }

  if (error || !data) {
    return (
      <DashboardWidgetState
        description={t("errorDescription")}
        onRetry={onRetry}
        title={t("retry")}
      />
    );
  }

  const trendPoints = trendData?.points ?? [];
  const chartData = trendPoints.map((point) => ({
    date: point.date,
    label: formatTrendDate(point.date, trendData?.interval ?? "day", locale),
    ...Object.fromEntries(
      (point.breakdown ?? []).map((item) => [item.key, item.value]),
    ),
  }));
  const chartConfig = Object.fromEntries(
    DASHBOARD_WARRANTY_STATUS_ORDER.map((status) => [
      status,
      {
        color: DASHBOARD_WARRANTY_STATUS_COLORS[status],
        label: statusT(status),
      },
    ]),
  ) satisfies ChartConfig;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription className="mt-1">{t("description")}</CardDescription>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <WarrantyMetric
            description={t("totalDescription")}
            icon={ShieldCheck}
            title={t("total")}
            value={formatDashboardNumber(data.total, locale)}
          />
          <WarrantyMetric
            description={t("activatedInRangeDescription")}
            icon={ShieldCheck}
            title={t("activatedInRange")}
            value={formatDashboardNumber(data.activatedInRange, locale)}
          />
        </div>

        {trendLoading ? (
          <DashboardWidgetState
            description={t("loadingDescription")}
            loading
            title={t("loading")}
          />
        ) : trendError ? (
          <DashboardWidgetState
            description={t("errorDescription")}
            onRetry={onTrendRetry}
            title={t("retry")}
          />
        ) : chartData.length === 0 ? (
          <DashboardWidgetState
            description={t("emptyDescription")}
            title={t("emptyTitle")}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
              {DASHBOARD_WARRANTY_STATUS_ORDER.map((status) => (
                <span className="inline-flex items-center gap-1.5" key={status}>
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full"
                    style={{
                      backgroundColor: DASHBOARD_WARRANTY_STATUS_COLORS[status],
                    }}
                  />
                  {statusT(status)}
                </span>
              ))}
            </div>
            <div className="w-full overflow-x-auto">
              <ChartContainer
                aria-label={t("statusChart")}
                config={chartConfig}
                role="img"
                style={{
                  height: 260,
                  width: `max(100%, ${chartData.length * 60 + 48}px)`,
                }}
              >
                <BarChart
                  accessibilityLayer
                  barCategoryGap={10}
                  barGap={2}
                  data={chartData}
                  margin={{ bottom: 8, left: 0, right: 12, top: 24 }}
                >
                  <XAxis
                    axisLine={false}
                    dataKey="label"
                    interval={0}
                    tickFormatter={formatChartAxisLabel}
                    tickMargin={8}
                    tickLine={false}
                    type="category"
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    type="number"
                    width={32}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={false}
                  />
                  {DASHBOARD_WARRANTY_STATUS_ORDER.map((status) => (
                    <Bar
                      barSize={34}
                      dataKey={status}
                      key={status}
                      maxBarSize={44}
                      minPointSize={4}
                      name={statusT(status)}
                      radius={[4, 4, 0, 0]}
                      fill={DASHBOARD_WARRANTY_STATUS_COLORS[status]}
                    >
                      <LabelList
                        className="fill-slate-600 text-[10px] dark:fill-slate-300"
                        dataKey={status}
                        position="top"
                      />
                    </Bar>
                  ))}
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatChartAxisLabel(label: string) {
  return label.length > 12 ? `${label.slice(0, 12)}…` : label;
}

function WarrantyMetric({
  description,
  icon: Icon,
  title,
  value,
}: {
  description: string;
  icon: typeof ShieldCheck;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <Icon className="size-4 shrink-0 text-slate-400" />
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
