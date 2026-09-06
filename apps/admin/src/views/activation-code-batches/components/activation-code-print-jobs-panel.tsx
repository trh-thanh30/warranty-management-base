"use client";

import { useToast } from "@/src/hooks/use-toast";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, FileText, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TrackedActivationCodePrintJob } from "../hooks/use-activation-code-print-jobs";

type ActivationCodePrintJobsDialogProps = {
  jobs: TrackedActivationCodePrintJob[];
  onDismiss: (jobId: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function ActivationCodePrintJobsDialog({
  jobs,
  onDismiss,
  onOpenChange,
  open,
}: ActivationCodePrintJobsDialogProps) {
  const t = useTranslations("ActivationCodeBatches");

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-60rem),64rem)] overflow-y-auto">
        <DialogClose asChild>
          <Button
            aria-label={t("close")}
            className="absolute right-3 top-3"
            size="icon"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </DialogClose>
        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
          {t("printJobsTitle")}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
          {t("printJobsDescription")}
        </DialogDescription>
        <div className="mt-5 space-y-3">
          {jobs.length > 0 ? (
            jobs.map((tracked) => (
              <ActivationCodePrintJobItem
                key={tracked.job.id}
                onDismiss={onDismiss}
                tracked={tracked}
              />
            ))
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
              <FileText className="size-8 text-slate-400" />
              <p className="mt-3 font-medium">{t("printJobsEmpty")}</p>
              <p className="mt-1 text-sm text-slate-500">
                {t("printJobsEmptyDescription")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActivationCodePrintJobItem({
  onDismiss,
  tracked,
}: {
  onDismiss: ActivationCodePrintJobsDialogProps["onDismiss"];
  tracked: TrackedActivationCodePrintJob;
}) {
  const t = useTranslations("ActivationCodeBatches");
  const toast = useToast();
  const query = useQuery({
    initialData: tracked.job,
    queryFn: () => activationCodesService.getPrintJob(tracked.job.id),
    queryKey: ["activation-code-print-job", tracked.job.id],
    refetchInterval: (result) => {
      const status = result.state.data?.status;
      return status === "QUEUED" || status === "PROCESSING" ? 1500 : false;
    },
    refetchIntervalInBackground: true,
  });
  const job = query.data;
  const progress = Math.max(0, Math.min(100, job.progress_percent ?? 0));
  const isRunning = job.status === "QUEUED" || job.status === "PROCESSING";
  const downloadMutation = useMutation({
    mutationFn: () => activationCodesService.downloadPrintJob(job.id),
    onError: () => toast.error(t("downloadError")),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        job.filename || `activation-labels-${tracked.batchCode}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });

  return (
    <article className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-950 dark:text-slate-50">
            {tracked.batchCode}
          </p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {tracked.productName} · {job.from_index}–{job.to_index}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {job.status === "COMPLETED" ? (
            <Button
              disabled={downloadMutation.isPending}
              onClick={() => downloadMutation.mutate()}
              size="sm"
            >
              {downloadMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {t("download")}
            </Button>
          ) : null}
          {!isRunning ? (
            <Button
              aria-label={t("dismissPrintJob", { batch: tracked.batchCode })}
              onClick={() => onDismiss(job.id)}
              size="icon"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span
          className={
            job.status === "FAILED"
              ? "text-red-600"
              : "text-slate-600 dark:text-slate-300"
          }
        >
          {t(`printStatuses.${job.status}`)}
        </span>
        <span className="font-medium tabular-nums">{progress}%</span>
      </div>
      <div
        aria-label={t("printProgress", { batch: tracked.batchCode })}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        role="progressbar"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${job.status === "FAILED" ? "bg-red-500" : job.status === "COMPLETED" ? "bg-emerald-500" : "bg-blue-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {job.error_message ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {job.error_message}
        </p>
      ) : null}
    </article>
  );
}
