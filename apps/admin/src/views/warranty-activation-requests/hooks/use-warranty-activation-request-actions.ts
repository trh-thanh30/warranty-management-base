"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type {
  ReviewWarrantyActivationRequestBody,
  WarrantyActivationRequestSummary,
} from "@repo/shared";
import { useExcel } from "@/src/hooks/use-excel";
import { useToast } from "@/src/hooks/use-toast";
import { getLocalizedApiError } from "@/src/lib/localized-api-error.utils";
import { useReviewWarrantyActivationRequest } from "@/src/hooks/use-warranty-activation-requests";
import { warrantyActivationRequestsService } from "@/src/services/warranty-activation-requests/warranty-activation-requests.service";
import type {
  SelectedWarrantyActivationRequest,
  WarrantyActivationRequestAction,
} from "../warranty-activation-requests.types";

export function useWarrantyActivationRequestActions() {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const tApiErrors = useTranslations("ApiErrors");
  const locale = useLocale();
  const toast = useToast();
  const { downloadBlob } = useExcel();
  const [activeAction, setActiveAction] =
    useState<WarrantyActivationRequestAction | null>(null);
  const [certificateActionRequestId, setCertificateActionRequestId] = useState<
    string | null
  >(null);
  const [selectedRequest, setSelectedRequest] =
    useState<SelectedWarrantyActivationRequest>(null);
  const reviewMutation = useReviewWarrantyActivationRequest(
    selectedRequest?.id ?? null,
  );

  function openAction(
    request: NonNullable<SelectedWarrantyActivationRequest>,
    action: WarrantyActivationRequestAction,
  ) {
    setSelectedRequest(request);
    setActiveAction(action);
  }

  function closeAction() {
    setActiveAction(null);
    setSelectedRequest(null);
  }

  async function review(body: ReviewWarrantyActivationRequestBody) {
    if (!selectedRequest) return;

    try {
      const request = await reviewMutation.mutateAsync({
        ...body,
        locale: locale === "en" ? "en" : "vi",
      });
      if (body.status === "APPROVED") {
        toast.success(
          request.certificate?.recipientEmail
            ? t("approved")
            : t("approvedWithoutEmail"),
        );
      } else {
        toast.success(t("rejected"));
      }
      closeAction();
    } catch (error) {
      toast.error(
        getLocalizedApiError(error, t, {
          apiErrors: tApiErrors,
          fallbackKey: "reviewError",
          preferApiMessage: true,
        }),
      );
    }
  }

  async function viewCertificate(request: WarrantyActivationRequestSummary) {
    if (!request.certificate) return;

    try {
      setCertificateActionRequestId(request.id);
      const blob =
        await warrantyActivationRequestsService.viewWarrantyActivationRequestCertificate(
          request.id,
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
      setCertificateActionRequestId(null);
    }
  }

  async function downloadCertificate(
    request: WarrantyActivationRequestSummary,
  ) {
    if (!request.certificate) return;

    try {
      setCertificateActionRequestId(request.id);
      const blob =
        await warrantyActivationRequestsService.downloadWarrantyActivationRequestCertificate(
          request.id,
        );
      downloadBlob(blob, `${request.certificate.certificateNumber}.pdf`);
      toast.success(t("downloadedCertificate"));
    } catch (error) {
      toast.error(
        getLocalizedApiError(error, t, {
          apiErrors: tApiErrors,
          fallbackKey: "downloadCertificateError",
        }),
      );
    } finally {
      setCertificateActionRequestId(null);
    }
  }

  return {
    activeAction,
    certificateActionRequestId,
    closeAction,
    downloadCertificate,
    isReviewing: reviewMutation.isPending,
    openAction,
    review,
    selectedRequest,
    viewCertificate,
  };
}
