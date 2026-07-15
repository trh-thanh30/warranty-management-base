"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type {
  WarrantyClaimAttachmentSummary,
  WarrantyClaimSummary,
  WarrantyClaimTimelineItem,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useActiveServiceCenters } from "@/src/hooks/use-service-centers";
import { useToast } from "@/src/hooks/use-toast";
import { assetsService } from "@/src/services/assets/assets.service";
import {
  useAssignWarrantyClaimServiceCenter,
  useLinkWarrantyClaimAttachment,
  useUnlinkWarrantyClaimAttachment,
  useUpdateWarrantyClaimPriority,
  useUpdateWarrantyClaimStatus,
  useWarrantyClaim,
  useWarrantyClaimTimeline,
} from "@/src/hooks/use-warranty-claims";
import {
  WARRANTY_CLAIM_STATUS_TRANSITIONS,
  WARRANTY_CLAIM_TERMINAL_STATUSES,
} from "../warranty-claims.constants";
import type { WarrantyClaimAction } from "../warranty-claims.types";

export function useWarrantyClaimDetail(claimId: string) {
  const t = useTranslations("WarrantyClaims");
  const toast = useToast();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [activeAction, setActiveAction] = useState<WarrantyClaimAction | null>(
    null,
  );
  const [attachmentToRemove, setAttachmentToRemove] =
    useState<WarrantyClaimAttachmentSummary | null>(null);
  const canView = hasPermission(PERMISSIONS.WARRANTY_CLAIM_VIEW);
  const canUpdate = hasPermission(PERMISSIONS.WARRANTY_CLAIM_UPDATE);
  const canUpdateStatus = hasPermission(
    PERMISSIONS.WARRANTY_CLAIM_STATUS_UPDATE,
  );
  const enabled = Boolean(user) && canView && Boolean(claimId);
  const claimQuery = useWarrantyClaim(claimId, { enabled });
  const timelineQuery = useWarrantyClaimTimeline(claimId, { enabled });
  const serviceCentersQuery = useActiveServiceCenters({
    enabled: enabled && canUpdate,
  });
  const updateStatusMutation = useUpdateWarrantyClaimStatus(claimId);
  const assignServiceCenterMutation =
    useAssignWarrantyClaimServiceCenter(claimId);
  const updatePriorityMutation = useUpdateWarrantyClaimPriority(claimId);
  const linkAttachmentMutation = useLinkWarrantyClaimAttachment(claimId);
  const unlinkAttachmentMutation = useUnlinkWarrantyClaimAttachment(claimId);
  const claim = claimQuery.data ?? null;
  const canAssignServiceCenter =
    canUpdate &&
    claim !== null &&
    !WARRANTY_CLAIM_TERMINAL_STATUSES.includes(claim.status);

  function openAction(action: WarrantyClaimAction) {
    setActiveAction(action);
  }

  function closeAction() {
    setActiveAction(null);
  }

  async function refreshDetail() {
    await Promise.all([claimQuery.refetch(), timelineQuery.refetch()]);
  }

  async function updateStatus(status: string, note: string) {
    try {
      await updateStatusMutation.mutateAsync({
        status: status as WarrantyClaimSummary["status"],
        note: note.trim(),
      });
      await refreshDetail();
      toast.success(t("statusUpdated"));
      closeAction();
    } catch {
      toast.error(t("statusUpdateError"));
    }
  }

  async function assignServiceCenter(serviceCenterId: string, note: string) {
    const isReassignment = Boolean(claim?.serviceCenter);

    try {
      await assignServiceCenterMutation.mutateAsync({
        serviceCenterId,
        note: note.trim() || undefined,
      });
      await refreshDetail();
      toast.success(
        t(isReassignment ? "serviceCenterChanged" : "serviceCenterAssigned"),
      );
      closeAction();
    } catch {
      toast.error(t("serviceCenterAssignError"));
    }
  }

  async function updatePriority(priority: string, dueAt: string) {
    try {
      await updatePriorityMutation.mutateAsync({
        dueAt: dueAt || undefined,
        priority: priority as WarrantyClaimSummary["priority"],
      });
      await refreshDetail();
      toast.success(t("priorityUpdated"));
      closeAction();
    } catch {
      toast.error(t("priorityUpdateError"));
    }
  }

  async function uploadAttachment(file: File) {
    let uploadedAssetId: string | null = null;

    try {
      const asset = await assetsService.uploadAsset(file, {
        accessType: "PUBLIC",
        folder: `warranty-claims/${claimId}`,
      });
      uploadedAssetId = asset.id;
      await linkAttachmentMutation.mutateAsync(asset.id);
    } catch (error) {
      if (uploadedAssetId) {
        try {
          await assetsService.deleteAsset(uploadedAssetId);
        } catch {
          // The original upload/link error remains the actionable failure.
        }
      }
      throw error;
    }
  }

  async function refreshAttachments() {
    await claimQuery.refetch();
  }

  async function completeAttachmentUpload() {
    await refreshAttachments();
    toast.success(t("attachmentsUploaded"));
  }

  async function removeAttachment() {
    if (!attachmentToRemove) return;

    try {
      await unlinkAttachmentMutation.mutateAsync(attachmentToRemove.id);
      await refreshAttachments();
      toast.success(t("attachmentRemoved"));
      setAttachmentToRemove(null);
    } catch {
      toast.error(t("attachmentRemoveError"));
    }
  }

  return {
    activeAction,
    allowedStatusTransitions: claim
      ? WARRANTY_CLAIM_STATUS_TRANSITIONS[claim.status]
      : [],
    assignServiceCenter,
    attachmentToRemove,
    canAssignServiceCenter,
    canUpdate,
    canUpdateStatus,
    claim,
    claimQuery,
    closeAction,
    isAssigningServiceCenter: assignServiceCenterMutation.isPending,
    isRemovingAttachment: unlinkAttachmentMutation.isPending,
    isUpdatingPriority: updatePriorityMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    openAction,
    openRemoveAttachment: setAttachmentToRemove,
    removeAttachment,
    closeRemoveAttachment: () => setAttachmentToRemove(null),
    completeAttachmentUpload,
    refreshAttachments,
    serviceCenters: serviceCentersQuery.data?.items ?? [],
    timeline:
      timelineQuery.data ??
      claim?.statusHistory.map(
        (history): WarrantyClaimTimelineItem => ({
          ...history,
          type: "STATUS_CHANGED",
        }),
      ) ??
      [],
    timelineQuery,
    updatePriority,
    updateStatus,
    uploadAttachment,
  };
}
