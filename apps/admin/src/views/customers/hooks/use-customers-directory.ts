"use client";

import { useState } from "react";
import { useDebounce } from "@repo/hooks";
import type { CustomerSummary } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useRouter } from "@/src/i18n/navigation";
import { useCustomers } from "./use-customers";

const CUSTOMERS_PAGE_SIZE = 10;

export function useCustomersDirectory() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canViewCustomers = hasPermission(PERMISSIONS.CUSTOMER_VIEW);
  const canCreateCustomers = hasPermission(PERMISSIONS.CUSTOMER_CREATE);
  const customersQuery = useCustomers(
    {
      limit: CUSTOMERS_PAGE_SIZE,
      page,
      search: debouncedSearch || undefined,
    },
    {
      enabled: Boolean(currentUser) && canViewCustomers,
    },
  );

  function openCreate() {
    router.push("/customers/create");
  }

  function openEdit(customer: CustomerSummary) {
    router.push(`/customers/${customer.id}/edit`);
  }

  function updateSearch(nextSearch: string) {
    setSearch(nextSearch);
    setPage(1);
  }

  return {
    canCreateCustomers,
    customersQuery,
    openCreate,
    openEdit,
    search,
    setPage,
    updateSearch,
  };
}
