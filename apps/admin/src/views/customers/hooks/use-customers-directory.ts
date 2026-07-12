"use client";

import { useDebounce } from "@repo/hooks";
import type { ListCustomersQuery } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useCustomers } from "./use-customers";

const CUSTOMERS_PAGE_SIZE = 10;
type CustomerSortBy = NonNullable<ListCustomersQuery["sortBy"]>;

export function useCustomersDirectory() {
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const {
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    sortBy,
    sortOrder,
    toggleSort,
  } = useTableControls<Record<never, never>, CustomerSortBy>({
    initialPageSize: CUSTOMERS_PAGE_SIZE,
    initialSortBy: "createdAt",
    initialSortOrder: "desc",
  });
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canViewCustomers = hasPermission(PERMISSIONS.CUSTOMER_VIEW);
  const canCreateCustomers = hasPermission(PERMISSIONS.CUSTOMER_CREATE);
  const customersQuery = useCustomers(
    {
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
    },
    {
      enabled: Boolean(currentUser) && canViewCustomers,
    },
  );

  return {
    canCreateCustomers,
    customersQuery,
    pageSize,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    toggleSort,
    updateSearch: setSearch,
  };
}
