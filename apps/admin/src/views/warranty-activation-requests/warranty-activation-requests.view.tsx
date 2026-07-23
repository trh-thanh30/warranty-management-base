"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { ImportExportMenu } from "@/src/components/common";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { WarrantyManagementTabs } from "../warranties/components/warranty-management-tabs";
import { ReviewWarrantyActivationRequestDialog } from "./components/review-warranty-activation-request-dialog";
import { WarrantyActivationRequestsDirectoryCard } from "./components/warranty-activation-requests-directory-card";
import { useWarrantyActivationRequestsDirectory } from "./hooks/use-warranty-activation-requests-directory";

export function WarrantyActivationRequestsView() {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const directory = useWarrantyActivationRequestsDirectory();

  return (
    <PermissionGuard permissions={[PERMISSIONS.WARRANTY_VIEW]}>
      <div className="min-w-0 space-y-6">
        <PageHeader
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
          actions={
            <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
              <ImportExportMenu
                labels={{
                  exportAll: t("excel.exportAll"),
                  title: t("excel.title"),
                }}
                onExportAll={() => {
                  void directory.exportRequests();
                }}
              />
              <Button asChild>
                <Link href="/warranty-activation-requests/create">
                  <Plus className="size-4" aria-hidden="true" />
                  {t("createAction")}
                </Link>
              </Button>
            </div>
          }
        />

        <WarrantyManagementTabs activeTab="activationRequests" />

        <WarrantyActivationRequestsDirectoryCard
          data={directory.requestsQuery.data}
          filters={directory.filters}
          isError={directory.requestsQuery.isError}
          isLoading={directory.requestsQuery.isLoading}
          onAction={directory.actions.openAction}
          onClearFilters={directory.clearFilters}
          onDateFromChange={directory.updateDateFrom}
          onDateToChange={directory.updateDateTo}
          onPageChange={directory.setPage}
          onPageSizeChange={directory.setPageSize}
          onRetry={() => {
            void directory.requestsQuery.refetch();
          }}
          onSearchChange={directory.updateSearch}
          onSortChange={directory.toggleSort}
          onStatusChange={directory.updateStatusFilter}
          onWarrantyCodeChange={directory.updateWarrantyCode}
          pageSize={directory.pageSize}
          search={directory.search}
          sortBy={directory.sortBy}
          sortOrder={directory.sortOrder}
        />

        <ReviewWarrantyActivationRequestDialog
          action={
            directory.actions.activeAction === "reject" ? "reject" : "approve"
          }
          isReviewing={directory.actions.isReviewing}
          onConfirm={(body) => {
            void directory.actions.review(body);
          }}
          onOpenChange={(open) => {
            if (!open) directory.actions.closeAction();
          }}
          open={
            directory.actions.activeAction === "approve" ||
            directory.actions.activeAction === "reject"
          }
          request={directory.actions.selectedRequest}
        />
      </div>
    </PermissionGuard>
  );
}
