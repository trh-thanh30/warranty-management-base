"use client";

import type { StorageUsageSummary } from "@repo/shared";
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
import { useLocale, useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { storageBucketChartStyles, storageBuckets } from "../system.constants";
import type { StorageBucketKey } from "../system.types";
import {
  formatBytes,
  formatCount,
  getStorageBucketDistribution,
} from "../system.utils";

export function StorageDistributionChart({
  usage,
}: {
  usage: StorageUsageSummary;
}) {
  const locale = useLocale();
  const t = useTranslations("StorageMonitoring");
  const distribution = getStorageBucketDistribution(usage);
  const distributionByKey = new Map(
    distribution.map((item) => [item.key, item]),
  );
  const chartData = distribution.map((item) => ({
    ...item,
    label: t(`buckets.${item.key}.title`),
  }));
  const chartConfig = {
    public: {
      label: t("buckets.public.title"),
      theme: storageBucketChartStyles.public.theme,
    },
    private: {
      label: t("buckets.private.title"),
      theme: storageBucketChartStyles.private.theme,
    },
    temp: {
      label: t("buckets.temp.title"),
      theme: storageBucketChartStyles.temp.theme,
    },
  } satisfies ChartConfig;
  const ariaLabel = t("distribution.ariaLabel", {
    privateShare: formatShare(
      distributionByKey.get("private")?.share ?? 0,
      locale,
    ),
    publicShare: formatShare(
      distributionByKey.get("public")?.share ?? 0,
      locale,
    ),
    tempShare: formatShare(distributionByKey.get("temp")?.share ?? 0, locale),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("distribution.title")}</CardTitle>
        <CardDescription>{t("distribution.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {usage.totalBytes > 0 ? (
          <ChartContainer
            aria-label={ariaLabel}
            className="h-72 w-full aspect-auto sm:h-80"
            config={chartConfig}
            role="img"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ bottom: 0, left: 8, right: 8, top: 16 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="label"
                interval={0}
                tickLine={false}
                tickMargin={10}
                type="category"
              />
              <YAxis
                axisLine={false}
                tickFormatter={(value) => formatBytes(Number(value), locale)}
                tickLine={false}
                tickMargin={8}
                width={72}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const key = item.payload.key as StorageBucketKey;
                      const bucket = distributionByKey.get(key);

                      return (
                        <div className="flex min-w-64 items-center justify-between gap-4">
                          <span className="text-slate-500 dark:text-slate-400">
                            {t(`buckets.${key}.title`)}
                          </span>
                          <span className="font-mono font-medium tabular-nums">
                            {t("distribution.tooltipValue", {
                              bytes: formatBytes(Number(value), locale),
                              objects: formatCount(
                                bucket?.objects ?? 0,
                                locale,
                              ),
                              share: formatShare(bucket?.share ?? 0, locale),
                            })}
                          </span>
                        </div>
                      );
                    }}
                    hideLabel
                  />
                }
                cursor={false}
              />
              <Bar
                dataKey="bytes"
                isAnimationActive={false}
                maxBarSize={88}
                radius={[6, 6, 0, 0]}
              >
                {storageBuckets.map(({ key }) => (
                  <Cell fill={`var(--color-${key})`} key={key} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {t("distribution.empty")}
          </div>
        )}

        <ul
          aria-label={t("distribution.legendLabel")}
          className="mt-4 grid gap-3 sm:grid-cols-3"
        >
          {distribution.map((item) => (
            <li className="flex items-start gap-2.5" key={item.key}>
              <span
                aria-hidden="true"
                className={`mt-1 size-2.5 shrink-0 rounded-sm ${storageBucketChartStyles[item.key].dotClassName}`}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t(`buckets.${item.key}.title`)}
                </span>
                <span className="mt-0.5 block text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {t("distribution.legendValue", {
                    bytes: formatBytes(item.bytes, locale),
                    share: formatShare(item.share, locale),
                  })}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function formatShare(value: number, locale: string): string {
  return value.toLocaleString(locale, { maximumFractionDigits: 1 });
}
