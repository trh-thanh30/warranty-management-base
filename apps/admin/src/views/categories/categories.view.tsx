"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { ExcelImportDialog, ImportExportMenu } from "@/src/components/common";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { CategoriesDirectoryCard } from "./components/categories-directory-card";
import { DeactivateCategoryDialog } from "./components/deactivate-category-dialog";
import { useCategoriesDirectory } from "./hooks/use-categories-directory";

export function CategoriesView() {
  const t = useTranslations("Categories");
  const {
    canCreateCategories,
    categoriesQuery,
    categoryToDeactivate,
    clearFilters,
    closeImportDialog,
    closeDeactivate,
    confirmDeactivate,
    downloadImportTemplate,
    exportCategories,
    importCategoryFile,
    isImportDialogOpen,
    isImporting,
    isDeactivating,
    openDeactivate,
    openImportDialog,
    pageSize,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    status,
    toggleSort,
    type,
    updateSearch,
    updateStatus,
    updateType,
  } = useCategoriesDirectory();

  return (
    <PermissionGuard permissions={[PERMISSIONS.CATEGORY_VIEW]}>
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
                  void exportCategories();
                }}
                onUpload={openImportDialog}
                uploadDisabled={!canCreateCategories}
              />
              {canCreateCategories ? (
                <Button asChild className="min-w-48">
                  <Link href="/categories/create">
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

        <CategoriesDirectoryCard
          canCreate={canCreateCategories}
          data={categoriesQuery.data}
          isError={categoriesQuery.isError}
          isLoading={categoriesQuery.isLoading}
          onClearFilters={clearFilters}
          onDeactivate={openDeactivate}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRetry={() => {
            void categoriesQuery.refetch();
          }}
          onSearchChange={updateSearch}
          onSortChange={toggleSort}
          onStatusChange={updateStatus}
          onTypeChange={updateType}
          pageSize={pageSize}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          status={status}
          type={type}
        />

        <DeactivateCategoryDialog
          category={categoryToDeactivate}
          isDeactivating={isDeactivating}
          onConfirm={() => {
            void confirmDeactivate();
          }}
          onOpenChange={(open) => {
            if (!open) closeDeactivate();
          }}
          open={Boolean(categoryToDeactivate)}
        />

        <ExcelImportDialog
          description={t("excel.importDescription")}
          isSubmitting={isImporting}
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
          onSubmit={(file) => {
            void importCategoryFile(file);
          }}
          open={isImportDialogOpen}
          showModeSelector={false}
        />
      </div>
    </PermissionGuard>
  );
}
