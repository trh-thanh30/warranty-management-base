"use client";

import { useToast } from "@/src/hooks/use-toast";
import { useVoidWarranty } from "@/src/hooks/use-warranties";
import type { WarrantyListItem } from "@repo/shared";
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
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type VoidWarrantyDialogProps = {
  onOpenChange: (open: boolean) => void;
  onVoided?: () => void;
  open: boolean;
  warranty: WarrantyListItem | null;
};

export function VoidWarrantyDialog({
  onOpenChange,
  onVoided,
  open,
  warranty,
}: VoidWarrantyDialogProps) {
  const t = useTranslations("Warranties");
  const toast = useToast();
  const voidWarranty = useVoidWarranty(warranty?.id ?? null);
  const [reason, setReason] = useState("");
  const normalizedReason = reason.trim();

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  async function confirm() {
    if (!warranty || normalizedReason.length < 3) return;

    try {
      await voidWarranty.mutateAsync({ reason: normalizedReason });
      toast.success(t("voidSuccess"));
      onVoided?.();
      onOpenChange(false);
    } catch (error) {
      const code = getApiErrorCode(error);
      toast.error(
        code === "WARRANTY_HAS_OPEN_CLAIMS"
          ? t("voidOpenClaimsError")
          : t("voidError"),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-base font-semibold">
          {t("voidTitle")}
        </DialogTitle>
        <DialogDescription className="text-sm  text-slate-500 dark:text-slate-400">
          {t("voidDescription", { code: warranty?.warrantyCode ?? "-" })}
        </DialogDescription>

        <div className="mt-3.5 space-y-2">
          <Label htmlFor="void-warranty-reason" className="mb-1">
            {t("voidReason")}
          </Label>
          <Textarea
            id="void-warranty-reason"
            maxLength={1000}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("voidReasonPlaceholder")}
            rows={4}
            value={reason}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            disabled={normalizedReason.length < 3 || voidWarranty.isPending}
            onClick={() => void confirm()}
            type="button"
            variant="destructive"
          >
            {voidWarranty.isPending ? t("voiding") : t("confirmVoid")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getApiErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return null;
  const details = "details" in error ? error.details : null;
  if (!details || typeof details !== "object") return null;
  return "code" in details && typeof details.code === "string"
    ? details.code
    : null;
}
