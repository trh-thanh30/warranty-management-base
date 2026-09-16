"use client";

import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { DashboardActivationRequestAnalytics } from "./components/dashboard-activation-request-analytics";
import { DashboardActivationCodeOperations } from "./components/dashboard-activation-code-operations";
import { DashboardBreakdownCharts } from "./components/dashboard-breakdown-charts";
import { DashboardClaimsTrendChart } from "./components/dashboard-claims-trend-chart";
import { DashboardDateRangeFilter } from "./components/dashboard-date-range-filter";
import { DashboardKpiGrid } from "./components/dashboard-kpi-grid";
import { DashboardQuickActions } from "./components/dashboard-quick-actions";
import { DashboardRecentClaims } from "./components/dashboard-recent-claims";
import { DashboardWarrantyAnalytics } from "./components/dashboard-warranty-analytics";
import { useDashboard } from "./hooks/use-dashboard";
import { DashboardOnlinePresence } from "./components/dashboard-online-presence";

export function DashboardView() {
  const t = useTranslations("Dashboard");
  const {
    activationRequestRange,
    activationRequestsQuery,
    activationRequestsTrendQuery,
    activationCodeReportQuery,
    activationCodeReportFilters,
    activeActivationRequestQuickRange,
    activeQuickRange,
    activeWarrantyQuickRange,
    canViewClaims,
    canViewActivationCodes,
    claimsQuery,
    range,
    recentClaimsQuery,
    setActivationRequestQuickRange,
    setActivationRequestRange,
    setQuickRange,
    setRange,
    setWarrantyQuickRange,
    setWarrantyRange,
    trendsQuery,
    warrantyRange,
    warrantiesQuery,
    warrantiesTrendQuery,
  } = useDashboard();
  const renderDashboardDateRangeFilter = () => (
    <DashboardDateRangeFilter
      activeQuickRange={activeQuickRange}
      ariaLabel={t("dateRange.ariaLabel")}
      className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
      clearLabel={t("dateRange.clear")}
      disabledDates={{ after: new Date() }}
      onQuickRangeChange={setQuickRange}
      onRangeChange={setRange}
      placeholder={t("dateRange.placeholder")}
      quickFilterAriaLabel={t("dateRange.quickFilterAriaLabel")}
      range={range}
      translateQuickRange={(key) => t(`dateRange.${key}`)}
    />
  );
  const renderWarrantyDateRangeFilter = () => (
    <DashboardDateRangeFilter
      activeQuickRange={activeWarrantyQuickRange}
      ariaLabel={t("dateRange.ariaLabel")}
      className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
      clearLabel={t("dateRange.clear")}
      disabledDates={{ after: new Date() }}
      onQuickRangeChange={setWarrantyQuickRange}
      onRangeChange={setWarrantyRange}
      placeholder={t("dateRange.placeholder")}
      quickFilterAriaLabel={t("dateRange.quickFilterAriaLabel")}
      range={warrantyRange}
      translateQuickRange={(key) => t(`dateRange.${key}`)}
    />
  );
  const renderActivationRequestDateRangeFilter = () => (
    <DashboardDateRangeFilter
      activeQuickRange={activeActivationRequestQuickRange}
      ariaLabel={t("dateRange.ariaLabel")}
      className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
      clearLabel={t("dateRange.clear")}
      disabledDates={{ after: new Date() }}
      onQuickRangeChange={setActivationRequestQuickRange}
      onRangeChange={setActivationRequestRange}
      placeholder={t("dateRange.placeholder")}
      quickFilterAriaLabel={t("dateRange.quickFilterAriaLabel")}
      range={activationRequestRange}
      translateQuickRange={(key) => t(`dateRange.${key}`)}
    />
  );

  return (
    <PermissionGuard permissions={[PERMISSIONS.DASHBOARD_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={renderDashboardDateRangeFilter()}
          description={t("description")}
          eyebrow={t("eyebrow")}
          eyebrowAddon={<DashboardOnlinePresence />}
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

        <div className="grid min-w-0 gap-4">
          <DashboardWarrantyAnalytics
            actions={renderWarrantyDateRangeFilter()}
            data={warrantiesQuery.data}
            error={warrantiesQuery.isError}
            loading={warrantiesQuery.isPending}
            onRetry={() => void warrantiesQuery.refetch()}
            onTrendRetry={() => void warrantiesTrendQuery.refetch()}
            trendData={warrantiesTrendQuery.data}
            trendError={warrantiesTrendQuery.isError}
            trendLoading={warrantiesTrendQuery.isPending}
          />
          <DashboardActivationRequestAnalytics
            actions={renderActivationRequestDateRangeFilter()}
            data={activationRequestsQuery.data}
            error={activationRequestsQuery.isError}
            loading={activationRequestsQuery.isPending}
            onRetry={() => void activationRequestsQuery.refetch()}
            onTrendRetry={() => void activationRequestsTrendQuery.refetch()}
            trendData={activationRequestsTrendQuery.data}
            trendError={activationRequestsTrendQuery.isError}
            trendLoading={activationRequestsTrendQuery.isPending}
          />
          {canViewActivationCodes ? (
            <DashboardActivationCodeOperations
              data={activationCodeReportQuery.data}
              error={activationCodeReportQuery.isError}
              filters={activationCodeReportFilters}
              loading={activationCodeReportQuery.isPending}
              onRetry={() => void activationCodeReportQuery.refetch()}
            />
          ) : null}
        </div>

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
