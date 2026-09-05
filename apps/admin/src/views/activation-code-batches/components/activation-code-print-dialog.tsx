"use client";

import { useToast } from "@/src/hooks/use-toast";
import type { ActivationCodeBatchListItem } from "@/src/services/activation-codes/activation-code-batches.types";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import type { ActivationCodePrintJob } from "@repo/shared";
import {
  ACTIVATION_LABEL_PRINTABLE_HEIGHT_MM,
  ACTIVATION_LABEL_PRINTABLE_WIDTH_MM,
  DEFAULT_ACTIVATION_LABEL_HEIGHT_MM,
  DEFAULT_ACTIVATION_LABEL_WIDTH_MM,
  MIN_ACTIVATION_LABEL_HEIGHT_MM,
  MIN_ACTIVATION_LABEL_WIDTH_MM,
} from "@repo/shared/constants";
import {
  isActivationLabelSizeValid,
  resolveActivationLabelLayout,
} from "@repo/shared/utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
} from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type ActivationCodePrintDialogProps = {
  batch: ActivationCodeBatchListItem;
  onJobRequested: (
    batch: ActivationCodeBatchListItem,
    job: ActivationCodePrintJob,
  ) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function ActivationCodePrintDialog({
  batch,
  onJobRequested,
  onOpenChange,
  open,
}: ActivationCodePrintDialogProps) {
  const t = useTranslations("ActivationCodeBatches");
  const toast = useToast();
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState(String(batch.quantity));
  const [labelWidthMm, setLabelWidthMm] = useState(
    String(DEFAULT_ACTIVATION_LABEL_WIDTH_MM),
  );
  const [labelHeightMm, setLabelHeightMm] = useState(
    String(DEFAULT_ACTIVATION_LABEL_HEIGHT_MM),
  );
  const parsedLabelWidthMm = Number(labelWidthMm);
  const parsedLabelHeightMm = Number(labelHeightMm);
  const hasValidLabelSize = isActivationLabelSizeValid({
    labelHeightMm: parsedLabelHeightMm,
    labelWidthMm: parsedLabelWidthMm,
  });
  const layout = hasValidLabelSize
    ? resolveActivationLabelLayout({
        labelHeightMm: parsedLabelHeightMm,
        labelWidthMm: parsedLabelWidthMm,
      })
    : null;
  const requestMutation = useMutation({
    mutationFn: () =>
      activationCodesService.requestPrintJob(batch.id, {
        from: Number(from),
        labelHeightMm: parsedLabelHeightMm,
        labelWidthMm: parsedLabelWidthMm,
        to: Number(to),
      }),
    onError: () => toast.error(t("printError")),
    onSuccess: (job) => {
      onJobRequested(batch, job);
      onOpenChange(false);
      toast.info(t("printRequested"));
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="w-[min(calc(100vw-2rem),42rem)] md:max-w-2xl">
        <DialogTitle className="text-base font-semibold">
          {t("printTitle")}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
          {t("printDescription", { batch: batch.batchCode })}
        </DialogDescription>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            requestMutation.mutate();
          }}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">
              {t("printFrom")}
              <Input
                max={batch.quantity}
                min={1}
                onChange={(event) => setFrom(event.target.value)}
                required
                type="number"
                value={from}
              />
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              {t("printTo")}
              <Input
                max={batch.quantity}
                min={1}
                onChange={(event) => setTo(event.target.value)}
                required
                type="number"
                value={to}
              />
            </label>
          </div>
          <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                {t("printSizeTitle")}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("printSizeDescription", {
                  height: DEFAULT_ACTIVATION_LABEL_HEIGHT_MM,
                  width: DEFAULT_ACTIVATION_LABEL_WIDTH_MM,
                })}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">
                {t("printLabelWidth")}
                <Input
                  max={ACTIVATION_LABEL_PRINTABLE_WIDTH_MM}
                  min={MIN_ACTIVATION_LABEL_WIDTH_MM}
                  onChange={(event) => setLabelWidthMm(event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={labelWidthMm}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                {t("printLabelHeight")}
                <Input
                  max={ACTIVATION_LABEL_PRINTABLE_HEIGHT_MM}
                  min={MIN_ACTIVATION_LABEL_HEIGHT_MM}
                  onChange={(event) => setLabelHeightMm(event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={labelHeightMm}
                />
              </label>
            </div>
            {layout ? (
              <p
                className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                role="status"
              >
                {t("printLayoutPreview", {
                  columns: layout.columns,
                  count: layout.labelsPerPage,
                  rows: layout.rows,
                })}
              </p>
            ) : (
              <p
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {t("printLayoutInvalid")}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              disabled={requestMutation.isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="secondary"
            >
              {t("cancel")}
            </Button>
            <Button
              disabled={requestMutation.isPending || !layout}
              type="submit"
            >
              {requestMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Printer className="size-4" />
              )}
              {t("printSubmit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
