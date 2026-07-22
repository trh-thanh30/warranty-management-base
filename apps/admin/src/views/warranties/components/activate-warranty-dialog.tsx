"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { WarrantyListItem } from "@repo/shared";
import { HttpClientError } from "@repo/shared";
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
import { useActivateWarranty } from "@/src/hooks/use-warranties";
import { useToast } from "@/src/hooks/use-toast";
import { toOptionalValue } from "@/src/utils";

type ActivateWarrantyDialogProps = {
  onActivated?: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  warranty: WarrantyListItem | null;
};

export function ActivateWarrantyDialog({
  onActivated,
  onOpenChange,
  open,
  warranty,
}: ActivateWarrantyDialogProps) {
  const t = useTranslations("Warranties");
  const toast = useToast();
  const activateWarranty = useActivateWarranty(warranty?.id ?? null);
  const [startDate, setStartDate] = useState("");

  async function confirm() {
    if (!warranty) return;

    try {
      await activateWarranty.mutateAsync({
        startDate: toOptionalValue(startDate),
      });
      toast.success(t("activated"));
      setStartDate("");
      onActivated?.();
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof HttpClientError && error.status === 404
          ? t("notFound")
          : t("activateError");
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">
          {t("activateTitle")}
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t("activateDescription", {
            code: warranty?.warrantyCode ?? "",
          })}
        </DialogDescription>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activate-warranty-start-date">
              {t("startDate")}
            </Label>
            <DatePicker
              ariaLabel={t("startDate")}
              id="activate-warranty-start-date"
              onValueChange={setStartDate}
              placeholder={t("selectStartDate")}
              value={startDate}
            />
          </div>
          <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/40 sm:grid-cols-2">
            <div>
              <p className="text-slate-500 dark:text-slate-400">
                {t("durationMonths")}
              </p>
              <p className="mt-1 font-medium">
                {warranty
                  ? t("durationValue", { count: warranty.durationMonths })
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">{t("terms")}</p>
              <p className="mt-1 line-clamp-2 font-medium">
                {warranty?.terms
                  ? t("termsConfigured")
                  : t("termsNotConfigured")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t("cancel")}
            </Button>
          </DialogClose>
          <Button
            disabled={!warranty || activateWarranty.isPending}
            onClick={() => {
              void confirm();
            }}
            type="button"
          >
            {activateWarranty.isPending ? t("activating") : t("activate")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
