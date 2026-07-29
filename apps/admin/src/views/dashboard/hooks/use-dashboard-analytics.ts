"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type {
  AnalyticsDashboardActivationRequests,
  AnalyticsDashboardClaims,
  AnalyticsDashboardTrends,
  AnalyticsDashboardWarranties,
  AnalyticsRangeQuery,
  AnalyticsTrendsQuery,
} from "@repo/shared";
import { analyticsService } from "@/src/services/analytics/analytics.service";

export const dashboardAnalyticsKeys = {
  all: ["analytics", "dashboard"] as const,
  activationRequests: (query: AnalyticsRangeQuery) =>
    [...dashboardAnalyticsKeys.all, "activation-requests", query] as const,
  claims: (query: AnalyticsRangeQuery) =>
    [...dashboardAnalyticsKeys.all, "claims", query] as const,
  trends: (query: AnalyticsTrendsQuery) =>
    [...dashboardAnalyticsKeys.all, "trends", query] as const,
  warranties: (query: AnalyticsRangeQuery) =>
    [...dashboardAnalyticsKeys.all, "warranties", query] as const,
};

export function useDashboardActivationRequests(
  query: AnalyticsRangeQuery,
  options?: Pick<
    UseQueryOptions<AnalyticsDashboardActivationRequests>,
    "enabled"
  >,
) {
  return useQuery({
    ...options,
    queryFn: () => analyticsService.activationRequests(query),
    queryKey: dashboardAnalyticsKeys.activationRequests(query),
  });
}

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

export function useDashboardWarranties(
  query: AnalyticsRangeQuery,
  options?: Pick<UseQueryOptions<AnalyticsDashboardWarranties>, "enabled">,
) {
  return useQuery({
    ...options,
    queryFn: () => analyticsService.warranties(query),
    queryKey: dashboardAnalyticsKeys.warranties(query),
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
