"use client";

import { useState } from "react";
import { Loader2, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ActivationCodePrintJob } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
} from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/src/hooks/use-toast";
import type { ActivationCodeBatchListItem } from "@/src/services/activation-codes/activation-code-batches.types";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";

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
  const requestMutation = useMutation({
    mutationFn: () =>
      activationCodesService.requestPrintJob(batch.id, {
        from: Number(from),
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
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">
          {t("printTitle")}
        </DialogTitle>
        <DialogDescription className="mt-1 text-base font-medium text-slate-500">
          {t("printDescription", { batch: batch.batchCode })}
        </DialogDescription>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            requestMutation.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
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
          <div className="flex justify-end gap-2">
            <Button
              disabled={requestMutation.isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="secondary"
            >
              {t("cancel")}
            </Button>
            <Button disabled={requestMutation.isPending} type="submit">
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
