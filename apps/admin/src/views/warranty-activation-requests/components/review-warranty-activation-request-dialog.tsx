"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  ReviewWarrantyActivationRequestBody,
  WarrantyActivationRequestSummary,
} from "@repo/shared";
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
import { ActivationRequestItemsTable } from "./activation-request-items-table";

type ReviewWarrantyActivationRequestDialogProps = {
  action: "approve" | "reject";
  isReviewing: boolean;
  onConfirm: (body: ReviewWarrantyActivationRequestBody) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  request: WarrantyActivationRequestSummary | null;
};

export function ReviewWarrantyActivationRequestDialog({
  action,
  isReviewing,
  onConfirm,
  onOpenChange,
  open,
  request,
}: ReviewWarrantyActivationRequestDialogProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const [adminNote, setAdminNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const isReject = action === "reject";
  const canSubmit = !isReviewing && (!isReject || rejectionReason.trim());

  useEffect(() => {
    if (!open) {
      setAdminNote("");
      setRejectionReason("");
    }
  }, [open]);

  function handleConfirm() {
    if (!request) return;

    onConfirm(
      isReject
        ? {
            adminNote: adminNote.trim() || undefined,
            rejectionReason: rejectionReason.trim(),
            status: "REJECTED",
          }
        : {
            adminNote: adminNote.trim() || undefined,
            status: "APPROVED",
          },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogTitle className="text-lg font-semibold">
          {isReject ? t("rejectTitle") : t("approveTitle")}
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {isReject
            ? t("rejectDescription", { code: request?.requestCode ?? "" })
            : t("approveDescription", { code: request?.requestCode ?? "" })}
        </DialogDescription>

        {request?.items?.length ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm font-medium text-slate-950 dark:text-slate-50">
              {isReject
                ? t("reviewProductCount", { count: request.items.length })
                : t("approveAllProductsWarning", {
                    count: request.items.length,
                  })}
            </p>
            <ActivationRequestItemsTable items={request.items} />
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          {isReject ? (
            <div className="space-y-2">
              <Label htmlFor="activation-request-rejection-reason">
                {t("rejectionReason")}
              </Label>
              <Textarea
                id="activation-request-rejection-reason"
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder={t("rejectionReasonPlaceholder")}
                value={rejectionReason}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="activation-request-admin-note">
              {t("reviewNote")}
            </Label>
            <Textarea
              id="activation-request-admin-note"
              onChange={(event) => setAdminNote(event.target.value)}
              placeholder={t("reviewNotePlaceholder")}
              value={adminNote}
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
            disabled={!canSubmit}
            onClick={handleConfirm}
            type="button"
            variant={isReject ? "destructive" : "primary"}
          >
            {isReviewing
              ? t("reviewing")
              : isReject
                ? t("confirmReject")
                : t("confirmApprove")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
