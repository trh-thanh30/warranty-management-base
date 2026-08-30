"use client";

import {
  CheckCircle2,
  Download,
  FileSearch,
  FileText,
  Loader2,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
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
import { warrantyActivationRequestsService } from "@/src/services/warranty-activation-requests/warranty-activation-requests.service";
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
  const [isRetryingCertificate, setIsRetryingCertificate] = useState(false);
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
    request?.certificate?.status === "GENERATED" &&
    Boolean(request.certificate.storageKey) &&
    Boolean(request?.certificate?.recipientEmail) &&
    hasPermission(PERMISSIONS.WARRANTY_UPDATE);
  const canUseCertificate =
    request?.certificate?.status === "GENERATED" &&
    Boolean(request.certificate.storageKey);
  const isCertificateActionPending =
    actions.certificateActionRequestId === request?.id;
  const isViewingCertificate =
    isCertificateActionPending && actions.certificateAction === "view";
  const isDownloadingCertificate =
    isCertificateActionPending && actions.certificateAction === "download";
  const canRetryCertificate =
    request?.status === "ACTIVATED" &&
    (!request.certificate ||
      request.certificate.status !== "GENERATED" ||
      !request.certificate.storageKey) &&
    hasPermission(PERMISSIONS.WARRANTY_UPDATE);

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

  async function retryCertificate() {
    try {
      setIsRetryingCertificate(true);
      await warrantyActivationRequestsService.retryWarrantyActivationRequestCertificate(
        requestId,
      );
      await requestQuery.refetch();
      toast.success(t("retriedCertificate"));
    } catch (error) {
      toast.error(
        getLocalizedApiError(error, t, {
          apiErrors: tApiErrors,
          fallbackKey: "retryCertificateError",
        }),
      );
    } finally {
      setIsRetryingCertificate(false);
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
        {(canReview ||
          canResendCertificateEmail ||
          canUseCertificate ||
          canRetryCertificate) &&
        request ? (
          <div className="flex flex-wrap justify-end gap-2">
            {canUseCertificate ? (
              <>
                <Button
                  className="w-full sm:w-auto"
                  disabled={isViewingCertificate}
                  onClick={() => {
                    void actions.viewCertificate(request);
                  }}
                  type="button"
                  variant="secondary"
                >
                  {isViewingCertificate ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                  {isViewingCertificate
                    ? t("loadingCertificate")
                    : t("viewCertificate")}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  disabled={isDownloadingCertificate}
                  onClick={() => {
                    void actions.downloadCertificate(request);
                  }}
                  type="button"
                  variant="secondary"
                >
                  {isDownloadingCertificate ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  {isDownloadingCertificate
                    ? t("loadingCertificate")
                    : t("downloadCertificate")}
                </Button>
              </>
            ) : null}
            {canResendCertificateEmail ? (
              <Button
                className="w-full sm:w-auto"
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
            {canRetryCertificate ? (
              <Button
                disabled={isRetryingCertificate}
                onClick={() => {
                  void retryCertificate();
                }}
                type="button"
                variant="secondary"
              >
                <RotateCcw className="size-4" />
                {isRetryingCertificate
                  ? t("retryingCertificate")
                  : t("retryCertificate")}
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
            {canReview ? (
              <Button
                onClick={() => actions.openAction(request, "approve")}
                type="button"
              >
                <CheckCircle2 className="size-4" />
                {approveLabel}
              </Button>
            ) : null}
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
