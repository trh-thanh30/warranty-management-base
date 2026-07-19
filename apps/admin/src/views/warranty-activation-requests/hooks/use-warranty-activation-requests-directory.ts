"use client";

import { useDebounce } from "@repo/hooks";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useWarrantyActivationRequests } from "@/src/hooks/use-warranty-activation-requests";
import { WARRANTY_ACTIVATION_REQUESTS_PAGE_SIZE } from "../warranty-activation-requests.constants";
import type {
  WarrantyActivationRequestDirectoryFilters,
  WarrantyActivationRequestSort,
} from "../warranty-activation-requests.types";
import { useWarrantyActivationRequestActions } from "./use-warranty-activation-request-actions";

const INITIAL_FILTERS = {
  dateFrom: "",
  dateTo: "",
  status: "ALL",
  warrantyCode: "",
} satisfies WarrantyActivationRequestDirectoryFilters;

export function useWarrantyActivationRequestsDirectory() {
  const actions = useWarrantyActivationRequestActions();
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
  } = useTableControls<
    WarrantyActivationRequestDirectoryFilters,
    WarrantyActivationRequestSort
  >({
    initialFilters: INITIAL_FILTERS,
    initialPageSize: WARRANTY_ACTIVATION_REQUESTS_PAGE_SIZE,
    initialSortBy: "createdAt",
    initialSortOrder: "desc",
  });
  const debouncedSearch = useDebounce(search.trim(), 300);
  const enabled =
    Boolean(currentUser) && hasPermission(PERMISSIONS.WARRANTY_VIEW);
  const requestsQuery = useWarrantyActivationRequests(
    {
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: filters.status === "ALL" ? undefined : filters.status,
      warrantyCode: filters.warrantyCode.trim().toUpperCase() || undefined,
    },
    { enabled },
  );

  function clearFilters() {
    setSearch("");
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }

  return {
    actions,
    clearFilters,
    filters,
    pageSize,
    requestsQuery,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    toggleSort,
    updateDateFrom: filterHandlers.dateFrom,
    updateDateTo: filterHandlers.dateTo,
    updateSearch: setSearch,
    updateStatusFilter: filterHandlers.status,
    updateWarrantyCode: filterHandlers.warrantyCode,
  };
}
