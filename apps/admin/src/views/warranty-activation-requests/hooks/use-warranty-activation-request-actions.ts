"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ReviewWarrantyActivationRequestBody } from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";
import { useReviewWarrantyActivationRequest } from "@/src/hooks/use-warranty-activation-requests";
import type {
  SelectedWarrantyActivationRequest,
  WarrantyActivationRequestAction,
} from "../warranty-activation-requests.types";

export function useWarrantyActivationRequestActions() {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const toast = useToast();
  const [activeAction, setActiveAction] =
    useState<WarrantyActivationRequestAction | null>(null);
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
      await reviewMutation.mutateAsync(body);
      toast.success(body.status === "APPROVED" ? t("approved") : t("rejected"));
      closeAction();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("reviewError"));
    }
  }

  return {
    activeAction,
    closeAction,
    isReviewing: reviewMutation.isPending,
    openAction,
    review,
    selectedRequest,
  };
}
