"use client";

import type { ActivationCodeBatchListItem } from "@/src/services/activation-codes/activation-code-batches.types";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import type { ActivationCodeBatchRevokeScope } from "@repo/shared";
import { DEFAULT_ACTIVATION_CODE_BATCH_REVOKE_SCOPE } from "@repo/shared/constants";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  RadioGroup,
  RadioGroupItem,
  Skeleton,
} from "@repo/ui";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type ActivationCodeBatchRevokeDialogProps = {
  batch: ActivationCodeBatchListItem;
  onOpenChange: (open: boolean) => void;
  onRevoke: (
    batch: ActivationCodeBatchListItem,
    scope: ActivationCodeBatchRevokeScope,
  ) => Promise<void>;
  open: boolean;
};

export function ActivationCodeBatchRevokeDialog({
  batch,
  onOpenChange,
  onRevoke,
  open,
}: ActivationCodeBatchRevokeDialogProps) {
  const t = useTranslations("ActivationCodeBatches");
  const [scope, setScope] = useState<ActivationCodeBatchRevokeScope>(
    DEFAULT_ACTIVATION_CODE_BATCH_REVOKE_SCOPE,
  );
  const [isSubmitting, setSubmitting] = useState(false);
  const previewQuery = useQuery({
    enabled: open,
    queryFn: () => activationCodesService.getBatchRevokePreview(batch.id),
    queryKey: ["activation-code-batches", batch.id, "revoke-preview"],
  });
  const preview = previewQuery.data;
  const selectedCount = preview
    ? preview.unassignedRevocableCount +
      (scope === "ALL_REVOCABLE" ? preview.assignedRevocableCount : 0)
    : 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    if (!nextOpen) setScope(DEFAULT_ACTIVATION_CODE_BATCH_REVOKE_SCOPE);
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!preview || selectedCount === 0 || isSubmitting) return;
    setSubmitting(true);
    try {
      await onRevoke(batch, scope);
      handleOpenChange(false);
    } catch {
      return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="w-[min(calc(100vw-2rem),42rem)] md:max-w-2xl space-y-3">
        <div className="flex items-start gap-4 ">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
            <ShieldOff aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <DialogTitle className="text-base font-semibold text-slate-950 dark:text-slate-50">
              {t("revokeTitle")}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              {t("revokeDescription", { batch: batch.batchName })}
            </DialogDescription>
          </div>
        </div>

        {previewQuery.isPending ? (
          <div aria-label={t("revokeLoading")} className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : previewQuery.isError ? (
          <div
            aria-live="polite"
            className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/70 dark:bg-red-950/30"
          >
            <div className="flex gap-3">
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-300"
              />
              <div className="space-y-3">
                <p className="text-sm leading-6 text-red-700 dark:text-red-200">
                  {t("revokePreviewError")}
                </p>
                <Button
                  onClick={() => void previewQuery.refetch()}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {t("revokeRetry")}
                </Button>
              </div>
            </div>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <RadioGroup
              aria-label={t("revokeScopeLabel")}
              className="gap-3"
              onValueChange={(value) =>
                setScope(value as ActivationCodeBatchRevokeScope)
              }
              value={scope}
            >
              <RevokeScopeOption
                count={preview.unassignedRevocableCount}
                description={t("revokeUnassignedOnlyDescription")}
                disabled={preview.unassignedRevocableCount === 0}
                id="revoke-unassigned-only"
                label={t("revokeUnassignedOnly")}
                value="UNASSIGNED_ONLY"
              />
              <RevokeScopeOption
                count={
                  preview.unassignedRevocableCount +
                  preview.assignedRevocableCount
                }
                description={t("revokeAllRevocableDescription", {
                  count: preview.assignedRevocableCount,
                })}
                disabled={
                  preview.unassignedRevocableCount +
                    preview.assignedRevocableCount ===
                  0
                }
                id="revoke-all-revocable"
                label={t("revokeAllRevocable")}
                value="ALL_REVOCABLE"
              />
            </RadioGroup>

            <div className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-300"
              />
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                {t("revokeProtectedSummary")}
              </p>
            </div>

            {scope === "ALL_REVOCABLE" && preview.assignedRevocableCount > 0 ? (
              <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/70 dark:bg-amber-950/30">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300"
                />
                <p className="text-sm leading-6 text-amber-800 dark:text-amber-200">
                  {t("revokeAssignedWarning", {
                    count: preview.assignedRevocableCount,
                  })}
                </p>
              </div>
            ) : null}

            {selectedCount === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("revokeNoCodes")}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="secondary"
          >
            {t("cancel")}
          </Button>
          <Button
            disabled={
              previewQuery.isPending ||
              previewQuery.isError ||
              selectedCount === 0 ||
              isSubmitting
            }
            onClick={() => void handleConfirm()}
            type="button"
            variant="destructive"
          >
            {isSubmitting ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : null}
            {isSubmitting
              ? t("revoking")
              : t("revokeSubmit", { count: selectedCount })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RevokeScopeOption({
  count,
  description,
  disabled,
  id,
  label,
  value,
}: {
  count: number;
  description: string;
  disabled: boolean;
  id: string;
  label: string;
  value: ActivationCodeBatchRevokeScope;
}) {
  const t = useTranslations("ActivationCodeBatches");

  return (
    <label
      className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-4 transition-colors hover:bg-slate-50 has-data-[state=checked]:border-slate-950 has-data-[state=checked]:bg-slate-50 has-data-[disabled]:cursor-not-allowed has-data-[disabled]:opacity-55 dark:border-slate-800 dark:hover:bg-slate-900/70 dark:has-data-[state=checked]:border-slate-300 dark:has-data-[state=checked]:bg-slate-900/70"
      htmlFor={id}
    >
      <RadioGroupItem disabled={disabled} id={id} value={value} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-950 dark:text-slate-50">
            {label}
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {t("revokeCodeCount", { count })}
          </span>
        </span>
        <span className="mt-1 block text-sm leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </span>
    </label>
  );
}
