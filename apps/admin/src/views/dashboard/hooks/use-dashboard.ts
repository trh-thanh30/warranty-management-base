"use client";

import { useMemo, useState } from "react";
import { PERMISSIONS } from "@repo/shared/constants";
import type { DateRangeValue } from "@repo/ui/date-range-picker";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useWarrantyClaims } from "@/src/hooks/use-warranty-claims";
import {
  DASHBOARD_TREND_METRIC,
  getDashboardTrendInterval,
  getDefaultDashboardRange,
  toDashboardDateBoundary,
} from "../dashboard.utils";
import {
  useDashboardClaims,
  useDashboardTrends,
} from "./use-dashboard-analytics";

export function useDashboard() {
  const [range, setRange] = useState<DateRangeValue>(getDefaultDashboardRange);
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canViewDashboard = hasPermission(PERMISSIONS.DASHBOARD_VIEW);
  const canViewClaims = hasPermission(PERMISSIONS.WARRANTY_CLAIM_VIEW);
  const enabled = Boolean(user) && canViewDashboard;
  const interval = getDashboardTrendInterval(range);
  const rangeQuery = useMemo(
    () => ({
      from: range.from,
      to: range.to,
    }),
    [range.from, range.to],
  );

  const claimsQuery = useDashboardClaims(rangeQuery, { enabled });
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
    canViewClaims,
    claimsQuery,
    range,
    recentClaimsQuery,
    setRange,
    trendsQuery,
  };
}
