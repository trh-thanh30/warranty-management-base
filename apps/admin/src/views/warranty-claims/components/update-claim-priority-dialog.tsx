"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { WarrantyClaimPriority, WarrantyClaimSummary } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DatePicker,
  Label,
} from "@repo/ui";
import { WARRANTY_CLAIM_PRIORITY_FILTERS } from "../warranty-claims.constants";

type UpdateClaimPriorityDialogProps = {
  claim: WarrantyClaimSummary | null;
  isUpdating: boolean;
  onConfirm: (priority: string, dueAt: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function UpdateClaimPriorityDialog({
  claim,
  isUpdating,
  onConfirm,
  onOpenChange,
  open,
}: UpdateClaimPriorityDialogProps) {
  const t = useTranslations("WarrantyClaims");
  const [priority, setPriority] = useState<WarrantyClaimPriority>("NORMAL");
  const [dueAt, setDueAt] = useState("");

  useEffect(() => {
    if (!open) {
      setPriority("NORMAL");
      setDueAt("");
      return;
    }

    setPriority(claim?.priority ?? "NORMAL");
    setDueAt(claim?.dueAt ? claim.dueAt.slice(0, 10) : "");
  }, [claim?.dueAt, claim?.priority, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t("updatePriorityTitle")}</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-slate-500">
          {t("updatePriorityDescription", { code: claim?.claimCode ?? "" })}
        </DialogDescription>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="claim-priority">{t("priority")}</Label>
            <select
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
              id="claim-priority"
              onChange={(event) =>
                setPriority(event.target.value as WarrantyClaimPriority)
              }
              value={priority}
            >
              {WARRANTY_CLAIM_PRIORITY_FILTERS.filter(
                (item) => item !== "ALL",
              ).map((priorityOption) => (
                <option key={priorityOption} value={priorityOption}>
                  {t(`priorities.${priorityOption}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="claim-due-at">{t("dueAt")}</Label>
            <DatePicker
              ariaLabel={t("dueAt")}
              id="claim-due-at"
              onValueChange={setDueAt}
              placeholder={t("selectDueDate")}
              value={dueAt}
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
            disabled={isUpdating}
            onClick={() => onConfirm(priority, dueAt)}
            type="button"
          >
            {t("savePriority")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
