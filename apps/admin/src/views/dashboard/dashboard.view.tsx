"use client";

import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { DateRangePicker } from "@repo/ui/date-range-picker";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { DashboardBreakdownCharts } from "./components/dashboard-breakdown-charts";
import { DashboardClaimsTrendChart } from "./components/dashboard-claims-trend-chart";
import { DashboardKpiGrid } from "./components/dashboard-kpi-grid";
import { DashboardQuickActions } from "./components/dashboard-quick-actions";
import { DashboardRecentClaims } from "./components/dashboard-recent-claims";
import { useDashboard } from "./hooks/use-dashboard";

export function DashboardView() {
  const t = useTranslations("Dashboard");
  const {
    canViewClaims,
    claimsQuery,
    range,
    recentClaimsQuery,
    setRange,
    trendsQuery,
  } = useDashboard();

  return (
    <PermissionGuard permissions={[PERMISSIONS.DASHBOARD_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            <DateRangePicker
              ariaLabel={t("dateRange.ariaLabel")}
              className="w-full sm:w-72"
              clearLabel={t("dateRange.clear")}
              disabledDates={{ after: new Date() }}
              onValueChange={setRange}
              placeholder={t("dateRange.placeholder")}
              value={range}
            />
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <DashboardKpiGrid
          data={claimsQuery.data}
          error={claimsQuery.isError}
          loading={claimsQuery.isPending}
          onRetry={() => void claimsQuery.refetch()}
        />

        <DashboardClaimsTrendChart
          data={trendsQuery.data}
          error={trendsQuery.isError}
          loading={trendsQuery.isPending}
          onRetry={() => void trendsQuery.refetch()}
        />

        <DashboardBreakdownCharts
          data={claimsQuery.data}
          error={claimsQuery.isError}
          loading={claimsQuery.isPending}
          onRetry={() => void claimsQuery.refetch()}
        />

        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          <DashboardRecentClaims
            canView={canViewClaims}
            error={recentClaimsQuery.isError}
            items={recentClaimsQuery.data?.items ?? []}
            loading={recentClaimsQuery.isPending}
            onRetry={() => void recentClaimsQuery.refetch()}
          />
          <DashboardQuickActions />
        </div>
      </div>
    </PermissionGuard>
  );
}
