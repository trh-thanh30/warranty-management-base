"use client";

import { getLocalizedApiError } from "@/src/lib/localized-api-error.utils";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import type {
  ExtendActivationCodeBatchExpiryResult,
  ExtendActivationCodeExpiryResult,
} from "@repo/shared";
import { formatDate } from "@repo/shared";
import { MAX_ACTIVATION_CODE_EXTENSION_MONTHS } from "@repo/shared/constants";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Separator,
} from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  addCalendarMonthsUtc,
  parseActivationCodeExtensionMonths,
} from "../activation-code-expiry-extension.utils";

type ExtensionTarget = {
  id: string;
  expiresAt: string;
  kind: "batch" | "code";
  label: string;
};

type ExtensionResult =
  | ExtendActivationCodeBatchExpiryResult
  | ExtendActivationCodeExpiryResult;

export function ActivationCodeExpiryExtensionDialog({
  onExtended,
  onOpenChange,
  open,
  target,
}: {
  onExtended: (result: ExtensionResult) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  target: ExtensionTarget | null;
}) {
  const t = useTranslations("ActivationCodeExpiryExtension");
  const tApiErrors = useTranslations("ApiErrors");
  const locale = useLocale();
  const [monthsValue, setMonthsValue] = useState("1");
  const months = parseActivationCodeExtensionMonths(monthsValue);
  const projectedExpiry = useMemo(() => {
    if (!target || months === null) return null;
    return addCalendarMonthsUtc(new Date(target.expiresAt), months);
  }, [months, target]);
  const mutation = useMutation<ExtensionResult, Error>({
    mutationFn: async () => {
      if (!target || months === null) throw new Error("Invalid extension");
      if (target.kind === "batch") {
        return activationCodesService.extendBatchExpiry(target.id, { months });
      }
      return activationCodesService.extendCodeExpiry(target.id, { months });
    },
    onSuccess: async (result) => {
      await onExtended(result);
      onOpenChange(false);
    },
  });
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (open) {
      setMonthsValue("1");
      resetMutation();
    }
  }, [open, resetMutation]);

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!mutation.isPending) onOpenChange(nextOpen);
      }}
      open={open}
    >
      <DialogContent className="space-y-5 sm:max-w-lg">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
            <CalendarPlus className="size-5" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="font-semibold text-slate-950 dark:text-slate-50">
              {t("title")}
            </DialogTitle>
            <DialogDescription>
              {t(
                target?.kind === "batch"
                  ? "batchDescription"
                  : "codeDescription",
                {
                  label: target?.label ?? "",
                },
              )}
            </DialogDescription>
          </div>
        </div>
        <Separator className="bg-slate-200 dark:bg-slate-800" />

        <dl className="grid gap-3 rounded-md border border-slate-200 p-4 text-sm dark:border-slate-800 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">
              {t("currentExpiry")}
            </dt>
            <dd className="mt-1 font-medium tabular-nums">
              {formatDate(target?.expiresAt, { locale })}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">
              {t("projectedExpiry")}
            </dt>
            <dd className="mt-1 font-medium tabular-nums text-blue-700 dark:text-blue-300">
              {projectedExpiry ? formatDate(projectedExpiry, { locale }) : "-"}
            </dd>
          </div>
        </dl>

        <label className="block space-y-2 text-sm font-medium">
          {t("monthsLabel")}
          <Input
            autoFocus
            inputMode="numeric"
            max={MAX_ACTIVATION_CODE_EXTENSION_MONTHS}
            min={1}
            onChange={(event) => setMonthsValue(event.target.value)}
            type="number"
            value={monthsValue}
          />
          <span className="block text-xs font-normal text-slate-500">
            {t("monthsHint", { max: MAX_ACTIVATION_CODE_EXTENSION_MONTHS })}
          </span>
        </label>

        {mutation.isError ? (
          <p className="text-sm text-red-600" role="alert">
            {getLocalizedApiError(mutation.error, t, {
              apiErrors: tApiErrors,
              fallbackKey: "error",
            })}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            {t("cancel")}
          </Button>
          <Button
            disabled={months === null || mutation.isPending}
            onClick={() => mutation.mutate()}
            type="button"
          >
            {mutation.isPending ? t("submitting") : t("submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
