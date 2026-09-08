"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ActivationCodeReport } from "@repo/shared";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";

export type ActivationCodeReportQuery = {
  dateFrom?: string;
  dateTo?: string;
};

export const dashboardActivationCodeKeys = {
  all: ["activation-code-reports", "dashboard"] as const,
  summary: (query: ActivationCodeReportQuery) =>
    [...dashboardActivationCodeKeys.all, "summary", query] as const,
};

export function useDashboardActivationCodeReport(
  query: ActivationCodeReportQuery,
  options?: Pick<UseQueryOptions<ActivationCodeReport>, "enabled">,
) {
  return useQuery({
    ...options,
    queryFn: () => activationCodesService.getReport(query),
    queryKey: dashboardActivationCodeKeys.summary(query),
  });
}
