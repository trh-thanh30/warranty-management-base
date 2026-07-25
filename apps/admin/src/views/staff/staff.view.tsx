"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { ExcelImportDialog, ImportExportMenu } from "@/src/components/common";
import { PERMISSIONS } from "@repo/shared/constants";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { StaffDirectoryCard } from "./components/staff-directory-card";
import { StaffPermissionsDialog } from "./components/staff-permissions-dialog";
import { StaffStatusDialog } from "./components/staff-status-dialog";
import { useStaffDirectory } from "./hooks/use-staff-directory";

export function StaffView() {
  const t = useTranslations("Staff");
  const {
    canCreateStaff,
    canViewStaff,
    closeImportDialog,
    closeStatusConfirm,
    confirmStatusChange,
    downloadImportTemplate,
    exportStaff,
    importStaffFile,
    isImportDialogOpen,
    isImporting,
    isUpdatingStatus,
    openPermissions,
    openImportDialog,
    openStatusConfirm,
    pageSize,
    permissionsOpen,
    search,
    selectedUser,
    setPage,
    setPageSize,
    setPermissionsOpen,
    sortBy,
    sortOrder,
    staffQuery,
    status,
    statusUser,
    toggleSort,
    updateSearch,
    updateStatus,
  } = useStaffDirectory();

  return (
    <PermissionGuard permissions={[PERMISSIONS.USER_VIEW]} requiredRole="admin">
      <div className="space-y-6">
        <PageHeader
          actions={
            <div className="flex flex-wrap justify-end gap-2">
              <ImportExportMenu
                disabled={!canViewStaff}
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
                  void exportStaff();
                }}
                onUpload={openImportDialog}
                uploadDisabled={!canCreateStaff}
              />
              {canCreateStaff ? (
                <Button asChild className="min-w-44">
                  <Link href="/staffs/create">
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

        <StaffDirectoryCard
          data={staffQuery.data}
          canCreate={canCreateStaff}
          isError={staffQuery.isError}
          isLoading={staffQuery.isLoading}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onPermissions={openPermissions}
          onRetry={() => {
            void staffQuery.refetch();
          }}
          onSearchChange={updateSearch}
          onSortChange={toggleSort}
          onStatusChange={updateStatus}
          onToggleStatus={openStatusConfirm}
          pageSize={pageSize}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          status={status}
        />

        <StaffPermissionsDialog
          onOpenChange={setPermissionsOpen}
          open={permissionsOpen}
          user={selectedUser}
        />
        <StaffStatusDialog
          isUpdating={isUpdatingStatus}
          onConfirm={confirmStatusChange}
          onOpenChange={(open) => {
            if (!open) closeStatusConfirm();
          }}
          open={Boolean(statusUser)}
          user={statusUser}
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
            void importStaffFile(file);
          }}
          open={isImportDialogOpen}
          showModeSelector={false}
        />
      </div>
    </PermissionGuard>
  );
}
