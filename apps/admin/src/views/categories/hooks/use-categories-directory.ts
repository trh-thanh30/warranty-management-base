"use client";

import { useState } from "react";
import { useDebounce } from "@repo/hooks";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { CATEGORIES_PAGE_SIZE } from "../categories.constants";
import type {
  CategoryStatusFilter,
  CategoryTypeFilter,
} from "../categories.types";
import { useCategories } from "./use-categories";

export function useCategoriesDirectory() {
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<CategoryTypeFilter>("ALL");
  const [status, setStatus] = useState<CategoryStatusFilter>("ALL");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canViewCategories = hasPermission(PERMISSIONS.CATEGORY_VIEW);
  const categoriesQuery = useCategories(
    {
      isActive: toIsActiveQuery(status),
      limit: CATEGORIES_PAGE_SIZE,
      page,
      search: debouncedSearch || undefined,
      sortBy: "order",
      sortOrder: "asc",
      type: type === "ALL" ? undefined : type,
    },
    {
      enabled: Boolean(currentUser) && canViewCategories,
    },
  );

  function updateSearch(nextSearch: string) {
    setSearch(nextSearch);
    setPage(1);
  }

  function updateType(nextType: CategoryTypeFilter) {
    setType(nextType);
    setPage(1);
  }

  function updateStatus(nextStatus: CategoryStatusFilter) {
    setStatus(nextStatus);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setType("ALL");
    setStatus("ALL");
    setPage(1);
  }

  return {
    categoriesQuery,
    clearFilters,
    search,
    setPage,
    status,
    type,
    updateSearch,
    updateStatus,
    updateType,
  };
}

function toIsActiveQuery(status: CategoryStatusFilter) {
  if (status === "ACTIVE") return "true";
  if (status === "INACTIVE") return "false";

  return undefined;
}
