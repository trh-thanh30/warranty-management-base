"use client";

import { ChevronDown, Layers3, PackagePlus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ProductResponse } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui";
import { ExcelImportDialog, ImportExportMenu } from "@/src/components/common";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { AssignOwnerDialog } from "./components/assign-owner-dialog";
import { CreateTemplateFromProductDialog } from "./components/create-template-from-product-dialog";
import { DeleteProductDialog } from "./components/delete-product-dialog";
import { ProductImportPreviewTable } from "./components/product-import-preview-table";
import { ProductManagementTabs } from "../product-management/components/product-management-tabs";
import { ProductsDirectoryCard } from "./components/products-directory-card";
import { useProductsDirectory } from "./hooks/use-products-directory";
import { useCreateProductTemplateFromProduct } from "@/src/hooks/use-product-templates";
import { useToast } from "@/src/hooks/use-toast";
import { useRouter } from "@/src/i18n/navigation";

export function ProductsView() {
  const t = useTranslations("Products");
  const toast = useToast();
  const router = useRouter();
  const createTemplate = useCreateProductTemplateFromProduct();
  const [productToAssignOwner, setProductToAssignOwner] =
    useState<ProductResponse | null>(null);
  const [productToCreateTemplate, setProductToCreateTemplate] =
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
    updateCategoryId,
    updatePublication,
    updateSearch,
    updateStatus,
    updateImportRowData,
  } = useProductsDirectory();
  const hasImportErrors = importSummary.invalidRows > 0;

  async function confirmCreateTemplate() {
    if (!productToCreateTemplate) return;
    try {
      const template = await createTemplate.mutateAsync(
        productToCreateTemplate.id,
      );
      setProductToCreateTemplate(null);
      toast.success(t("templateCreatedFromProduct"));
      router.push(`/product-templates/${template.id}/edit`);
    } catch {
      toast.error(t("createTemplateFromProductError"));
    }
  }

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
              {canCreateProducts ? <CreateProductMenu /> : null}
            </div>
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <ProductManagementTabs activeTab="products" />

        <ProductsDirectoryCard
          canCreate={canCreateProducts}
          categories={categories}
          data={productsQuery.data}
          filters={filters}
          isError={productsQuery.isError}
          isLoading={productsQuery.isLoading}
          onCategoryIdChange={updateCategoryId}
          onAssignOwner={setProductToAssignOwner}
          onClearFilters={clearFilters}
          onDelete={openDelete}
          onCreateTemplate={setProductToCreateTemplate}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onPublicationChange={updatePublication}
          onRetry={() => {
            void productsQuery.refetch();
          }}
          onSearchChange={updateSearch}
          onSortChange={toggleSort}
          onStatusChange={updateStatus}
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

        <CreateTemplateFromProductDialog
          isCreating={createTemplate.isPending}
          onConfirm={() => void confirmCreateTemplate()}
          onOpenChange={(open) => {
            if (!open) setProductToCreateTemplate(null);
          }}
          open={Boolean(productToCreateTemplate)}
          product={productToCreateTemplate}
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

function CreateProductMenu() {
  const t = useTranslations("Products");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <PackagePlus className="size-4" />
          {t("create")}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[22rem] max-w-[calc(100vw-2rem)] p-1.5"
      >
        <DropdownMenuItem asChild className="items-start rounded-md p-3">
          <Link className="gap-3" href="/product-templates">
            <Layers3 className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0">
              <span className="block font-medium leading-5">
                {t("createFromTemplate")}
              </span>
              <span className="mt-1 block whitespace-normal text-xs leading-5 text-slate-500 dark:text-slate-400">
                {t("createFromTemplateMenuDescription")}
              </span>
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="items-start rounded-md p-3">
          <Link className="gap-3" href="/products/create?mode=independent">
            <PackagePlus className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0">
              <span className="block font-medium leading-5">
                {t("createIndependent")}
              </span>
              <span className="mt-1 block whitespace-normal text-xs leading-5 text-slate-500 dark:text-slate-400">
                {t("createIndependentMenuDescription")}
              </span>
            </span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
