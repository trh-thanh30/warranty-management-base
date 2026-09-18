"use client";

import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { PageHeader } from "@/src/components/common/page-header";
import { ImportExportMenu } from "@/src/components/common";
import { PermissionGuard } from "@/src/components/permission-guard";
import { ContactSubmissionsDirectoryCard } from "./components/contact-submissions-directory-card";
import { useContactSubmissionsDirectory } from "./hooks/use-contact-submissions-directory";

export function ContactSubmissionsView() {
  const t = useTranslations("ContactSubmissions");
  const directory = useContactSubmissionsDirectory();

  return (
    <PermissionGuard permissions={[PERMISSIONS.CONTACT_SUBMISSION_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            <ImportExportMenu
              disabled={directory.isExporting}
              labels={{
                exportAll: t("excel.exportFiltered"),
                title: t("excel.title"),
              }}
              onExportAll={() => {
                void directory.exportSubmissions();
              }}
            />
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <ContactSubmissionsDirectoryCard
          canUpdate={directory.canUpdate}
          data={directory.submissionsQuery.data}
          isError={directory.submissionsQuery.isError}
          isLoading={directory.submissionsQuery.isLoading}
          isUpdating={directory.isUpdating}
          onClearFilters={directory.clearFilters}
          onPageChange={directory.setPage}
          onPageSizeChange={directory.setPageSize}
          onRetry={() => {
            void directory.submissionsQuery.refetch();
          }}
          onSearchChange={directory.updateSearch}
          onStatusChange={directory.updateStatus}
          onUpdateStatus={(submission, status) => {
            void directory.updateSubmissionStatus(submission, status);
          }}
          pageSize={directory.pageSize}
          search={directory.search}
          status={directory.status}
        />
      </div>
    </PermissionGuard>
  );
}
