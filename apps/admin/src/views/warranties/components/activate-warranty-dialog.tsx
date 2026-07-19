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
  Input,
  Label,
  Textarea,
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
  const activateWarranty = useActivateWarranty(warranty?.productId ?? null);
  const [startDate, setStartDate] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [terms, setTerms] = useState("");

  async function confirm() {
    if (!warranty) return;

    try {
      await activateWarranty.mutateAsync({
        durationMonths: toOptionalNumber(durationMonths),
        startDate: toOptionalValue(startDate),
        terms: toOptionalValue(terms),
      });
      toast.success(t("activated"));
      setStartDate("");
      setDurationMonths("");
      setTerms("");
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
          <div className="space-y-2">
            <Label htmlFor="activate-warranty-duration">
              {t("durationMonths")}
            </Label>
            <Input
              id="activate-warranty-duration"
              max={120}
              min={1}
              onChange={(event) => setDurationMonths(event.target.value)}
              placeholder="12"
              type="number"
              value={durationMonths}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="activate-warranty-terms">{t("terms")}</Label>
            <Textarea
              id="activate-warranty-terms"
              maxLength={2000}
              onChange={(event) => setTerms(event.target.value)}
              placeholder={t("termsPlaceholder")}
              value={terms}
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

function toOptionalNumber(value: string) {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : undefined;
}
