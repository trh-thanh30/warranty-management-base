"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import type {
  CategoryResponse,
  ProductResponse,
  ProductSortBy,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { useCategories } from "../../categories/hooks/use-categories";
import {
  type ProductCategoryFilter,
  type ProductStatusFilter,
  type WarrantyStatusFilter,
} from "../products.types";
import { useDeleteProduct, useProducts } from "./use-products";

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
  const [productToAssign, setProductToAssign] =
    useState<ProductResponse | null>(null);
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

  function openAssignOwner(product: ProductResponse) {
    setProductToAssign(product);
  }

  function closeAssignOwner() {
    setProductToAssign(null);
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

  return {
    canCreateProducts,
    categories: categoriesQuery.data?.items ?? ([] as CategoryResponse[]),
    categoriesQuery,
    clearFilters,
    closeDelete,
    closeAssignOwner,
    confirmDelete,
    filters,
    isDeleting: deleteProduct.isPending,
    openDelete,
    openAssignOwner,
    pageSize,
    productToDelete,
    productToAssign,
    productsQuery,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    toggleSort,
    updateCategory: filterHandlers.category,
    updateCategoryId: filterHandlers.categoryId,
    updateSearch: setSearch,
    updateStatus: filterHandlers.status,
    updateWarrantyStatus: filterHandlers.warrantyStatus,
  };
}
