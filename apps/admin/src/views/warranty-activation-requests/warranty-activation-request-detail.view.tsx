"use client";

import {
  CheckCircle2,
  Download,
  FileSearch,
  FileText,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { WarrantyActivationRequestItemSummary } from "@repo/shared";
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
import { useExcel } from "@/src/hooks/use-excel";
import { getLocalizedApiError } from "@/src/lib/localized-api-error.utils";
import { ReviewWarrantyActivationRequestDialog } from "./components/review-warranty-activation-request-dialog";
import {
  WarrantyActivationRequestDetailCard,
  WarrantyActivationRequestDetailSkeleton,
} from "./components/warranty-activation-request-detail-card";
import { useWarrantyActivationRequestActions } from "./hooks/use-warranty-activation-request-actions";
import { warrantyActivationRequestsService } from "@/src/services/warranty-activation-requests/warranty-activation-requests.service";

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
  const { downloadBlob } = useExcel();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
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
    !request?.items?.length &&
    request?.certificate?.status === "GENERATED" &&
    Boolean(request.certificate.storageKey) &&
    Boolean(request?.certificate?.recipientEmail) &&
    request?.certificate?.emailStatus !== "SENT" &&
    hasPermission(PERMISSIONS.WARRANTY_UPDATE);
  const canUseCertificate =
    !request?.items?.length &&
    request?.certificate?.status === "GENERATED" &&
    Boolean(request.certificate.storageKey);
  const canRetryCertificate =
    !request?.items?.length &&
    request?.status === "ACTIVATED" &&
    (!request.certificate ||
      request.certificate.status !== "GENERATED" ||
      !request.certificate.storageKey) &&
    hasPermission(PERMISSIONS.WARRANTY_UPDATE);
  const canManageItemCertificates = hasPermission(PERMISSIONS.WARRANTY_UPDATE);

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

  async function viewItemCertificate(
    item: WarrantyActivationRequestItemSummary,
  ) {
    if (!item.certificate) return;
    try {
      setBusyItemId(item.id);
      const blob =
        await warrantyActivationRequestsService.viewWarrantyActivationRequestItemCertificate(
          requestId,
          item.id,
        );
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      toast.error(
        getLocalizedApiError(error, t, {
          apiErrors: tApiErrors,
          fallbackKey: "viewCertificateError",
        }),
      );
    } finally {
      setBusyItemId(null);
    }
  }

  async function downloadItemCertificate(
    item: WarrantyActivationRequestItemSummary,
  ) {
    if (!item.certificate) return;
    try {
      setBusyItemId(item.id);
      const blob =
        await warrantyActivationRequestsService.downloadWarrantyActivationRequestItemCertificate(
          requestId,
          item.id,
        );
      downloadBlob(blob, `${item.certificate.certificateNumber}.pdf`);
      toast.success(t("downloadedCertificate"));
    } catch (error) {
      toast.error(
        getLocalizedApiError(error, t, {
          apiErrors: tApiErrors,
          fallbackKey: "downloadCertificateError",
        }),
      );
    } finally {
      setBusyItemId(null);
    }
  }

  async function resendItemCertificate(
    item: WarrantyActivationRequestItemSummary,
  ) {
    if (!item.certificate) return;
    try {
      setBusyItemId(item.id);
      await warrantyActivationRequestsService.resendWarrantyActivationRequestItemCertificateEmail(
        requestId,
        item.id,
      );
      await requestQuery.refetch();
      toast.success(t("resentCertificateEmail"));
    } catch (error) {
      toast.error(
        getLocalizedApiError(error, t, {
          apiErrors: tApiErrors,
          fallbackKey: "resendCertificateEmailError",
        }),
      );
    } finally {
      setBusyItemId(null);
    }
  }

  async function retryItemCertificate(
    item: WarrantyActivationRequestItemSummary,
  ) {
    try {
      setBusyItemId(item.id);
      await warrantyActivationRequestsService.retryWarrantyActivationRequestItemCertificate(
        requestId,
        item.id,
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
      setBusyItemId(null);
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
          <WarrantyActivationRequestDetailCard
            busyItemId={busyItemId}
            onDownloadItemCertificate={downloadItemCertificate}
            onResendItemCertificate={
              canManageItemCertificates ? resendItemCertificate : undefined
            }
            onRetryItemCertificate={
              canManageItemCertificates ? retryItemCertificate : undefined
            }
            onViewItemCertificate={viewItemCertificate}
            request={request}
          />
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
