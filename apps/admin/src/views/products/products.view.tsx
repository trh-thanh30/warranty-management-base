"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { DeleteProductDialog } from "./components/delete-product-dialog";
import { ProductsDirectoryCard } from "./components/products-directory-card";
import { useProductsDirectory } from "./hooks/use-products-directory";

export function ProductsView() {
  const t = useTranslations("Products");
  const {
    canCreateProducts,
    categories,
    clearFilters,
    closeDelete,
    confirmDelete,
    filters,
    isDeleting,
    openDelete,
    pageSize,
    productToDelete,
    productsQuery,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    toggleSort,
    updateCategory,
    updateCategoryId,
    updateSearch,
    updateStatus,
    updateWarrantyStatus,
  } = useProductsDirectory();

  return (
    <PermissionGuard permissions={[PERMISSIONS.PRODUCT_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            canCreateProducts ? (
              <Button asChild>
                <Link href="/products/create">
                  <Plus className="size-4" />
                  {t("create")}
                </Link>
              </Button>
            ) : null
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <ProductsDirectoryCard
          canCreate={canCreateProducts}
          categories={categories}
          data={productsQuery.data}
          filters={filters}
          isError={productsQuery.isError}
          isLoading={productsQuery.isLoading}
          onCategoryChange={updateCategory}
          onCategoryIdChange={updateCategoryId}
          onClearFilters={clearFilters}
          onDelete={openDelete}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRetry={() => {
            void productsQuery.refetch();
          }}
          onSearchChange={updateSearch}
          onSortChange={toggleSort}
          onStatusChange={updateStatus}
          onWarrantyStatusChange={updateWarrantyStatus}
          pageSize={pageSize}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />

        <DeleteProductDialog
          isDeleting={isDeleting}
          onConfirm={() => {
            void confirmDelete();
          }}
          onOpenChange={(open) => {
            if (!open) closeDelete();
          }}
          open={Boolean(productToDelete)}
          product={productToDelete}
        />
      </div>
    </PermissionGuard>
  );
}
