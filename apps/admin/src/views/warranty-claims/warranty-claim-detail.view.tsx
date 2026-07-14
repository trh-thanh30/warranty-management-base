"use client";

import { FileSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { AssignClaimServiceCenterDialog } from "./components/assign-claim-service-center-dialog";
import { UpdateClaimPriorityDialog } from "./components/update-claim-priority-dialog";
import { UpdateClaimStatusDialog } from "./components/update-claim-status-dialog";
import { WarrantyClaimDetailContent } from "./components/warranty-claim-detail-content";
import { WarrantyClaimDetailHeader } from "./components/warranty-claim-detail-header";
import { WarrantyClaimDetailSkeleton } from "./components/warranty-claim-detail-skeleton";
import { useWarrantyClaimDetail } from "./hooks/use-warranty-claim-detail";

type WarrantyClaimDetailViewProps = {
  claimId: string;
};

export function WarrantyClaimDetailView({
  claimId,
}: WarrantyClaimDetailViewProps) {
  const t = useTranslations("WarrantyClaims");
  const detail = useWarrantyClaimDetail(claimId);

  return (
    <PermissionGuard permissions={[PERMISSIONS.WARRANTY_CLAIM_VIEW]}>
      {detail.claimQuery.isLoading ? (
        <WarrantyClaimDetailSkeleton />
      ) : detail.claimQuery.isError || !detail.claim ? (
        <StatePanel
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="secondary">
                <Link href="/warranty-claims">{t("backToDirectory")}</Link>
              </Button>
              <Button
                onClick={() => {
                  void detail.claimQuery.refetch();
                }}
              >
                {t("tryAgain")}
              </Button>
            </div>
          }
          description={t("detailLoadErrorDescription")}
          icon={FileSearch}
          title={t("detailLoadErrorTitle")}
        />
      ) : (
        <div className="mx-auto max-w-7xl space-y-6">
          <WarrantyClaimDetailHeader
            canAssignServiceCenter={detail.canAssignServiceCenter}
            canUpdate={detail.canUpdate}
            canUpdateStatus={detail.canUpdateStatus}
            claim={detail.claim}
            hasStatusTransitions={detail.allowedStatusTransitions.length > 0}
            onAssignServiceCenter={() =>
              detail.openAction("assignServiceCenter")
            }
            onUpdatePriority={() => detail.openAction("priority")}
            onUpdateStatus={() => detail.openAction("status")}
          />

          <WarrantyClaimDetailContent
            claim={detail.claim}
            timeline={detail.timeline}
          />

          <UpdateClaimStatusDialog
            allowedStatuses={detail.allowedStatusTransitions}
            claim={detail.claim}
            isUpdating={detail.isUpdatingStatus}
            onConfirm={(status, note) => {
              void detail.updateStatus(status, note);
            }}
            onOpenChange={(open) => {
              if (!open) detail.closeAction();
            }}
            open={detail.activeAction === "status"}
          />

          <AssignClaimServiceCenterDialog
            claim={detail.claim}
            isAssigning={detail.isAssigningServiceCenter}
            onConfirm={(serviceCenterId, note) => {
              void detail.assignServiceCenter(serviceCenterId, note);
            }}
            onOpenChange={(open) => {
              if (!open) detail.closeAction();
            }}
            open={detail.activeAction === "assignServiceCenter"}
            serviceCenters={detail.serviceCenters}
          />

          <UpdateClaimPriorityDialog
            claim={detail.claim}
            isUpdating={detail.isUpdatingPriority}
            onConfirm={(priority, dueAt) => {
              void detail.updatePriority(priority, dueAt);
            }}
            onOpenChange={(open) => {
              if (!open) detail.closeAction();
            }}
            open={detail.activeAction === "priority"}
          />
        </div>
      )}
    </PermissionGuard>
  );
}
