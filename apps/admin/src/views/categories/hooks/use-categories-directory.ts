"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import type { CategoryResponse, CategorySortBy } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useExcel } from "@/src/hooks/use-excel";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { categoriesService } from "@/src/services/categories/categories.service";
import { CATEGORIES_PAGE_SIZE } from "../categories.constants";
import type {
  CategoryStatusFilter,
  CategoryTypeFilter,
} from "../categories.types";
import {
  useCategories,
  useDeactivateCategory,
  useImportCategories,
} from "./use-categories";

type CategoryDirectoryFilters = {
  status: CategoryStatusFilter;
  type: CategoryTypeFilter;
};

const INITIAL_CATEGORY_DIRECTORY_FILTERS = {
  status: "ALL",
  type: "PRODUCT",
} satisfies CategoryDirectoryFilters;

export function useCategoriesDirectory() {
  const t = useTranslations("Categories");
  const toast = useToast();
  const { createDatedFilename, downloadBlob } = useExcel();
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
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { status, type } = filters;
  const canViewCategories = hasPermission(PERMISSIONS.CATEGORY_VIEW);
  const canCreateCategories = hasPermission(PERMISSIONS.CATEGORY_CREATE);
  const deactivateCategory = useDeactivateCategory();
  const importCategories = useImportCategories();
  const categoriesQuery = useCategories(
    {
      isActive: toIsActiveQuery(status),
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      type,
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

  async function downloadImportTemplate() {
    try {
      const blob = await categoriesService.downloadImportTemplate();
      downloadBlob(blob, "category-import-template.xlsx");
      toast.success(t("excel.templateDownloaded"));
    } catch {
      toast.error(t("excel.templateDownloadError"));
    }
  }

  async function exportCategories() {
    try {
      const blob = await categoriesService.exportCategories({
        isActive: toIsActiveQuery(status),
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
        type,
      });
      downloadBlob(blob, createDatedFilename("categories"));
      toast.success(t("excel.exported"));
    } catch {
      toast.error(t("excel.exportError"));
    }
  }

  async function importCategoryFile(file: File) {
    try {
      const result = await importCategories.mutateAsync(file);
      if (result.errors.length > 0) {
        toast.error(
          t("excel.importHasErrors", {
            count: result.errors.length,
            row: result.errors[0]?.rowNumber ?? 0,
          }),
        );
        return;
      }

      toast.success(
        t("excel.importSuccess", {
          created: result.created,
          updated: result.updated,
        }),
      );
      setImportDialogOpen(false);
      void categoriesQuery.refetch();
    } catch {
      toast.error(t("excel.importError"));
    }
  }

  return {
    canCreateCategories,
    categoriesQuery,
    categoryToDeactivate,
    clearFilters: resetControls,
    closeImportDialog: () => setImportDialogOpen(false),
    closeDeactivate,
    confirmDeactivate,
    downloadImportTemplate,
    exportCategories,
    importCategoryFile,
    isImportDialogOpen,
    isImporting: importCategories.isPending,
    isDeactivating: deactivateCategory.isPending,
    openDeactivate,
    openImportDialog: () => setImportDialogOpen(true),
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
