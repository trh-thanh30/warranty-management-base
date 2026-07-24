"use client";

import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/src/components/common/page-header";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import { StorageBucketGrid } from "./components/storage-bucket-grid";
import { StorageCapacityCard } from "./components/storage-capacity-card";
import { StorageDistributionChart } from "./components/storage-distribution-chart";
import { StorageMonitoringSkeleton } from "./components/storage-monitoring-skeleton";
import { StorageSummaryGrid } from "./components/storage-summary-grid";
import { useStorageUsage } from "./hooks/use-storage-usage";

export function SystemView() {
  const locale = useLocale();
  const t = useTranslations("StorageMonitoring");
  const { hasPermission, hasRole } = usePermissions();
  const canView = hasRole("admin") && hasPermission(PERMISSIONS.SYSTEM_VIEW);
  const usageQuery = useStorageUsage({ enabled: canView });
  const updatedAt = usageQuery.dataUpdatedAt
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "medium",
      }).format(usageQuery.dataUpdatedAt)
    : null;

  return (
    <PermissionGuard
      permissions={[PERMISSIONS.SYSTEM_VIEW]}
      requiredRole="admin"
    >
      <div className="space-y-6">
        <PageHeader
          actions={
            <Button
              aria-label={t("refresh")}
              disabled={usageQuery.isFetching}
              onClick={() => void usageQuery.refetch()}
              variant="secondary"
            >
              <RefreshCcw
                aria-hidden="true"
                className={
                  usageQuery.isFetching
                    ? "size-4 animate-spin motion-reduce:animate-none"
                    : "size-4"
                }
              />
              {usageQuery.isFetching ? t("refreshing") : t("refresh")}
            </Button>
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        {updatedAt ? (
          <p
            aria-live="polite"
            className="-mt-3 text-xs text-slate-500 dark:text-slate-400"
          >
            {t("lastUpdated", { value: updatedAt })}
          </p>
        ) : null}

        {usageQuery.isPending ? <StorageMonitoringSkeleton /> : null}

        {usageQuery.isError ? (
          <div role="alert">
            <StatePanel
              action={
                <Button
                  onClick={() => void usageQuery.refetch()}
                  size="sm"
                  variant="secondary"
                >
                  <RefreshCcw aria-hidden="true" className="size-4" />
                  {t("retry")}
                </Button>
              }
              description={t("errorDescription")}
              icon={AlertCircle}
              title={t("errorTitle")}
            />
          </div>
        ) : null}

        {usageQuery.data ? (
          <>
            <StorageCapacityCard usage={usageQuery.data} />
            <StorageSummaryGrid usage={usageQuery.data} />
            <StorageDistributionChart usage={usageQuery.data} />
            <StorageBucketGrid usage={usageQuery.data} />
          </>
        ) : null}
      </div>
    </PermissionGuard>
  );
}
