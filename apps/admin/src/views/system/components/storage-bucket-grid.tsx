"use client";

import type { StorageUsageSummary } from "@repo/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { useLocale, useTranslations } from "next-intl";
import { storageBuckets } from "../system.constants";
import { formatBytes, formatCount } from "../system.utils";

export function StorageBucketGrid({ usage }: { usage: StorageUsageSummary }) {
  const locale = useLocale();
  const t = useTranslations("StorageMonitoring");

  return (
    <section aria-labelledby="storage-buckets-title">
      <div className="mb-4">
        <h2
          className="text-lg font-semibold text-slate-950 dark:text-slate-50"
          id="storage-buckets-title"
        >
          {t("buckets.title")}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {t("buckets.description")}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {storageBuckets.map(({ icon: Icon, key }) => {
          const bucket = usage.buckets[key];
          const share =
            usage.totalBytes > 0
              ? Math.round((bucket.bytes / usage.totalBytes) * 1000) / 10
              : 0;

          return (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle className="text-base">
                  {t(`buckets.${key}.title`)}
                </CardTitle>
                <div className="flex size-10 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <Icon aria-hidden="true" className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight tabular-nums text-slate-950 dark:text-slate-50">
                  {formatBytes(bucket.bytes, locale)}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {t("buckets.objectCount", {
                    count: formatCount(bucket.objects, locale),
                    share: share.toLocaleString(locale, {
                      maximumFractionDigits: 1,
                    }),
                  })}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {t(`buckets.${key}.description`)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
