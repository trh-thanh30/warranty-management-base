"use client";

import { useState } from "react";
import { useDebounce } from "@repo/hooks";
import type { WarrantyListItem } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useWarranties } from "@/src/hooks/use-warranties";
import type { WarrantySortBy, WarrantyStatusFilter } from "../warranties.types";

const WARRANTIES_PAGE_SIZE = 10;

type WarrantyDirectoryFilters = {
  status: WarrantyStatusFilter;
};

const INITIAL_WARRANTY_DIRECTORY_FILTERS = {
  status: "ALL",
} satisfies WarrantyDirectoryFilters;

export function useWarrantiesDirectory() {
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
  } = useTableControls<WarrantyDirectoryFilters, WarrantySortBy>({
    initialFilters: INITIAL_WARRANTY_DIRECTORY_FILTERS,
    initialPageSize: WARRANTIES_PAGE_SIZE,
    initialSortBy: "createdAt",
    initialSortOrder: "desc",
  });
  const [warrantyToActivate, setWarrantyToActivate] =
    useState<WarrantyListItem | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canViewWarranties = hasPermission(PERMISSIONS.WARRANTY_VIEW);
  const warrantiesQuery = useWarranties(
    {
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: filters.status === "ALL" ? undefined : filters.status,
    },
    {
      enabled: Boolean(currentUser) && canViewWarranties,
    },
  );

  function clearFilters() {
    setSearch("");
    setFilters(INITIAL_WARRANTY_DIRECTORY_FILTERS);
    setPage(1);
  }

  function openActivate(warranty: WarrantyListItem) {
    setWarrantyToActivate(warranty);
  }

  function closeActivate() {
    setWarrantyToActivate(null);
  }

  return {
    clearFilters,
    closeActivate,
    filters,
    openActivate,
    pageSize,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    toggleSort,
    updateSearch: setSearch,
    updateStatus: filterHandlers.status,
    warrantiesQuery,
    warrantyToActivate,
  };
}
