"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { ExcelImportDialog, ImportExportMenu } from "@/src/components/common";
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
    closeImportDialog,
    downloadImportTemplate,
    exportProducts,
    isDeleting,
    isImportDialogOpen,
    isImportPreviewing,
    openDelete,
    openImportDialog,
    pageSize,
    previewImport,
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
            <div className="flex flex-wrap justify-end gap-2">
              <ImportExportMenu
                labels={{
                  downloadTemplate: t("excel.downloadTemplate"),
                  exportAll: t("excel.exportAll"),
                  title: t("excel.title"),
                  upload: t("excel.upload"),
                }}
                onDownloadTemplate={() => {
                  void downloadImportTemplate();
                }}
                onExportAll={() => {
                  void exportProducts();
                }}
                onUpload={openImportDialog}
                uploadDisabled={!canCreateProducts}
              />
              {canCreateProducts ? (
                <Button asChild>
                  <Link href="/products/create">
                    <Plus className="size-4" />
                    {t("create")}
                  </Link>
                </Button>
              ) : null}
            </div>
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

        <ExcelImportDialog
          description={t("excel.importDescription")}
          isSubmitting={isImportPreviewing}
          labels={{
            cancel: t("cancel"),
            chooseFile: t("excel.chooseFile"),
            execute: t("excel.execute"),
            fileHelp: t("excel.fileHelp"),
            fileLabel: t("excel.fileLabel"),
            modeLabel: t("excel.modeLabel"),
            replaceDescription: t("excel.replaceDescription"),
            replaceLabel: t("excel.replaceLabel"),
            title: t("excel.importTitle"),
            upsertDescription: t("excel.upsertDescription"),
            upsertLabel: t("excel.upsertLabel"),
          }}
          onOpenChange={(open) => {
            if (!open) closeImportDialog();
          }}
          onSubmit={previewImport}
          open={isImportDialogOpen}
        />
      </div>
    </PermissionGuard>
  );
}
