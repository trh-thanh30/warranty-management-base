"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ProductResponse } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { Badge, Button } from "@repo/ui";
import { ExcelImportDialog, ImportExportMenu } from "@/src/components/common";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { AssignOwnerDialog } from "./components/assign-owner-dialog";
import { DeleteProductDialog } from "./components/delete-product-dialog";
import { ProductImportPreviewTable } from "./components/product-import-preview-table";
import { ProductsDirectoryCard } from "./components/products-directory-card";
import { useProductsDirectory } from "./hooks/use-products-directory";

export function ProductsView() {
  const t = useTranslations("Products");
  const [productToAssignOwner, setProductToAssignOwner] =
    useState<ProductResponse | null>(null);
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
    isImportConfirming,
    isImportDialogOpen,
    isImportPreviewing,
    importRows,
    importSummary,
    openDelete,
    openImportDialog,
    pageSize,
    confirmImport,
    previewImport,
    productToDelete,
    productsQuery,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    removeImportRow,
    resetImportPreview,
    toggleSort,
    updateCategory,
    updateCategoryId,
    updateSearch,
    updateStatus,
    updateWarrantyStatus,
    updateImportRowData,
  } = useProductsDirectory();
  const hasImportErrors = importSummary.invalidRows > 0;

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
          onAssignOwner={setProductToAssignOwner}
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

        <AssignOwnerDialog
          onOpenChange={(open) => {
            if (!open) setProductToAssignOwner(null);
          }}
          open={Boolean(productToAssignOwner)}
          product={productToAssignOwner}
        />

        <ExcelImportDialog
          confirmDisabled={importRows.length === 0 || hasImportErrors}
          description={t("excel.importDescription")}
          isConfirming={isImportConfirming}
          isSubmitting={isImportPreviewing}
          labels={{
            backToUpload: t("excel.backToUpload"),
            cancel: t("cancel"),
            confirmImport: t("excel.confirmImport"),
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
          onBackToUpload={resetImportPreview}
          onConfirm={() => {
            void confirmImport();
          }}
          onSubmit={previewImport}
          open={isImportDialogOpen}
          previewContent={
            importRows.length > 0 ? (
              <ProductImportPreviewTable
                labels={{
                  actions: t("actions"),
                  allRows: t("excel.allRows"),
                  brand: t("brand"),
                  cancel: t("cancel"),
                  category: t("category"),
                  description: t("descriptionLabel"),
                  dynamicCategory: t("dynamicCategory"),
                  edit: t("excel.editRow"),
                  editDescription: t("excel.editRowDescription"),
                  editTitle: t("excel.editRowTitle"),
                  imageUrl: t("excel.imageUrl"),
                  importStatus: t("excel.importStatus"),
                  installationPosition: t("installationPosition"),
                  invalidRows: t("excel.invalidRows", {
                    count: importSummary.invalidRows,
                  }),
                  manufactureYear: t("manufactureYear"),
                  model: t("model"),
                  name: t("name"),
                  next: t("next"),
                  noRows: t("excel.noPreviewRows"),
                  pageSize: t("pageSize"),
                  pagination: (values) => t("excel.previewPagination", values),
                  previous: t("previous"),
                  productCode: t("productCode"),
                  ready: t("excel.ready"),
                  remove: t("excel.removeRow"),
                  row: t("excel.row"),
                  saveChanges: t("excel.saveRowChanges"),
                  serialNumber: t("serialNumber"),
                  status: t("productStatus"),
                  validRows: t("excel.validRows", {
                    count: importSummary.validRows,
                  }),
                  warrantyDurationMonths: t("durationMonths"),
                  warrantyTerms: t("warrantyTerms"),
                  withErrors: t("excel.withErrors"),
                }}
                onEdit={updateImportRowData}
                onRemove={removeImportRow}
                rows={importRows}
              />
            ) : null
          }
          previewSummary={
            importRows.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <Badge variant="secondary">
                  {t("excel.totalRows", { count: importSummary.totalRows })}
                </Badge>
                <Badge variant="success">
                  {t("excel.validRows", { count: importSummary.validRows })}
                </Badge>
                <Badge variant={hasImportErrors ? "destructive" : "secondary"}>
                  {t("excel.invalidRows", {
                    count: importSummary.invalidRows,
                  })}
                </Badge>
                <span className="ml-auto text-xs text-slate-500">
                  {hasImportErrors
                    ? t("excel.fixErrorsBeforeImport")
                    : t("excel.readyToImport")}
                </span>
              </div>
            ) : null
          }
          size="wide"
        />
      </div>
    </PermissionGuard>
  );
}
