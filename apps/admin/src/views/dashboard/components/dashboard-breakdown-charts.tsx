"use client";

import { useTranslations } from "next-intl";
import type { AnalyticsDashboardClaims } from "@repo/shared";
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
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import {
  DASHBOARD_CLAIM_PRIORITY_COLORS,
  DASHBOARD_CLAIM_PRIORITY_ORDER,
  DASHBOARD_CLAIM_STATUS_COLORS,
  DASHBOARD_CLAIM_STATUS_ORDER,
  DASHBOARD_OTHER_SERVICE_CENTER_COLOR,
  DASHBOARD_SERVICE_CENTER_COLORS,
  DASHBOARD_UNASSIGNED_SERVICE_CENTER_COLOR,
} from "../dashboard.constants";
import { DashboardWidgetState } from "./dashboard-widget-state";

type BreakdownItem = {
  color?: string;
  count: number;
  key: string;
  label: string;
};

type DashboardBreakdownChartsProps = {
  data?: AnalyticsDashboardClaims;
  error: boolean;
  loading: boolean;
  onRetry: () => void;
};

export function DashboardBreakdownCharts({
  data,
  error,
  loading,
  onRetry,
}: DashboardBreakdownChartsProps) {
  const t = useTranslations("Dashboard");
  const statusT = useTranslations("WarrantyClaims.statuses");
  const priorityT = useTranslations("WarrantyClaims.priorities");
  const statusCounts = new Map(
    data?.byStatus.map((item) => [item.status, item.count]) ?? [],
  );
  const statusData = DASHBOARD_CLAIM_STATUS_ORDER.flatMap((status) => {
    const count = statusCounts.get(status);
    if (!count) return [];

    return [
      {
        color: DASHBOARD_CLAIM_STATUS_COLORS[status],
        count,
        key: status,
        label: statusT(status),
      },
    ];
  });
  const priorityCounts = new Map(
    data?.byPriority.map((item) => [item.priority, item.count]) ?? [],
  );
  const priorityData = DASHBOARD_CLAIM_PRIORITY_ORDER.flatMap((priority) => {
    const count = priorityCounts.get(priority);
    if (!count) return [];

    return [
      {
        color: DASHBOARD_CLAIM_PRIORITY_COLORS[priority],
        count,
        key: priority,
        label: priorityT(priority),
      },
    ];
  });
  const serviceCenterItems =
    data?.byServiceCenter
      .map((item) => ({
        count: item.count,
        key: item.serviceCenterId ?? "unassigned",
        label: item.serviceCenterName ?? t("charts.unassigned"),
      }))
      .sort((left, right) => right.count - left.count) ?? [];
  const unassignedServiceCenter = serviceCenterItems.find(
    (item) => item.key === "unassigned",
  );
  const assignedServiceCenters = serviceCenterItems
    .filter((item) => item.key !== "unassigned")
    .map((item, index) => ({
      ...item,
      color:
        DASHBOARD_SERVICE_CENTER_COLORS[
          index % DASHBOARD_SERVICE_CENTER_COLORS.length
        ],
    }));
  const assignedRowLimit = unassignedServiceCenter ? 5 : 6;
  const visibleAssignedServiceCenters =
    assignedServiceCenters.length > assignedRowLimit
      ? [
          ...assignedServiceCenters.slice(0, assignedRowLimit - 1),
          {
            color: DASHBOARD_OTHER_SERVICE_CENTER_COLOR,
            count: assignedServiceCenters
              .slice(assignedRowLimit - 1)
              .reduce((sum, item) => sum + item.count, 0),
            key: "other",
            label: t("charts.other"),
          },
        ]
      : assignedServiceCenters;
  const serviceCenterData = unassignedServiceCenter
    ? [
        ...visibleAssignedServiceCenters,
        {
          ...unassignedServiceCenter,
          color: DASHBOARD_UNASSIGNED_SERVICE_CENTER_COLOR,
        },
      ]
    : visibleAssignedServiceCenters;
  const rowCount = Math.max(
    6,
    statusData.length,
    priorityData.length,
    serviceCenterData.length,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <BreakdownCard
        colors={[]}
        data={statusData}
        description={t("charts.statusDescription")}
        error={error}
        leftAlignYAxis
        loading={loading}
        onRetry={onRetry}
        rowCount={rowCount}
        showPercentage
        title={t("charts.statusTitle")}
      />
      <BreakdownCard
        colors={[]}
        data={priorityData}
        description={t("charts.priorityDescription")}
        error={error}
        leftAlignYAxis
        loading={loading}
        onRetry={onRetry}
        rowCount={rowCount}
        title={t("charts.priorityTitle")}
      />
      <BreakdownCard
        colors={DASHBOARD_SERVICE_CENTER_COLORS}
        compactOnMobile
        data={serviceCenterData}
        description={t("charts.serviceCenterDescription")}
        error={error}
        leftAlignYAxis
        loading={loading}
        onRetry={onRetry}
        rowCount={rowCount}
        title={t("charts.serviceCenterTitle")}
        yAxisWidth={156}
      />
    </div>
  );
}

