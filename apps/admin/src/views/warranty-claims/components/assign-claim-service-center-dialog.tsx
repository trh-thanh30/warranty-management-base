"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ServiceCenterSummary, WarrantyClaimSummary } from "@repo/shared";
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
import { formatServiceCenterOption } from "../warranty-claims.utils";

type AssignClaimServiceCenterDialogProps = {
  claim: WarrantyClaimSummary | null;
  isAssigning: boolean;
  onConfirm: (serviceCenterId: string, note: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  serviceCenters: ServiceCenterSummary[];
};

export function AssignClaimServiceCenterDialog({
  claim,
  isAssigning,
  onConfirm,
  onOpenChange,
  open,
  serviceCenters,
}: AssignClaimServiceCenterDialogProps) {
  const t = useTranslations("WarrantyClaims");
  const [serviceCenterId, setServiceCenterId] = useState("");
  const [note, setNote] = useState("");
  const currentServiceCenter = claim?.serviceCenter ?? null;
  const isReassignment = currentServiceCenter !== null;
  const selectedServiceCenter = serviceCenters.find(
    (serviceCenter) => serviceCenter.id === serviceCenterId,
  );
  const availableServiceCenters = serviceCenters.filter(
    (serviceCenter) => serviceCenter.id !== currentServiceCenter?.id,
  );

  useEffect(() => {
    if (!open) {
      setServiceCenterId("");
      setNote("");
      return;
    }

    setServiceCenterId("");
  }, [claim?.serviceCenter?.id, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          {t(
            isReassignment
              ? "changeServiceCenterTitle"
              : "assignServiceCenterTitle",
          )}
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-slate-500">
          {t(
            isReassignment
              ? "changeServiceCenterDescription"
              : "assignServiceCenterDescription",
            {
              code: claim?.claimCode ?? "",
            },
          )}
        </DialogDescription>

        {isReassignment ? (
          <div className="mt-4 flex min-w-0 items-center gap-3 rounded-md bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-900">
            <span className="min-w-0 flex-1 truncate font-medium text-slate-700 dark:text-slate-200">
              {currentServiceCenter.name}
            </span>
            <ArrowRight className="size-4 shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1 truncate text-right font-medium text-slate-950 dark:text-slate-50">
              {selectedServiceCenter?.name ?? t("newServiceCenter")}
            </span>
          </div>
        ) : null}

        {isReassignment && claim?.status === "IN_REPAIR" ? (
          <div className="mt-3 flex gap-2 text-sm text-amber-700 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>{t("inRepairReassignmentWarning")}</p>
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claim-service-center">{t("serviceCenter")}</Label>
            <select
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
              id="claim-service-center"
              onChange={(event) => setServiceCenterId(event.target.value)}
              value={serviceCenterId}
            >
              <option value="">{t("selectServiceCenter")}</option>
              {availableServiceCenters.map((serviceCenter) => (
                <option key={serviceCenter.id} value={serviceCenter.id}>
                  {formatServiceCenterOption(serviceCenter)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="claim-service-center-note">
              {isReassignment ? t("reassignmentReason") : t("note")}
            </Label>
            <Textarea
              aria-required={isReassignment}
              id="claim-service-center-note"
              onChange={(event) => setNote(event.target.value)}
              placeholder={
                isReassignment
                  ? t("reassignmentReasonPlaceholder")
                  : t("serviceCenterNotePlaceholder")
              }
              required={isReassignment}
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
            disabled={
              isAssigning ||
              !serviceCenterId ||
              (isReassignment && !note.trim())
            }
            onClick={() => onConfirm(serviceCenterId, note)}
            type="button"
          >
            {t(isReassignment ? "changeServiceCenter" : "assignServiceCenter")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
