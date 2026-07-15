"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type {
  AnalyticsDashboardClaims,
  AnalyticsDashboardTrends,
  AnalyticsRangeQuery,
  AnalyticsTrendsQuery,
} from "@repo/shared";
import { analyticsService } from "@/src/services/analytics/analytics.service";

export const dashboardAnalyticsKeys = {
  all: ["analytics", "dashboard"] as const,
  claims: (query: AnalyticsRangeQuery) =>
    [...dashboardAnalyticsKeys.all, "claims", query] as const,
  trends: (query: AnalyticsTrendsQuery) =>
    [...dashboardAnalyticsKeys.all, "trends", query] as const,
};

export function useDashboardClaims(
  query: AnalyticsRangeQuery,
  options?: Pick<UseQueryOptions<AnalyticsDashboardClaims>, "enabled">,
) {
  return useQuery({
    ...options,
    queryFn: () => analyticsService.claims(query),
    queryKey: dashboardAnalyticsKeys.claims(query),
  });
}

export function useDashboardTrends(
  query: AnalyticsTrendsQuery,
  options?: Pick<UseQueryOptions<AnalyticsDashboardTrends>, "enabled">,
) {
  return useQuery({
    ...options,
    queryFn: () => analyticsService.trends(query),
    queryKey: dashboardAnalyticsKeys.trends(query),
  });
}
