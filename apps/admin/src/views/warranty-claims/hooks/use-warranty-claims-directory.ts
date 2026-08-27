"use client";

import { useDebounce } from "@repo/hooks";
import { PERMISSIONS } from "@repo/shared/constants";
import { useTranslations } from "next-intl";
import { useAuth } from "@/src/app/providers/auth-provider";
import { useExcel } from "@/src/hooks/use-excel";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useActiveServiceCenters } from "@/src/hooks/use-service-centers";
import { useTableControls } from "@/src/hooks/use-table-controls";
import {
  useWarrantyClaimMetrics,
  useWarrantyClaims,
} from "@/src/hooks/use-warranty-claims";
import { useToast } from "@/src/hooks/use-toast";
import { warrantyClaimsService } from "@/src/services/warranty-claims/warranty-claims.service";
import { WARRANTY_CLAIMS_PAGE_SIZE } from "../warranty-claims.constants";
import type {
  WarrantyClaimDirectoryFilters,
  WarrantyClaimSort,
} from "../warranty-claims.types";
import { buildWarrantyClaimListQuery } from "../warranty-claims.utils";
import { useWarrantyClaimDirectoryActions } from "./use-warranty-claim-directory-actions";

const INITIAL_FILTERS = {
  dateFrom: "",
  dateTo: "",
  isOverdue: "ALL",
  priority: "ALL",
  serviceCenter: "ALL",
  status: "ALL",
} satisfies WarrantyClaimDirectoryFilters;

export function useWarrantyClaimsDirectory() {
  const t = useTranslations("WarrantyClaims");
  const toast = useToast();
  const { createDatedFilename, downloadBlob } = useExcel();
  const actions = useWarrantyClaimDirectoryActions();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const {
    filterHandlers,
    filters,
    page,
    pageSize,
    search,
    setFilters,
    setPage,
    setPageSize,
    setSearch,
    sortBy,
    sortOrder,
    toggleSort,
  } = useTableControls<WarrantyClaimDirectoryFilters, WarrantyClaimSort>({
    initialFilters: INITIAL_FILTERS,
    initialPageSize: WARRANTY_CLAIMS_PAGE_SIZE,
    initialSortBy: "createdAt",
    initialSortOrder: "desc",
  });
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canViewClaims = hasPermission(PERMISSIONS.WARRANTY_CLAIM_VIEW);
  const enabled = Boolean(currentUser) && canViewClaims;
  const listQuery = buildWarrantyClaimListQuery(
    filters,
    debouncedSearch,
    page,
    pageSize,
    sortBy ?? "createdAt",
    sortOrder,
  );
  const claimsQuery = useWarrantyClaims(listQuery, { enabled });
  const metricsQuery = useWarrantyClaimMetrics(
    {
      assignmentStatus:
        filters.serviceCenter === "UNASSIGNED" ? "UNASSIGNED" : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      serviceCenterId:
        filters.serviceCenter === "ALL" ||
        filters.serviceCenter === "UNASSIGNED"
          ? undefined
          : filters.serviceCenter,
    },
    { enabled },
  );
  const serviceCentersQuery = useActiveServiceCenters({ enabled });

  function clearFilters() {
    setSearch("");
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }

  async function exportClaims() {
    try {
      const blob = await warrantyClaimsService.exportWarrantyClaims(listQuery);
      downloadBlob(blob, createDatedFilename("warranty-claims"));
      toast.success(t("excel.exported"));
    } catch {
      toast.error(t("excel.exportError"));
    }
  }

  return {
    actions,
    clearFilters,
    claimsQuery,
    exportClaims,
    filters,
    metricsQuery,
    pageSize,
    search,
    serviceCenters: serviceCentersQuery.data?.items ?? [],
    serviceCentersQuery,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    toggleSort,
    updateDateFrom: filterHandlers.dateFrom,
    updateDateTo: filterHandlers.dateTo,
    updateOverdue: filterHandlers.isOverdue,
    updatePriorityFilter: filterHandlers.priority,
    updateSearch: setSearch,
    updateServiceCenter: filterHandlers.serviceCenter,
    updateStatusFilter: filterHandlers.status,
  };
}
