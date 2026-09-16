"use client";

import {
  useMutation,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { ActivationCodeReport } from "@repo/shared";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import type { ActivationCodeReportFilters } from "@/src/services/activation-codes/activation-codes.types";
import { useExcel } from "@/src/hooks/use-excel";
import { useToast } from "@/src/hooks/use-toast";
import { useTranslations } from "next-intl";

export type ActivationCodeReportQuery = ActivationCodeReportFilters;

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

export function useDashboardActivationCodeReportExport(
  query: ActivationCodeReportQuery,
) {
  const t = useTranslations("Dashboard.activationCodes");
  const toast = useToast();
  const { createDatedFilename, downloadBlob } = useExcel();

  return useMutation({
    mutationFn: () => activationCodesService.exportReport(query),
    onSuccess: (blob) => {
      downloadBlob(blob, createDatedFilename("activation-code-report"));
      toast.success(t("exported"));
    },
    onError: () => toast.error(t("exportError")),
  });
}
