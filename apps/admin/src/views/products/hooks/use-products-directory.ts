"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import type {
  CategoryResponse,
  ListProductsQuery,
  ProductResponse,
  ProductSortBy,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { productsService } from "@/src/services/products/products.service";
import type { ExcelImportMode } from "@/src/components/common/excel-import-dialog";
import { useCategories } from "../../categories/hooks/use-categories";
import {
  type ProductCategoryFilter,
  type ProductStatusFilter,
  type WarrantyStatusFilter,
} from "../products.types";
import {
  useDeleteProduct,
  usePreviewProductImport,
  useProducts,
} from "./use-products";

const PRODUCTS_PAGE_SIZE = 10;

type ProductDirectoryFilters = {
  category: ProductCategoryFilter;
  categoryId: string;
  status: ProductStatusFilter;
  warrantyStatus: WarrantyStatusFilter;
};

const INITIAL_PRODUCT_DIRECTORY_FILTERS = {
  category: "ALL",
  categoryId: "ALL",
  status: "ALL",
  warrantyStatus: "ALL",
} satisfies ProductDirectoryFilters;

export function useProductsDirectory() {
  const t = useTranslations("Products");
  const toast = useToast();
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
  } = useTableControls<ProductDirectoryFilters, ProductSortBy>({
    initialFilters: INITIAL_PRODUCT_DIRECTORY_FILTERS,
    initialPageSize: PRODUCTS_PAGE_SIZE,
    initialSortBy: "createdAt",
    initialSortOrder: "desc",
  });
  const [productToDelete, setProductToDelete] =
    useState<ProductResponse | null>(null);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canViewProducts = hasPermission(PERMISSIONS.PRODUCT_VIEW);
  const canCreateProducts = hasPermission(PERMISSIONS.PRODUCT_CREATE);
  const productsQuery = useProducts(
    {
      category: filters.category === "ALL" ? undefined : filters.category,
      categoryId: filters.categoryId === "ALL" ? undefined : filters.categoryId,
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: filters.status === "ALL" ? undefined : filters.status,
      warrantyStatus:
        filters.warrantyStatus === "ALL" ? undefined : filters.warrantyStatus,
    },
    {
      enabled: Boolean(currentUser) && canViewProducts,
    },
  );
  const categoriesQuery = useCategories(
    {
      isActive: "true",
      limit: 100,
      sortBy: "order",
      sortOrder: "asc",
      type: "PRODUCT",
    },
    { enabled: Boolean(currentUser) && canViewProducts },
  );
  const deleteProduct = useDeleteProduct();
  const previewProductImport = usePreviewProductImport();

  function clearFilters() {
    setSearch("");
    setFilters(INITIAL_PRODUCT_DIRECTORY_FILTERS);
    setPage(1);
  }

  function openDelete(product: ProductResponse) {
    setProductToDelete(product);
  }

  function closeDelete() {
    setProductToDelete(null);
  }

  async function confirmDelete() {
    if (!productToDelete) return;

    try {
      await deleteProduct.mutateAsync(productToDelete.id);
      toast.success(t("deleted"));
      closeDelete();
    } catch {
      toast.error(t("deleteError"));
    }
  }

  async function downloadImportTemplate() {
    try {
      const blob = await productsService.downloadImportTemplate();
      downloadBlob(blob, "product-import-template.xlsx");
      toast.success(t("excel.templateDownloaded"));
    } catch {
      toast.error(t("excel.templateDownloadError"));
    }
  }

  async function exportProducts() {
    try {
      const blob = await productsService.exportProducts(getExportQuery());
      downloadBlob(
        blob,
        `products-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      toast.success(t("excel.exported"));
    } catch {
      toast.error(t("excel.exportError"));
    }
  }

  async function previewImport(file: File, mode: ExcelImportMode) {
    try {
      const result = await previewProductImport.mutateAsync(file);
      const message =
        result.invalidRows > 0
          ? t("excel.importPreviewHasErrors", {
              invalid: result.invalidRows,
              total: result.totalRows,
              valid: result.validRows,
            })
          : t("excel.importPreviewSuccess", {
              total: result.totalRows,
              valid: result.validRows,
            });

      if (result.invalidRows > 0 || mode === "replace") {
        toast.info(message);
      } else {
        toast.success(message);
      }

      setImportDialogOpen(false);
    } catch {
      toast.error(t("excel.importPreviewError"));
    }
  }

  function getExportQuery(): ListProductsQuery {
    return {
      category: filters.category === "ALL" ? undefined : filters.category,
      categoryId: filters.categoryId === "ALL" ? undefined : filters.categoryId,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: filters.status === "ALL" ? undefined : filters.status,
      warrantyStatus:
        filters.warrantyStatus === "ALL" ? undefined : filters.warrantyStatus,
    };
  }

  return {
    canCreateProducts,
    categories: categoriesQuery.data?.items ?? ([] as CategoryResponse[]),
    categoriesQuery,
    clearFilters,
    closeDelete,
    confirmDelete,
    filters,
    isDeleting: deleteProduct.isPending,
    isImportDialogOpen,
    isImportPreviewing: previewProductImport.isPending,
    openDelete,
    openImportDialog: () => setImportDialogOpen(true),
    pageSize,
    productToDelete,
    productsQuery,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    closeImportDialog: () => setImportDialogOpen(false),
    downloadImportTemplate,
    exportProducts,
    previewImport,
    toggleSort,
    updateCategory: filterHandlers.category,
    updateCategoryId: filterHandlers.categoryId,
    updateSearch: setSearch,
    updateStatus: filterHandlers.status,
    updateWarrantyStatus: filterHandlers.warrantyStatus,
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
