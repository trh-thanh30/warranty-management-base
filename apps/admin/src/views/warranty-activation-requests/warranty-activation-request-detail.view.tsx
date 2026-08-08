"use client";

import {
  CheckCircle2,
  Download,
  FileSearch,
  FileText,
  Send,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import {
  useResendWarrantyActivationRequestCertificateEmail,
  useWarrantyActivationRequest,
} from "@/src/hooks/use-warranty-activation-requests";
import { useToast } from "@/src/hooks/use-toast";
import { getLocalizedApiError } from "@/src/lib/localized-api-error.utils";
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
  const tApiErrors = useTranslations("ApiErrors");
  const { hasPermission } = usePermissions();
  const toast = useToast();
  const requestQuery = useWarrantyActivationRequest(requestId);
  const resendCertificateEmailMutation =
    useResendWarrantyActivationRequestCertificateEmail(requestId);
  const actions = useWarrantyActivationRequestActions();
  const request = requestQuery.data;
  const canReview =
    Boolean(request) &&
    (request?.status === "PENDING" || request?.status === "APPROVED") &&
    hasPermission(PERMISSIONS.WARRANTY_UPDATE);
  const approveLabel =
    request?.status === "APPROVED" ? t("activate") : t("approve");
  const canResendCertificateEmail =
    Boolean(request?.certificate) &&
    Boolean(request?.certificate?.recipientEmail) &&
    request?.certificate?.emailStatus !== "SENT" &&
    hasPermission(PERMISSIONS.WARRANTY_UPDATE);
  const canUseCertificate = Boolean(request?.certificate);

  async function resendCertificateEmail() {
    try {
      await resendCertificateEmailMutation.mutateAsync();
      toast.success(t("resentCertificateEmail"));
    } catch (error) {
      toast.error(
        getLocalizedApiError(error, t, {
          apiErrors: tApiErrors,
          fallbackKey: "resendCertificateEmailError",
        }),
      );
    }
  }

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
        {(canReview || canResendCertificateEmail || canUseCertificate) &&
        request ? (
          <div className="flex flex-wrap justify-end gap-2">
            {canUseCertificate ? (
              <>
                <Button
                  onClick={() => {
                    void actions.viewCertificate(request);
                  }}
                  type="button"
                  variant="secondary"
                >
                  <FileText className="size-4" />
                  {t("viewCertificate")}
                </Button>
                <Button
                  onClick={() => {
                    void actions.downloadCertificate(request);
                  }}
                  type="button"
                  variant="secondary"
                >
                  <Download className="size-4" />
                  {t("downloadCertificate")}
                </Button>
              </>
            ) : null}
            {canResendCertificateEmail ? (
              <Button
                disabled={resendCertificateEmailMutation.isPending}
                onClick={() => {
                  void resendCertificateEmail();
                }}
                type="button"
                variant="secondary"
              >
                <Send className="size-4" />
                {resendCertificateEmailMutation.isPending
                  ? t("resendingCertificateEmail")
                  : t("resendCertificateEmail")}
              </Button>
            ) : null}
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
