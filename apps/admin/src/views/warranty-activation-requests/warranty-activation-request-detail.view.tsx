"use client";

import { CheckCircle2, FileSearch, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useWarrantyActivationRequest } from "@/src/hooks/use-warranty-activation-requests";
import { ReviewWarrantyActivationRequestDialog } from "./components/review-warranty-activation-request-dialog";
import {
  WarrantyActivationRequestDetailCard,
  WarrantyActivationRequestDetailSkeleton,
} from "./components/warranty-activation-request-detail-card";
import { useWarrantyActivationRequestActions } from "./hooks/use-warranty-activation-request-actions";

type WarrantyActivationRequestDetailViewProps = {
  requestId: string;
};

export function WarrantyActivationRequestDetailView({
  requestId,
}: WarrantyActivationRequestDetailViewProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const { hasPermission } = usePermissions();
  const requestQuery = useWarrantyActivationRequest(requestId);
  const actions = useWarrantyActivationRequestActions();
  const request = requestQuery.data;
  const canReview =
    Boolean(request) &&
    (request?.status === "PENDING" || request?.status === "APPROVED") &&
    hasPermission(PERMISSIONS.WARRANTY_UPDATE);
  const approveLabel =
    request?.status === "APPROVED" ? t("activate") : t("approve");

  return (
    <PermissionGuard permissions={[PERMISSIONS.WARRANTY_VIEW]}>
      <FormPageShell
        backHref="/warranty-activation-requests"
        backLabel={t("backToDirectory")}
        description={t("detailDescription")}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={request?.requestCode ?? t("detailTitle")}
      >
        {canReview && request ? (
          <div className="flex flex-wrap justify-end gap-2">
            {request.status === "PENDING" ? (
              <Button
                onClick={() => actions.openAction(request, "reject")}
                type="button"
                variant="destructive"
              >
                <XCircle className="size-4" />
                {t("reject")}
              </Button>
            ) : null}
            <Button
              onClick={() => actions.openAction(request, "approve")}
              type="button"
            >
              <CheckCircle2 className="size-4" />
              {approveLabel}
            </Button>
          </div>
        ) : null}

        {requestQuery.isLoading ? (
          <WarrantyActivationRequestDetailSkeleton />
        ) : requestQuery.isError || !request ? (
          <StatePanel
            action={
              <Button
                onClick={() => {
                  void requestQuery.refetch();
                }}
                variant="secondary"
              >
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={FileSearch}
            title={t("loadErrorTitle")}
          />
        ) : (
          <WarrantyActivationRequestDetailCard request={request} />
        )}

        <ReviewWarrantyActivationRequestDialog
          action={actions.activeAction === "reject" ? "reject" : "approve"}
          isReviewing={actions.isReviewing}
          onConfirm={(body) => {
            void actions.review(body);
          }}
          onOpenChange={(open) => {
            if (!open) actions.closeAction();
          }}
          open={
            actions.activeAction === "approve" ||
            actions.activeAction === "reject"
          }
          request={actions.selectedRequest}
        />
      </FormPageShell>
    </PermissionGuard>
  );
}
