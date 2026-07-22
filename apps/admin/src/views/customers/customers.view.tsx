"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { ExcelImportDialog, ImportExportMenu } from "@/src/components/common";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { CustomersDirectoryCard } from "./components/customers-directory-card";
import { useCustomersDirectory } from "./hooks/use-customers-directory";

export function CustomersView() {
  const t = useTranslations("Customers");
  const {
    canCreateCustomers,
    closeImportDialog,
    customersQuery,
    downloadImportTemplate,
    exportCustomers,
    importCustomerFile,
    isImportDialogOpen,
    isImporting,
    openImportDialog,
    pageSize,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    toggleSort,
    updateSearch,
  } = useCustomersDirectory();

  return (
    <PermissionGuard permissions={[PERMISSIONS.CUSTOMER_VIEW]}>
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
                  void exportCustomers();
                }}
                onUpload={openImportDialog}
                uploadDisabled={!canCreateCustomers}
              />
              {canCreateCustomers ? (
                <Button asChild>
                  <Link href="/customers/create">
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

        <CustomersDirectoryCard
          canCreate={canCreateCustomers}
          data={customersQuery.data}
          isError={customersQuery.isError}
          isLoading={customersQuery.isLoading}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRetry={() => {
            void customersQuery.refetch();
          }}
          onSearchChange={updateSearch}
          onSortChange={toggleSort}
          pageSize={pageSize}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
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
            void importCustomerFile(file);
          }}
          open={isImportDialogOpen}
          showModeSelector={false}
        />
      </div>
    </PermissionGuard>
  );
}
