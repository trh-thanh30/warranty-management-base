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

type UpdateClaimStatusDialogProps = {
  allowedStatuses: WarrantyClaimStatus[];
  claim: WarrantyClaimSummary | null;
  isUpdating: boolean;
  onConfirm: (status: string, note: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function UpdateClaimStatusDialog({
  allowedStatuses,
  claim,
  isUpdating,
  onConfirm,
  onOpenChange,
  open,
}: UpdateClaimStatusDialogProps) {
  const t = useTranslations("WarrantyClaims");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) {
      setStatus("");
      setNote("");
      return;
    }

    setStatus(allowedStatuses[0] ?? "");
  }, [allowedStatuses, open]);

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
            <Button type="button" variant="secondary">
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            disabled={isUpdating || !status}
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
