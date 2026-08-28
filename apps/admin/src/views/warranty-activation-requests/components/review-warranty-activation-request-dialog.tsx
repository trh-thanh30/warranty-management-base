"use client";

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
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
  const [displayedAction, setDisplayedAction] = useState(action);
  const [displayedRequest, setDisplayedRequest] = useState(request);
  const visibleAction = open ? action : displayedAction;
  const visibleRequest = request ?? displayedRequest;
  const isReject = visibleAction === "reject";
  const canSubmit = !isReviewing && (!isReject || rejectionReason.trim());

  useEffect(() => {
    if (open && request) {
      setDisplayedAction(action);
      setDisplayedRequest(request);
    }
  }, [action, open, request]);

  useEffect(() => {
    if (!open) {
      setAdminNote("");
      setRejectionReason("");
    }
  }, [open]);

  function handleConfirm() {
    if (!visibleRequest) return;

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
      <DialogContent
        className={`flex w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 max-sm:h-dvh max-sm:max-h-dvh sm:flex sm:h-fit sm:rounded-lg sm:p-4 ${
          isReject
            ? "sm:w-[min(calc(100vw-2rem),36rem)] sm:max-w-xl"
            : "sm:w-[min(calc(100vw-2rem),72rem)] sm:max-w-6xl"
        }`}
      >
        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 sm:border-0 sm:bg-transparent sm:p-0 sm:dark:border-0 sm:dark:bg-transparent">
          <DialogClose asChild>
            <Button
              aria-label={t("cancel")}
              className="absolute right-4 top-4 z-10 sm:hidden"
              size="icon"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" className="size-5" />
            </Button>
          </DialogClose>
          <DialogTitle className="pr-12 text-lg font-semibold sm:pr-0">
            {isReject ? t("rejectTitle") : t("approveTitle")}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {isReject
              ? t("rejectDescription", {
                  code: visibleRequest?.requestCode ?? "",
                })
              : t("approveDescription", {
                  code: visibleRequest?.requestCode ?? "",
                })}
          </DialogDescription>
        </header>

        <div className="min-h-0 overflow-y-auto px-5 py-5 max-sm:flex-1 sm:p-0">
          {visibleRequest?.items?.length ? (
            <div className="space-y-3 sm:mt-5">
              <p className="text-sm font-medium text-slate-950 dark:text-slate-50">
                {isReject
                  ? t("reviewProductCount", {
                      count: visibleRequest.items.length,
                    })
                  : t("approveAllProductsWarning", {
                      count: visibleRequest.items.length,
                    })}
              </p>
              {!isReject ? (
                <div className="min-w-0 max-h-[min(45vh,30rem)] overflow-x-auto overflow-y-auto">
                  <ActivationRequestItemsTable items={visibleRequest.items} />
                </div>
              ) : null}
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
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 sm:mt-6 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:dark:border-0 sm:dark:bg-transparent">
          <DialogClose asChild>
            <Button
              className="w-full sm:w-auto"
              type="button"
              variant="secondary"
            >
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            className="w-full sm:w-auto"
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
        </footer>
      </DialogContent>
    </Dialog>
  );
}
