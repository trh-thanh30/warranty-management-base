"use client";

import { useDebounce } from "@repo/hooks";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import {
  useActiveServiceCenters,
  useWarrantyClaimMetrics,
  useWarrantyClaims,
} from "@/src/hooks/use-warranty-claims";
import { WARRANTY_CLAIMS_PAGE_SIZE } from "../warranty-claims.constants";
import type {
  WarrantyClaimDirectoryFilters,
  WarrantyClaimSort,
} from "../warranty-claims.types";
import { useWarrantyClaimDirectoryActions } from "./use-warranty-claim-directory-actions";

const INITIAL_FILTERS = {
  claimCode: "",
  dateFrom: "",
  dateTo: "",
  isOverdue: "ALL",
  priority: "ALL",
  serviceCenterId: "ALL",
  status: "ALL",
  warrantyCode: "",
} satisfies WarrantyClaimDirectoryFilters;

export function useWarrantyClaimsDirectory() {
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
  const claimsQuery = useWarrantyClaims(
    {
      claimCode: filters.claimCode.trim().toUpperCase() || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      isOverdue:
        filters.isOverdue === "ALL"
          ? undefined
          : filters.isOverdue === "OVERDUE"
            ? "true"
            : "false",
      limit: pageSize,
      page,
      priority: filters.priority === "ALL" ? undefined : filters.priority,
      search: debouncedSearch || undefined,
      serviceCenterId:
        filters.serviceCenterId === "ALL" ? undefined : filters.serviceCenterId,
      sortBy,
      sortOrder,
      status: filters.status === "ALL" ? undefined : filters.status,
      warrantyCode: filters.warrantyCode.trim().toUpperCase() || undefined,
    },
    { enabled },
  );
  const metricsQuery = useWarrantyClaimMetrics(
    {
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      serviceCenterId:
        filters.serviceCenterId === "ALL" ? undefined : filters.serviceCenterId,
    },
    { enabled },
  );
  const serviceCentersQuery = useActiveServiceCenters({ enabled });

  function clearFilters() {
    setSearch("");
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }

  return {
    actions,
    clearFilters,
    claimsQuery,
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
    updateClaimCode: filterHandlers.claimCode,
    updateDateFrom: filterHandlers.dateFrom,
    updateDateTo: filterHandlers.dateTo,
    updateOverdue: filterHandlers.isOverdue,
    updatePriorityFilter: filterHandlers.priority,
    updateSearch: setSearch,
    updateServiceCenter: filterHandlers.serviceCenterId,
    updateStatusFilter: filterHandlers.status,
    updateWarrantyCode: filterHandlers.warrantyCode,
  };
}
