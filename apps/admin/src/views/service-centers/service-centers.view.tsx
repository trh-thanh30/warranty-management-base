"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { ExcelImportDialog, ImportExportMenu } from "@/src/components/common";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { DeactivateServiceCenterDialog } from "./components/deactivate-service-center-dialog";
import { ServiceCentersDirectoryCard } from "./components/service-centers-directory-card";
import { useServiceCentersDirectory } from "./hooks/use-service-centers-directory";

export function ServiceCentersView() {
  const t = useTranslations("ServiceCenters");
  const directory = useServiceCentersDirectory();

  return (
    <PermissionGuard permissions={[PERMISSIONS.SERVICE_CENTER_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:justify-end">
              <ImportExportMenu
                labels={{
                  downloadTemplate: t("excel.downloadTemplate"),
                  exportAll: t("excel.exportAll"),
                  title: t("excel.title"),
                  upload: t("excel.upload"),
                }}
                onDownloadTemplate={() => {
                  void directory.downloadImportTemplate();
                }}
                onExportAll={() => {
                  void directory.exportServiceCenters();
                }}
                onUpload={directory.openImportDialog}
                uploadDisabled={!directory.canCreate}
              />
              {directory.canCreate ? (
                <Button asChild className="w-full justify-center sm:w-auto">
                  <Link href="/service-centers/create">
                    <div className="inline-flex items-center justify-center gap-2 pr-[22px] sm:pr-0">
                      <Plus className="size-4 shrink-0" />
                      <span>{t("create")}</span>
                    </div>
                  </Link>
                </Button>
              ) : null}
            </div>
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <ServiceCentersDirectoryCard
          canCreate={directory.canCreate}
          data={directory.serviceCentersQuery.data}
          isError={directory.serviceCentersQuery.isError}
          isLoading={directory.serviceCentersQuery.isLoading}
          onClearFilters={directory.clearFilters}
          onDeactivate={directory.openDeactivate}
          onPageChange={directory.setPage}
          onPageSizeChange={directory.setPageSize}
          onProvinceChange={directory.updateProvince}
          onRetry={() => {
            void directory.serviceCentersQuery.refetch();
          }}
          onSearchChange={directory.updateSearch}
          onSortChange={directory.toggleSort}
          onStatusChange={directory.updateStatus}
          pageSize={directory.pageSize}
          province={directory.province}
          provinceOptions={directory.provincesQuery.data ?? []}
          provincesAreLoading={directory.provincesQuery.isLoading}
          search={directory.search}
          sortBy={directory.sortBy}
          sortOrder={directory.sortOrder}
          status={directory.status}
        />

        <DeactivateServiceCenterDialog
          isDeactivating={directory.isDeactivating}
          onConfirm={() => {
            void directory.confirmDeactivate();
          }}
          onOpenChange={(open) => {
            if (!open) directory.closeDeactivate();
          }}
          open={Boolean(directory.serviceCenterToDeactivate)}
          serviceCenter={directory.serviceCenterToDeactivate}
        />

        <ExcelImportDialog
          description={t("excel.importDescription")}
          isSubmitting={directory.isImporting}
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
            if (!open) directory.closeImportDialog();
          }}
          onSubmit={(file) => {
            void directory.importServiceCenterFile(file);
          }}
          open={directory.isImportDialogOpen}
          showModeSelector={false}
        />
      </div>
    </PermissionGuard>
  );
}
