"use client";

import { PageHeader } from "@/src/components/common/page-header";
import { SelectControl } from "@/src/components/common/select-control";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useToast } from "@/src/hooks/use-toast";
import { usePermissions } from "@/src/hooks/use-permissions";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import { getLocalizedApiError } from "@/src/lib/localized-api-error.utils";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Skeleton,
} from "@repo/ui";
import {
  MAX_ACTIVATION_CODES_PER_BATCH,
  MIN_ACTIVATION_CODES_PER_BATCH,
} from "@repo/shared/constants";
import { PaginationControls } from "@repo/ui/pagination-controls";
import { AlertCircle, FileText, KeyRound, Plus, Settings2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACTIVATION_CODE_BATCH_STATUSES } from "./activation-code-batches.constants";
import { ActivationCodeBatchesTable } from "./components/activation-code-batches-table";
import { ActivationCodePrintJobsDialog } from "./components/activation-code-print-jobs-panel";
import { useActivationCodeBatches } from "./hooks/use-activation-code-batches";
import { useActivationCodePrintJobs } from "./hooks/use-activation-code-print-jobs";

export function ActivationCodeBatchesView() {
  const t = useTranslations("ActivationCodeBatches");
  const tApiErrors = useTranslations("ApiErrors");
  const directory = useActivationCodeBatches();
  const printJobs = useActivationCodePrintJobs();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canConfigurePolicy = hasPermission(PERMISSIONS.SYSTEM_CONFIG_VIEW);
  const canPrint = hasPermission(PERMISSIONS.ACTIVATION_CODE_BATCH_PRINT);
  const [isPrintJobsOpen, setPrintJobsOpen] = useState(false);
  const data = directory.query.data;
  const renameMutation = useMutation({
    mutationFn: ({
      batchId,
      batchName,
    }: {
      batchId: string;
      batchName: string;
    }) => activationCodesService.updateBatchName(batchId, batchName),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["activation-code-batches"],
      });
      toast.success(t("renamed"));
    },
    onError: () => toast.error(t("renameError")),
  });

  return (
    <PermissionGuard permissions={[PERMISSIONS.ACTIVATION_CODE_BATCH_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {canConfigurePolicy ? (
                <Button asChild size="md" variant="outline">
                  <Link href="/settings/activation-code-policy">
                    <Settings2 className="size-4" />
                    {t("settings")}
                  </Link>
                </Button>
              ) : null}
              {canPrint ? (
                <Button
                  onClick={() => setPrintJobsOpen(true)}
                  size="md"
                  variant="outline"
                >
                  <FileText className="size-4" />
                  {t("openPrintJobs", { count: printJobs.jobs.length })}
                </Button>
              ) : null}
              {directory.canCreate ? (
                <Button size="md" onClick={() => directory.setCreateOpen(true)}>
                  <Plus className="size-4" />
                  {t("create")}
                </Button>
              ) : null}
            </div>
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />
        <Dialog
          onOpenChange={(open) => {
            if (!directory.createMutation.isPending) {
              directory.setCreateOpen(open);
            }
          }}
          open={directory.isCreateOpen}
        >
          <DialogContent className="space-y-5 sm:max-w-lg">
            <div className="space-y-1.5">
              <DialogTitle className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                {t("createTitle")}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t("genericPoolDescription")}
              </DialogDescription>
            </div>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                void directory.createMutation
                  .mutateAsync()
                  .then(() => toast.success(t("created")))
                  .catch(() => toast.error(t("createError")));
              }}
            >
              <label className="block space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                {t("batchNameLabel")}
                <Input
                  maxLength={120}
                  onChange={(event) =>
                    directory.setBatchName(event.target.value)
                  }
                  placeholder={t("batchNamePlaceholder")}
                  value={directory.batchName}
                />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                {t("quantityLabel")}
                <Input
                  autoFocus
                  inputMode="numeric"
                  max={MAX_ACTIVATION_CODES_PER_BATCH}
                  min={MIN_ACTIVATION_CODES_PER_BATCH}
                  onChange={(event) =>
                    directory.setQuantity(event.target.value)
                  }
                  placeholder={t("quantityPlaceholder")}
                  type="number"
                  value={directory.quantity}
                />
                <span className="block text-xs font-normal leading-5 text-slate-500 dark:text-slate-400">
                  {t("quantityDescription")}
                </span>
              </label>
              <div className="flex justify-end gap-2">
                <Button
                  disabled={directory.createMutation.isPending}
                  onClick={() => directory.setCreateOpen(false)}
                  type="button"
                  variant="secondary"
                >
                  {t("cancel")}
                </Button>
                <Button
                  disabled={directory.createMutation.isPending}
                  type="submit"
                >
                  {t("createSubmit")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <ActivationCodePrintJobsDialog
          jobs={printJobs.jobs}
          onDismiss={printJobs.remove}
          onOpenChange={setPrintJobsOpen}
          open={isPrintJobsOpen}
        />
        <Card>
          <CardHeader className="gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <CardTitle>{t("directoryTitle")}</CardTitle>
              <CardDescription className="mt-1.5">
                {t("directoryDescription")}
              </CardDescription>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[22rem_13rem]">
              <Input
                aria-label={t("searchLabel")}
                onChange={(event) => directory.setSearch(event.target.value)}
                placeholder={t("searchPlaceholder")}
                value={directory.search}
              />
              <SelectControl
                aria-label={t("statusLabel")}
                onValueChange={(value) =>
                  directory.setStatus(value as typeof directory.status)
                }
                options={[
                  { label: t("allStatuses"), value: "" },
                  ...ACTIVATION_CODE_BATCH_STATUSES.map((value) => ({
                    label: t(`statuses.${value}`),
                    value,
                  })),
                ]}
                value={directory.status}
              />
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {directory.query.isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton className="h-14 w-full" key={index} />
                ))}
              </div>
            ) : directory.query.isError ? (
              <StatePanel
                description={t("errorDescription")}
                action={
                  <Button
                    onClick={() => void directory.query.refetch()}
                    size="sm"
                  >
                    {t("retry")}
                  </Button>
                }
                icon={AlertCircle}
                title={t("retry")}
              />
            ) : data?.items.length ? (
              <>
                <ActivationCodeBatchesTable
                  canPrint={canPrint}
                  canRevoke={directory.canRevoke}
                  items={data.items}
                  onJobRequested={printJobs.add}
                  onRevoke={async (batch, scope) => {
                    try {
                      const result = await directory.revokeMutation.mutateAsync(
                        { batchId: batch.id, scope },
                      );
                      toast.success(
                        t("revoked", { count: result.revokedCount }),
                      );
                    } catch (error) {
                      toast.error(
                        getLocalizedApiError(error, t, {
                          apiErrors: tApiErrors,
                          fallbackKey: "revokeError",
                        }),
                      );
                      throw error;
                    }
                  }}
                  onRename={(batch, batchName) => {
                    void renameMutation.mutateAsync({
                      batchId: batch.id,
                      batchName,
                    });
                  }}
                />
                <PaginationControls
                  nextLabel={t("next")}
                  onPageChange={directory.setPage}
                  page={data.meta.page}
                  pageSize={data.meta.limit}
                  previousLabel={t("previous")}
                  summary={t("summary", { total: data.meta.total })}
                  totalPages={data.meta.totalPages}
                />
              </>
            ) : (
              <StatePanel
                description={t("emptyDescription")}
                icon={KeyRound}
                title={t("emptyTitle")}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
