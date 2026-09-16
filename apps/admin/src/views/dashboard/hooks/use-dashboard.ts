"use client";

import { useCallback, useMemo, useState } from "react";
import { PERMISSIONS } from "@repo/shared/constants";
import type { DateRangeValue } from "@repo/ui/date-range-picker";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useWarrantyClaims } from "@/src/hooks/use-warranty-claims";
import { useDashboardActivationCodeReport } from "./use-dashboard-activation-codes";
import type { DashboardQuickRangeDays } from "../dashboard.constants";
import {
  DASHBOARD_TREND_METRIC,
  getActiveDashboardQuickRange,
  getDashboardQuickRange,
  getDashboardTrendInterval,
  getDefaultDashboardRange,
  resolveDashboardRangeStateOnGlobalChange,
  resolveDashboardWidgetRange,
  toDashboardDateBoundary,
} from "../dashboard.utils";
import {
  useDashboardActivationRequests,
  useDashboardClaims,
  useDashboardTrends,
  useDashboardWarranties,
} from "./use-dashboard-analytics";

export function useDashboard() {
  const [range, setRange] = useState<DateRangeValue>(getDefaultDashboardRange);
  const [warrantyRange, setWarrantyRange] = useState<DateRangeValue | null>(
    null,
  );
  const [activationRequestRange, setActivationRequestRange] =
    useState<DateRangeValue | null>(null);
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canViewDashboard = hasPermission(PERMISSIONS.DASHBOARD_VIEW);
  const canViewClaims = hasPermission(PERMISSIONS.WARRANTY_CLAIM_VIEW);
  const canViewActivationCodes = hasPermission(
    PERMISSIONS.ACTIVATION_CODE_BATCH_VIEW,
  );
  const enabled = Boolean(user) && canViewDashboard;
  const effectiveWarrantyRange = useMemo(
    () => resolveDashboardWidgetRange(warrantyRange, range),
    [range, warrantyRange],
  );
  const effectiveActivationRequestRange = useMemo(
    () => resolveDashboardWidgetRange(activationRequestRange, range),
    [activationRequestRange, range],
  );
  const interval = getDashboardTrendInterval(range);
  const warrantyInterval = getDashboardTrendInterval(effectiveWarrantyRange);
  const activationRequestInterval = getDashboardTrendInterval(
    effectiveActivationRequestRange,
  );
  const activeQuickRange = useMemo(
    () => getActiveDashboardQuickRange(range),
    [range],
  );
  const activeWarrantyQuickRange = useMemo(
    () => getActiveDashboardQuickRange(effectiveWarrantyRange),
    [effectiveWarrantyRange],
  );
  const activeActivationRequestQuickRange = useMemo(
    () => getActiveDashboardQuickRange(effectiveActivationRequestRange),
    [effectiveActivationRequestRange],
  );
  const setWarrantyQuickRange = useCallback((days: DashboardQuickRangeDays) => {
    setWarrantyRange(getDashboardQuickRange(days));
  }, []);
  const setActivationRequestQuickRange = useCallback(
    (days: DashboardQuickRangeDays) => {
      setActivationRequestRange(getDashboardQuickRange(days));
    },
    [],
  );
  const setDashboardRange = useCallback((nextRange: DateRangeValue) => {
    const nextState = resolveDashboardRangeStateOnGlobalChange(nextRange);
    setRange(nextState.range);
    setWarrantyRange(nextState.warrantyRange);
    setActivationRequestRange(nextState.activationRequestRange);
  }, []);
  const setQuickRange = useCallback((days: DashboardQuickRangeDays) => {
    const nextState = resolveDashboardRangeStateOnGlobalChange(
      getDashboardQuickRange(days),
    );
    setRange(nextState.range);
    setWarrantyRange(nextState.warrantyRange);
    setActivationRequestRange(nextState.activationRequestRange);
  }, []);
  const warrantyRangeQuery = useMemo(
    () => ({
      from: effectiveWarrantyRange.from,
      to: effectiveWarrantyRange.to,
    }),
    [effectiveWarrantyRange.from, effectiveWarrantyRange.to],
  );
  const activationRequestRangeQuery = useMemo(
    () => ({
      from: effectiveActivationRequestRange.from,
      to: effectiveActivationRequestRange.to,
    }),
    [effectiveActivationRequestRange.from, effectiveActivationRequestRange.to],
  );
  const rangeQuery = useMemo(
    () => ({
      from: range.from,
      to: range.to,
    }),
    [range.from, range.to],
  );
  const activationCodeReportFilters = useMemo(
    () => ({
      dateFrom: toDashboardDateBoundary(range.from, "start"),
      dateTo: toDashboardDateBoundary(range.to, "end"),
    }),
    [range.from, range.to],
  );
  const activationCodeReportQuery = useDashboardActivationCodeReport(
    activationCodeReportFilters,
    { enabled: enabled && canViewActivationCodes },
  );

  const claimsQuery = useDashboardClaims(rangeQuery, { enabled });
  const warrantiesQuery = useDashboardWarranties(warrantyRangeQuery, {
    enabled,
  });
  const warrantiesTrendQuery = useDashboardTrends(
    {
      ...warrantyRangeQuery,
      interval: warrantyInterval,
      metric: "warranty_activated",
    },
    { enabled },
  );
  const activationRequestsQuery = useDashboardActivationRequests(
    activationRequestRangeQuery,
    {
      enabled,
    },
  );
  const activationRequestsTrendQuery = useDashboardTrends(
    {
      ...activationRequestRangeQuery,
      interval: activationRequestInterval,
      metric: "warranty_activation_requests",
    },
    { enabled },
  );
  const trendsQuery = useDashboardTrends(
    {
      ...rangeQuery,
      interval,
      metric: DASHBOARD_TREND_METRIC,
    },
    { enabled },
  );
  const recentClaimsQuery = useWarrantyClaims(
    {
      dateFrom: toDashboardDateBoundary(range.from, "start"),
      dateTo: toDashboardDateBoundary(range.to, "end"),
      limit: 5,
      page: 1,
      sortBy: "submittedAt",
      sortOrder: "desc",
    },
    { enabled: enabled && canViewClaims },
  );

  return {
    activationRequestRange: effectiveActivationRequestRange,
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
    setRange: setDashboardRange,
    setWarrantyQuickRange,
    setWarrantyRange,
    trendsQuery,
    warrantyRange: effectiveWarrantyRange,
    warrantiesQuery,
    warrantiesTrendQuery,
  };
}