function BreakdownCard({
  colors,
  compactOnMobile = false,
  data,
  description,
  error,
  leftAlignYAxis = false,
  loading,
  onRetry,
  rowCount,
  showPercentage = false,
  title,
  yAxisWidth = 92,
}: {
  colors: readonly string[];
  compactOnMobile?: boolean;
  data: BreakdownItem[];
  description: string;
  error: boolean;
  leftAlignYAxis?: boolean;
  loading: boolean;
  onRetry: () => void;
  rowCount: number;
  showPercentage?: boolean;
  title: string;
  yAxisWidth?: number;
}) {
  const t = useTranslations("Dashboard");
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const chartData = data.map((item) => {
    const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

    return {
      ...item,
      percentage,
      summary: showPercentage
        ? `${item.count} · ${percentage}%`
        : String(item.count),
    };
  });
  const renderedChartData = [
    ...chartData,
    ...Array.from(
      { length: Math.max(0, rowCount - chartData.length) },
      (_, index) => ({
        color: "transparent",
        count: null,
        key: `spacer-${index}`,
        label: "",
        percentage: 0,
        summary: "",
      }),
    ),
  ];
  const chartConfig = {
    count: {
      color: colors[0] ?? "#2563eb",
      label: t("charts.claimCount"),
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <DashboardWidgetState
            description={t("states.loadingDescription")}
            loading
            title={t("states.loading")}
          />
        ) : error ? (
          <DashboardWidgetState
            description={t("states.chartErrorDescription")}
            onRetry={onRetry}
            title={t("states.retry")}
          />
        ) : data.length === 0 ? (
          <DashboardWidgetState
            description={t("states.noChartDataDescription")}
            title={t("states.noChartData")}
          />
        ) : (
          <>
            {compactOnMobile ? (
              <MobileBreakdownList colors={colors} data={chartData} />
            ) : null}
            <ChartContainer
              aria-label={title}
              className={
                compactOnMobile
                  ? "hidden aspect-auto w-full md:flex"
                  : "aspect-auto w-full"
              }
              config={chartConfig}
              role="img"
              style={{ height: Math.max(240, rowCount * 44) }}
            >
              <BarChart
                accessibilityLayer
                data={renderedChartData}
                layout="vertical"
                margin={{ left: 0, right: showPercentage ? 52 : 28 }}
              >
                <XAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  type="number"
                />
                <YAxis
                  axisLine={false}
                  dataKey="label"
                  tick={
                    leftAlignYAxis
                      ? {
                          dx: -(yAxisWidth - 12),
                          textAnchor: "start",
                        }
                      : undefined
                  }
                  tickLine={false}
                  type="category"
                  width={yAxisWidth}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => (
                        <div className="flex min-w-36 items-center justify-between gap-4">
                          <span className="max-w-40 truncate text-slate-500 dark:text-slate-400">
                            {item.payload.label}
                          </span>
                          <span className="font-mono font-medium tabular-nums">
                            {Number(value).toLocaleString()}
                            {showPercentage
                              ? ` · ${item.payload.percentage}%`
                              : ""}
                          </span>
                        </div>
                      )}
                      hideLabel
                    />
                  }
                  cursor={false}
                />
                <Bar barSize={32} dataKey="count" radius={[0, 4, 4, 0]}>
                  {renderedChartData.map((item, index) => (
                    <Cell
                      fill={
                        item.color ?? colors[index % colors.length] ?? "#2563eb"
                      }
                      key={item.key}
                    />
                  ))}
                  <LabelList
                    className="fill-slate-600 text-xs dark:fill-slate-300"
                    dataKey="summary"
                    position="right"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MobileBreakdownList({
  colors,
  data,
}: {
  colors: readonly string[];
  data: Array<BreakdownItem & { percentage: number; summary: string }>;
}) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="space-y-4 md:hidden" role="list">
      {data.map((item, index) => (
        <div className="space-y-1.5" key={item.key} role="listitem">
          <div className="flex items-start justify-between gap-3 text-xs">
            <span className="min-w-0 text-slate-600 dark:text-slate-300">
              {item.label}
            </span>
            <span className="shrink-0 font-mono font-medium tabular-nums text-slate-900 dark:text-slate-100">
              {item.count.toLocaleString()}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full"
              style={{
                backgroundColor:
                  item.color ?? colors[index % colors.length] ?? "#3b82f6",
                width: `${Math.max((item.count / maxCount) * 100, 4)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
