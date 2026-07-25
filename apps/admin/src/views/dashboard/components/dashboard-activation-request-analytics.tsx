"use client";

import { BadgeCheck, Clock3, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type {
  AnalyticsDashboardActivationRequests,
  AnalyticsDashboardTrends,
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
  DASHBOARD_ACTIVATION_REQUEST_SOURCE_ORDER,
  DASHBOARD_ACTIVATION_REQUEST_STATUS_COLORS,
  DASHBOARD_ACTIVATION_REQUEST_STATUS_ORDER,
} from "../dashboard.constants";
import { formatDashboardNumber, formatTrendDate } from "../dashboard.utils";
import { DashboardWidgetState } from "./dashboard-widget-state";

type DashboardActivationRequestAnalyticsProps = {
  actions?: ReactNode;
  data?: AnalyticsDashboardActivationRequests;
  error: boolean;
  loading: boolean;
  onRetry: () => void;
  trendData?: AnalyticsDashboardTrends;
  trendError: boolean;
  trendLoading: boolean;
  onTrendRetry: () => void;
};

export function DashboardActivationRequestAnalytics({
  actions,
  data,
  error,
  loading,
  onRetry,
  trendData,
  trendError,
  trendLoading,
  onTrendRetry,
}: DashboardActivationRequestAnalyticsProps) {
  const locale = useLocale();
  const t = useTranslations("Dashboard.activationRequests");
  const sourceT = useTranslations("WarrantyActivationRequestsAdmin.sources");

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

  const sourceCounts = new Map(
    data.bySource.map((item) => [item.source, item.count]),
  );
  const sourceSummary = DASHBOARD_ACTIVATION_REQUEST_SOURCE_ORDER.map(
    (source) => ({
      count: formatDashboardNumber(sourceCounts.get(source) ?? 0, locale),
      description:
        source === "PUBLIC_WEB"
          ? t("publicWebDescription")
          : t("adminPortalDescription"),
      key: source,
      label: sourceT(source),
    }),
  );

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
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <ActivationMetric
            description={t("createdInRangeDescription")}
            icon={Clock3}
            title={t("createdInRange")}
            value={formatDashboardNumber(data.createdInRange, locale)}
          />
          <ActivationMetric
            description={t("pendingDescription")}
            icon={Clock3}
            title={t("pending")}
            value={formatDashboardNumber(data.pending, locale)}
          />
          <ActivationMetric
            description={t("activatedDescription")}
            icon={BadgeCheck}
            title={t("activated")}
            value={formatDashboardNumber(data.activated, locale)}
          />
          <ActivationMetric
            description={t("rejectedDescription")}
            icon={XCircle}
            title={t("rejected")}
            value={formatDashboardNumber(data.rejected, locale)}
          />
          {sourceSummary.map((item) => (
            <ActivationSourceMetric
              description={item.description}
              key={item.key}
              title={item.label}
              value={item.count}
            />
          ))}
        </div>

        <div className="grid gap-4 overflow-hidden">
          <ActivationStatusTrendChart
            emptyDescription={t("emptyDescription")}
            emptyTitle={t("emptyTitle")}
            error={trendError}
            interval={trendData?.interval ?? "day"}
            loading={trendLoading}
            onRetry={onTrendRetry}
            points={trendData?.points ?? []}
            title={t("statusChart")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivationStatusTrendChart({
  emptyDescription,
  emptyTitle,
  error,
  interval,
  loading,
  onRetry,
  points,
  title,
}: {
  emptyDescription: string;
  emptyTitle: string;
  error: boolean;
  interval: AnalyticsDashboardTrends["interval"];
  loading: boolean;
  onRetry: () => void;
  points: AnalyticsDashboardTrends["points"];
  title: string;
}) {
  const locale = useLocale();
  const statusT = useTranslations("WarrantyActivationRequestsAdmin.statuses");
  const chartConfig = Object.fromEntries(
    DASHBOARD_ACTIVATION_REQUEST_STATUS_ORDER.map((status) => [
      status,
      {
        color: DASHBOARD_ACTIVATION_REQUEST_STATUS_COLORS[status],
        label: statusT(status),
      },
    ]),
  ) satisfies ChartConfig;
  const chartData = points.map((point) => ({
    date: point.date,
    label: formatTrendDate(point.date, interval, locale),
    ...Object.fromEntries(
      (point.breakdown ?? []).map((item) => [item.key, item.value]),
    ),
  }));

  if (loading) {
    return (
      <DashboardWidgetState
        description={emptyDescription}
        loading
        title={title}
      />
    );
  }

  if (error) {
    return (
      <DashboardWidgetState
        description={emptyDescription}
        onRetry={onRetry}
        title={title}
      />
    );
  }

  if (chartData.length === 0) {
    return (
      <DashboardWidgetState description={emptyDescription} title={emptyTitle} />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-300 md:justify-end">
        {DASHBOARD_ACTIVATION_REQUEST_STATUS_ORDER.map((status) => (
          <span className="inline-flex items-center gap-1.5" key={status}>
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{
                backgroundColor:
                  DASHBOARD_ACTIVATION_REQUEST_STATUS_COLORS[status],
              }}
            />
            {statusT(status)}
          </span>
        ))}
      </div>
      <div className="w-full overflow-x-auto">
        <ChartContainer
          aria-label={title}
          config={chartConfig}
          role="img"
          style={{
            height: 300,
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
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            {DASHBOARD_ACTIVATION_REQUEST_STATUS_ORDER.map((status) => (
              <Bar
                barSize={28}
                dataKey={status}
                fill={DASHBOARD_ACTIVATION_REQUEST_STATUS_COLORS[status]}
                key={status}
                maxBarSize={38}
                minPointSize={4}
                name={statusT(status)}
                radius={[4, 4, 0, 0]}
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
  );
}

function formatChartAxisLabel(label: string) {
  return label.length > 12 ? `${label.slice(0, 12)}…` : label;
}

function ActivationMetric({
  description,
  icon: Icon,
  title,
  value,
}: {
  description: string;
  icon: typeof Clock3;
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

function ActivationSourceMetric({
  description,
  title,
  value,
}: {
  description: string;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
