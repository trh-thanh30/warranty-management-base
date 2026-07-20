"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import { Button } from "@repo/ui";
import { AssignClaimServiceCenterDialog } from "./components/assign-claim-service-center-dialog";
import { UpdateClaimPriorityDialog } from "./components/update-claim-priority-dialog";
import { UpdateClaimStatusDialog } from "./components/update-claim-status-dialog";
import { WarrantyClaimsDirectoryCard } from "./components/warranty-claims-directory-card";
import { WarrantyClaimsMetrics } from "./components/warranty-claims-metrics";
import { useWarrantyClaimsDirectory } from "./hooks/use-warranty-claims-directory";

export function WarrantyClaimsView() {
  const t = useTranslations("WarrantyClaims");
  const directory = useWarrantyClaimsDirectory();
  const { hasPermission } = usePermissions();

  return (
    <PermissionGuard permissions={[PERMISSIONS.WARRANTY_CLAIM_VIEW]}>
      <div className="min-w-0 space-y-6">
        <PageHeader
          actions={
            hasPermission(PERMISSIONS.WARRANTY_CLAIM_CREATE) ? (
              <Button asChild>
                <Link href="/warranty-claims/create">
                  <Plus className="size-4" />
                  {t("createAction")}
                </Link>
              </Button>
            ) : null
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <WarrantyClaimsMetrics
          data={directory.metricsQuery.data}
          isLoading={directory.metricsQuery.isLoading}
        />

        <WarrantyClaimsDirectoryCard
          data={directory.claimsQuery.data}
          filters={directory.filters}
          isError={directory.claimsQuery.isError}
          isLoading={directory.claimsQuery.isLoading}
          onClaimCodeChange={directory.updateClaimCode}
          onClaimAction={directory.actions.openAction}
          onClearFilters={directory.clearFilters}
          onDateFromChange={directory.updateDateFrom}
          onDateToChange={directory.updateDateTo}
          onOverdueChange={directory.updateOverdue}
          onPageChange={directory.setPage}
          onPageSizeChange={directory.setPageSize}
          onPriorityChange={directory.updatePriorityFilter}
          onRetry={() => {
            void directory.claimsQuery.refetch();
          }}
          onSearchChange={directory.updateSearch}
          onServiceCenterChange={directory.updateServiceCenter}
          onSortChange={directory.toggleSort}
          onStatusChange={directory.updateStatusFilter}
          onWarrantyCodeChange={directory.updateWarrantyCode}
          pageSize={directory.pageSize}
          search={directory.search}
          serviceCenters={directory.serviceCenters}
          sortBy={directory.sortBy}
          sortOrder={directory.sortOrder}
        />

        <UpdateClaimStatusDialog
          allowedStatuses={directory.actions.allowedStatusTransitions}
          claim={directory.actions.selectedClaim}
          isUpdating={directory.actions.isUpdatingStatus}
          onConfirm={(status, note) => {
            void directory.actions.updateStatus(status, note);
          }}
          onOpenChange={(open) => {
            if (!open) directory.actions.closeAction();
          }}
          open={directory.actions.activeAction === "status"}
        />

        <AssignClaimServiceCenterDialog
          claim={directory.actions.selectedClaim}
          isAssigning={directory.actions.isAssigningServiceCenter}
          onConfirm={(serviceCenterId, note) => {
            void directory.actions.assignServiceCenter(serviceCenterId, note);
          }}
          onOpenChange={(open) => {
            if (!open) directory.actions.closeAction();
          }}
          open={directory.actions.activeAction === "assignServiceCenter"}
          serviceCenters={directory.serviceCenters}
        />

        <UpdateClaimPriorityDialog
          claim={directory.actions.selectedClaim}
          isUpdating={directory.actions.isUpdatingPriority}
          onConfirm={(priority, dueAt) => {
            void directory.actions.updatePriority(priority, dueAt);
          }}
          onOpenChange={(open) => {
            if (!open) directory.actions.closeAction();
          }}
          open={directory.actions.activeAction === "priority"}
        />
      </div>
    </PermissionGuard>
  );
}
