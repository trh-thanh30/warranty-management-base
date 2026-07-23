"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
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
import { Link } from "@/src/i18n/navigation";
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
  const [ownerRequired, setOwnerRequired] = useState(false);
  const requiresOwner = Boolean(warranty && !warranty.owner);

  async function confirm() {
    if (!warranty || requiresOwner) {
      setOwnerRequired(true);
      return;
    }

    try {
      setOwnerRequired(false);
      await activateWarranty.mutateAsync({
        startDate: toOptionalValue(startDate),
      });
      toast.success(t("activated"));
      setStartDate("");
      onActivated?.();
      onOpenChange(false);
    } catch (error) {
      if (isWarrantyOwnerRequiredError(error)) {
        setOwnerRequired(true);
        toast.error(t("activateOwnerRequired"));
        return;
      }

      const message = getActivateErrorMessage(error, t);
      toast.error(message);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setOwnerRequired(false);
        onOpenChange(nextOpen);
      }}
    >
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
          {(ownerRequired || requiresOwner) && warranty ? (
            <div
              className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100 sm:flex-row sm:items-start sm:justify-between"
              role="alert"
            >
              <div className="flex gap-2">
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <p className="leading-6">{t("activateOwnerRequiredHelp")}</p>
              </div>
              <Button asChild size="sm" type="button" variant="secondary">
                <Link href={`/products/${warranty.product.id}`}>
                  {t("goToAssignOwner")}
                </Link>
              </Button>
            </div>
          ) : null}
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
            disabled={!warranty || requiresOwner || activateWarranty.isPending}
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

function getActivateErrorMessage(
  error: unknown,
  t: ReturnType<typeof useTranslations<"Warranties">>,
) {
  if (error instanceof HttpClientError && error.status === 404) {
    return t("notFound");
  }

  return t("activateError");
}

function isWarrantyOwnerRequiredError(error: unknown) {
  if (!(error instanceof HttpClientError)) return false;

  const details = error.details;
  return (
    typeof details === "object" &&
    details !== null &&
    "code" in details &&
    details.code === "WARRANTY_OWNER_REQUIRED"
  );
}
