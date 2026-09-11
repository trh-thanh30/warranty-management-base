"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { WarrantyClaimStatus, WarrantyClaimSummary } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Label,
  Textarea,
} from "@repo/ui";
import { SelectControl } from "@/src/components/common/select-control";

const IMMEDIATE_COMPLETION_STATUSES = new Set<WarrantyClaimStatus>([
  "SUBMITTED",
  "REVIEWING",
  "APPROVED",
  "IN_REPAIR",
]);

type UpdateClaimStatusDialogProps = {
  allowedStatuses: WarrantyClaimStatus[];
  claim: WarrantyClaimSummary | null;
  isCompletingImmediately: boolean;
  isUpdating: boolean;
  onCompleteImmediately: (note: string) => void;
  onConfirm: (status: string, note: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function UpdateClaimStatusDialog({
  allowedStatuses,
  claim,
  isCompletingImmediately,
  isUpdating,
  onCompleteImmediately,
  onConfirm,
  onOpenChange,
  open,
}: UpdateClaimStatusDialogProps) {
  const t = useTranslations("WarrantyClaims");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [isConfirmingCompletion, setIsConfirmingCompletion] = useState(false);

  useEffect(() => {
    if (!open) {
      setStatus("");
      setNote("");
      setIsConfirmingCompletion(false);
      return;
    }

    setStatus(allowedStatuses[0] ?? "");
    setIsConfirmingCompletion(false);
  }, [allowedStatuses, open]);

  const canCompleteImmediately =
    claim !== null && IMMEDIATE_COMPLETION_STATUSES.has(claim.status);
  const isBusy = isUpdating || isCompletingImmediately;

  if (isConfirmingCompletion) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>{t("completeImmediatelyTitle")}</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-slate-500">
            {t("completeImmediatelyDescription", {
              code: claim?.claimCode ?? "",
              status: claim ? t(`statuses.${claim.status}`) : "",
            })}
          </DialogDescription>

          <div
            className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
            role="alert"
          >
            {t("completeImmediatelyWarning")}
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="claim-completion-note">{t("note")}</Label>
            <Textarea
              id="claim-completion-note"
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("notePlaceholder")}
              value={note}
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              disabled={isBusy}
              onClick={() => setIsConfirmingCompletion(false)}
              type="button"
              variant="secondary"
            >
              {t("back")}
            </Button>
            <Button
              disabled={isBusy}
              onClick={() => onCompleteImmediately(note)}
              type="button"
            >
              {isCompletingImmediately
                ? t("completingImmediately")
                : t("confirmCompleteImmediately")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t("updateStatusTitle")}</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-slate-500">
          {t("updateStatusDescription", { code: claim?.claimCode ?? "" })}
        </DialogDescription>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claim-status">{t("nextStatus")}</Label>
            <SelectControl
              disabled={allowedStatuses.length === 0}
              id="claim-status"
              onValueChange={setStatus}
              options={
                allowedStatuses.length === 0
                  ? [{ label: t("noValidTransitions"), value: "" }]
                  : allowedStatuses.map((statusOption) => ({
                      label: t(`statuses.${statusOption}`),
                      value: statusOption,
                    }))
              }
              value={status}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="claim-status-note">{t("note")}</Label>
            <Textarea
              id="claim-status-note"
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("notePlaceholder")}
              value={note}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button disabled={isBusy} type="button" variant="secondary">
              {t("cancel")}
            </Button>
          </DialogClose>
          {canCompleteImmediately ? (
            <Button
              className="border-green-200 bg-green-50 text-green-500 transition-colors duration-200 hover:border-green-300 hover:bg-green-100 hover:text-green-600"
              disabled={isBusy}
              onClick={() => setIsConfirmingCompletion(true)}
              type="button"
              variant="secondary"
            >
              {t("completeImmediately")}
            </Button>
          ) : null}
          <Button
            disabled={isBusy || !status}
            onClick={() => onConfirm(status, note)}
            type="button"
          >
            {t("saveStatus")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
