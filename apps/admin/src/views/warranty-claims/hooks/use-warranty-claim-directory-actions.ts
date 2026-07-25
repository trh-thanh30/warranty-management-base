"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { WarrantyClaimSummary } from "@repo/shared";
import { useToast } from "@/src/hooks/use-toast";
import {
  useAssignWarrantyClaimServiceCenter,
  useUpdateWarrantyClaimPriority,
  useUpdateWarrantyClaimStatus,
} from "@/src/hooks/use-warranty-claims";
import { WARRANTY_CLAIM_STATUS_TRANSITIONS } from "../warranty-claims.constants";
import type { WarrantyClaimAction } from "../warranty-claims.types";

export function useWarrantyClaimDirectoryActions() {
  const t = useTranslations("WarrantyClaims");
  const toast = useToast();
  const [activeAction, setActiveAction] = useState<WarrantyClaimAction | null>(
    null,
  );
  const [selectedClaim, setSelectedClaim] =
    useState<WarrantyClaimSummary | null>(null);
  const updateStatusMutation = useUpdateWarrantyClaimStatus(
    selectedClaim?.id ?? null,
  );
  const assignServiceCenterMutation = useAssignWarrantyClaimServiceCenter(
    selectedClaim?.id ?? null,
  );
  const updatePriorityMutation = useUpdateWarrantyClaimPriority(
    selectedClaim?.id ?? null,
  );

  function openAction(
    claim: WarrantyClaimSummary,
    action: WarrantyClaimAction,
  ) {
    setSelectedClaim(claim);
    setActiveAction(action);
  }

  function closeAction() {
    setActiveAction(null);
    setSelectedClaim(null);
  }

  async function updateStatus(status: string, note: string) {
    if (!selectedClaim) return;

    try {
      await updateStatusMutation.mutateAsync({
        status: status as WarrantyClaimSummary["status"],
        note: note.trim() || undefined,
      });
      toast.success(t("statusUpdated"));
      closeAction();
    } catch {
      toast.error(t("statusUpdateError"));
    }
  }

  async function assignServiceCenter(serviceCenterId: string, note: string) {
    if (!selectedClaim) return;

    const isReassignment = Boolean(selectedClaim.serviceCenter);

    try {
      await assignServiceCenterMutation.mutateAsync({
        serviceCenterId,
        note: note.trim() || undefined,
      });
      toast.success(
        t(isReassignment ? "serviceCenterChanged" : "serviceCenterAssigned"),
      );
      closeAction();
    } catch {
      toast.error(t("serviceCenterAssignError"));
    }
  }

  async function updatePriority(priority: string, dueAt: string) {
    if (!selectedClaim) return;

    try {
      await updatePriorityMutation.mutateAsync({
        dueAt: dueAt || undefined,
        priority: priority as WarrantyClaimSummary["priority"],
      });
      toast.success(t("priorityUpdated"));
      closeAction();
    } catch {
      toast.error(t("priorityUpdateError"));
    }
  }

  return {
    activeAction,
    allowedStatusTransitions: selectedClaim
      ? WARRANTY_CLAIM_STATUS_TRANSITIONS[selectedClaim.status]
      : [],
    assignServiceCenter,
    closeAction,
    isAssigningServiceCenter: assignServiceCenterMutation.isPending,
    isUpdatingPriority: updatePriorityMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    openAction,
    selectedClaim,
    updatePriority,
    updateStatus,
  };
}
