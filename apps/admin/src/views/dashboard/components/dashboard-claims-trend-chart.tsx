"use client";

import { useLocale, useTranslations } from "next-intl";
import type { AnalyticsDashboardTrends } from "@repo/shared";
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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { formatTrendDate } from "../dashboard.utils";
import { DashboardWidgetState } from "./dashboard-widget-state";

type DashboardClaimsTrendChartProps = {
  data?: AnalyticsDashboardTrends;
  error: boolean;
  loading: boolean;
  onRetry: () => void;
};

export function DashboardClaimsTrendChart({
  data,
  error,
  loading,
  onRetry,
}: DashboardClaimsTrendChartProps) {
  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const chartConfig = {
    value: {
      label: t("charts.claims"),
      theme: {
        dark: "#60a5fa",
        light: "#2563eb",
      },
    },
  } satisfies ChartConfig;
  const points =
    data?.points.map((point) => ({
      ...point,
      label: formatTrendDate(point.date, data.interval, locale),
    })) ?? [];

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{t("charts.trendTitle")}</CardTitle>
        <CardDescription>{t("charts.trendDescription")}</CardDescription>
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
        ) : points.length === 0 ? (
          <DashboardWidgetState
            description={t("states.noChartDataDescription")}
            title={t("states.noChartData")}
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <ChartContainer
              aria-label={t("charts.trendAriaLabel")}
              config={chartConfig}
              role="img"
              style={{
                height: 288,
                width: `max(100%, ${points.length * 50 + 48}px)`,
              }}
            >
              <AreaChart
                accessibilityLayer
                data={points}
                margin={{ left: 4, right: 12 }}
              >
                <defs>
                  <linearGradient id="claims-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-value)"
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-value)"
                      stopOpacity={0.03}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tick={{ dx: -20, textAnchor: "start" }}
                  tickLine={false}
                  width={32}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                  cursor={false}
                />
                <Area
                  dataKey="value"
                  fill="url(#claims-fill)"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
