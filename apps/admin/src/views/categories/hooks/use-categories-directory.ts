"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import type { CategoryResponse, CategorySortBy } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { CATEGORIES_PAGE_SIZE } from "../categories.constants";
import type {
  CategoryStatusFilter,
  CategoryTypeFilter,
} from "../categories.types";
import { useCategories, useDeactivateCategory } from "./use-categories";

type CategoryDirectoryFilters = {
  status: CategoryStatusFilter;
  type: CategoryTypeFilter;
};

const INITIAL_CATEGORY_DIRECTORY_FILTERS = {
  status: "ALL",
  type: "ALL",
} satisfies CategoryDirectoryFilters;

export function useCategoriesDirectory() {
  const t = useTranslations("Categories");
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const {
    filterHandlers,
    filters,
    page,
    pageSize,
    resetControls,
    search,
    setPage,
    setPageSize,
    setSearch,
    sortBy,
    sortOrder,
    toggleSort,
  } = useTableControls<CategoryDirectoryFilters, CategorySortBy>({
    initialFilters: INITIAL_CATEGORY_DIRECTORY_FILTERS,
    initialPageSize: CATEGORIES_PAGE_SIZE,
    initialSortBy: "order",
    initialSortOrder: "asc",
  });
  const [categoryToDeactivate, setCategoryToDeactivate] =
    useState<CategoryResponse | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { status, type } = filters;
  const canViewCategories = hasPermission(PERMISSIONS.CATEGORY_VIEW);
  const canCreateCategories = hasPermission(PERMISSIONS.CATEGORY_CREATE);
  const deactivateCategory = useDeactivateCategory();
  const categoriesQuery = useCategories(
    {
      isActive: toIsActiveQuery(status),
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      type: type === "ALL" ? undefined : type,
    },
    {
      enabled: Boolean(currentUser) && canViewCategories,
    },
  );

  function openDeactivate(category: CategoryResponse) {
    setCategoryToDeactivate(category);
  }

  function closeDeactivate() {
    setCategoryToDeactivate(null);
  }

  async function confirmDeactivate() {
    if (!categoryToDeactivate) return;

    try {
      await deactivateCategory.mutateAsync(categoryToDeactivate.id);
      toast.success(t("deactivated"));
      setCategoryToDeactivate(null);
    } catch {
      toast.error(t("deactivateError"));
    }
  }

  return {
    canCreateCategories,
    categoriesQuery,
    categoryToDeactivate,
    clearFilters: resetControls,
    closeDeactivate,
    confirmDeactivate,
    isDeactivating: deactivateCategory.isPending,
    openDeactivate,
    pageSize,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    status,
    toggleSort,
    type,
    updateSearch: setSearch,
    updateStatus: filterHandlers.status,
    updateType: filterHandlers.type,
  };
}

function toIsActiveQuery(status: CategoryStatusFilter) {
  if (status === "ACTIVE") return "true";
  if (status === "INACTIVE") return "false";

  return undefined;
}
