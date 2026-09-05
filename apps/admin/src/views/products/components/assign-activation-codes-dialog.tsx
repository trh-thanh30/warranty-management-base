"use client";

import { ActivationCodeStatusBadge } from "@/src/components/activation-code-status-badge";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";
import { SearchDropdown } from "@/src/components/common/search-dropdown";
import { useToast } from "@/src/hooks/use-toast";
import { getLocalizedApiError } from "@/src/lib/localized-api-error.utils";
import type { AvailableActivationCode } from "@/src/services/activation-codes/activation-code-batches.types";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import { useDebounce } from "@repo/hooks";
import type { ProductResponse } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Label,
} from "@repo/ui";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

export function AssignActivationCodesDialog({
  onAssigned,
  onOpenChange,
  open,
  product,
}: {
  onAssigned?: () => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product: ProductResponse | null;
}) {
  const t = useTranslations("ProductActivationCodeAssignment");
  const tApiErrors = useTranslations("ApiErrors");
  const toast = useToast();
  const queryClient = useQueryClient();
  const [batchId, setBatchId] = useState("ALL");
  const [selectedBatchLabel, setSelectedBatchLabel] = useState(() =>
    t("allBatches"),
  );
  const [batchSearch, setBatchSearch] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AvailableActivationCode | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currentCode = product?.assignedActivationCode ?? null;
  const isReplacement = currentCode !== null;
  const canSubmit = !isReplacement || currentCode.canReplace;
  const debouncedBatchSearch = useDebounce(batchSearch.trim(), 300);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const batchesQuery = useInfiniteQuery({
    enabled: open && canSubmit,
    queryKey: ["activation-code-assignment-batches", debouncedBatchSearch],
    queryFn: ({ pageParam }) =>
      activationCodesService.listBatches({
        limit: 20,
        page: pageParam,
        search: debouncedBatchSearch || undefined,
        status: "AVAILABLE",
      }),
    initialPageParam: 1,
    getNextPageParam: (page) =>
      page.meta.hasNextPage ? page.meta.page + 1 : undefined,
  });
  const batches = useMemo(
    () => batchesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [batchesQuery.data],
  );
  const batchOptions = [
    ...(batchSearch.trim()
      ? []
      : [{ id: "ALL", batchCode: "", batchName: t("allBatches") }]),
    ...batches,
  ];
  const codesQuery = useInfiniteQuery({
    enabled: open && canSubmit,
    queryKey: ["activation-code-assignment-options", batchId, debouncedSearch],
    queryFn: ({ pageParam }) =>
      activationCodesService.listAvailableByProduct(undefined, {
        assignment: "UNASSIGNED",
        batchId: batchId === "ALL" ? undefined : batchId,
        limit: 20,
        page: pageParam,
        search: debouncedSearch || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (page) =>
      page.meta.hasNextPage ? page.meta.page + 1 : undefined,
  });
  const codes = useMemo(
    () => codesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [codesQuery.data],
  );
  const selectableCodes = useMemo(
    () => codes.filter((code) => code.selectable),
    [codes],
  );
  const mutation = useMutation({
    mutationFn: () => {
      if (currentCode) {
        return activationCodesService.replaceProductAssignment({
          currentActivationCodeId: currentCode.id,
          replacementActivationCodeId: selected!.id,
          productId: product!.id,
        });
      }
      return activationCodesService.assignProduct({
        activationCodeId: selected!.id,
        productId: product!.id,
      });
    },
    onMutate: () => setErrorMessage(null),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["activation-code-detail"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({
          queryKey: ["activation-code-assignment-options"],
        }),
      ]);
      await onAssigned?.();
      toast.success(t(isReplacement ? "replaceSuccess" : "success"));
      setConfirmOpen(false);
      onOpenChange(false);
    },
    onError: (error) => {
      const message = getLocalizedApiError(error, t, {
        apiErrors: tApiErrors,
        fallbackKey: "error",
      });
      setConfirmOpen(false);
      setErrorMessage(message);
      toast.error(message);
    },
  });
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) return;
    setBatchId("ALL");
    setSelectedBatchLabel(t("allBatches"));
    setBatchSearch("");
    setSearch("");
    setSelected(null);
    setConfirmOpen(false);
    setErrorMessage(null);
    resetMutation();
  }, [open, resetMutation, t]);

  const productName = product?.displayName || product?.name || "";
  const selectedCode = selected?.copyCode ?? selected?.maskedCode ?? "";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="w-[min(calc(100vw-2rem),42rem)] max-w-2xl"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <KeyRound className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold">
                {t(isReplacement ? "replaceTitle" : "title")}
              </DialogTitle>
              <DialogDescription className="mt-1 leading-6 text-sm font-medium text-gray-500">
                {t(isReplacement ? "replaceDescription" : "description", {
                  product: productName,
                })}
              </DialogDescription>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {currentCode ? (
              <div className="rounded-lg border border-slate-200  p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-medium uppercase text-slate-500">
                  {t("currentCode")}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className=" text-sm font-semibold">
                    {currentCode.code}
                  </span>
                  <ActivationCodeStatusBadge status={currentCode.status} />
                </div>
                {!currentCode.canReplace ? (
                  <p
                    className="mt-2 text-sm text-amber-700 dark:text-amber-300"
                    role="alert"
                  >
                    {t("replaceBlocked")}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="product-activation-code-batch">
                {t("batchLabel")}
              </Label>
              <SearchDropdown
                disabled={mutation.isPending || !canSubmit}
                emptyLabel={t("emptyBatches")}
                errorLabel={t("batchLoadError")}
                getItemKey={(batch) => batch.id}
                id="product-activation-code-batch"
                isError={batchesQuery.isError}
                isLoading={batchesQuery.isFetching}
                items={batchOptions}
                loadingLabel={
                  batchesQuery.isFetchingNextPage
                    ? t("loadingMoreBatches")
                    : t("loadingBatches")
                }
                onItemSelect={(batch) => {
                  setBatchId(batch.id);
                  setSelectedBatchLabel(
                    batch.id === "ALL"
                      ? t("allBatches")
                      : `${batch.batchName} · ${batch.batchCode}`,
                  );
                  setBatchSearch("");
                  setSearch("");
                  setSelected(null);
                  setErrorMessage(null);
                }}
                onReachEnd={() => {
                  if (
                    batchesQuery.hasNextPage &&
                    !batchesQuery.isFetchingNextPage
                  ) {
                    void batchesQuery.fetchNextPage();
                  }
                }}
                onRetry={() => void batchesQuery.refetch()}
                onSearchChange={(value) => {
                  if (batchId !== "ALL") {
                    setBatchId("ALL");
                    setSelectedBatchLabel(t("allBatches"));
                    setSearch("");
                    setSelected(null);
                  }
                  setBatchSearch(value);
                  setErrorMessage(null);
                }}
                placeholder={t("allBatches")}
                renderItem={(batch) =>
                  batch.id === "ALL" ? (
                    <div className="min-w-0">
                      <p className="font-medium">{t("allBatches")}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {t("allBatchesDescription")}
                      </p>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <p className="truncate font-medium">{batch.batchName}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {batch.batchCode}
                      </p>
                    </div>
                  )
                }
                retryLabel={t("tryAgain")}
                searchValue={batchSearch}
                selectedLabel={selectedBatchLabel ?? undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-activation-codes">
                {t(isReplacement ? "replacementCode" : "codes")}
              </Label>
              <SearchDropdown
                disabled={mutation.isPending || !canSubmit}
                emptyLabel={t("empty")}
                errorLabel={t("codesLoadError")}
                getItemKey={(code) => code.id}
                id="product-activation-codes"
                isError={codesQuery.isError}
                isLoading={codesQuery.isFetching}
                items={selectableCodes}
                loadingLabel={
                  codesQuery.isFetchingNextPage
                    ? t("loadingMore")
                    : t("loading")
                }
                onItemSelect={(code) => {
                  setSelected(code);
                  setSearch("");
                  setErrorMessage(null);
                }}
                onReachEnd={() => {
                  if (
                    codesQuery.hasNextPage &&
                    !codesQuery.isFetchingNextPage
                  ) {
                    void codesQuery.fetchNextPage();
                  }
                }}
                onRetry={() => void codesQuery.refetch()}
                onSearchChange={(value) => {
                  if (selected) setSelected(null);
                  setSearch(value);
                  setErrorMessage(null);
                }}
                placeholder={t("placeholder")}
                renderItem={(code) => (
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate font-medium">
                        {code.copyCode ?? code.maskedCode}
                      </p>
                      <ActivationCodeStatusBadge
                        className="shrink-0"
                        status={code.status}
                      />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {code.batchName || code.batchCode}
                    </p>
                  </div>
                )}
                retryLabel={t("tryAgain")}
                searchValue={search}
                selectedLabel={
                  selected
                    ? `${selected.copyCode ?? selected.maskedCode} · ${selected.batchName || selected.batchCode}`
                    : undefined
                }
              />

              {errorMessage ? (
                <p
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              disabled={mutation.isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="secondary"
            >
              {t("cancel")}
            </Button>
            <Button
              disabled={
                !product || !selected || mutation.isPending || !canSubmit
              }
              onClick={() =>
                isReplacement ? setConfirmOpen(true) : mutation.mutate()
              }
              type="button"
            >
              {mutation.isPending
                ? t(isReplacement ? "replacing" : "assigning")
                : t(isReplacement ? "replace" : "confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmActionDialog
        cancelLabel={t("cancel")}
        confirmLabel={t("replaceConfirm")}
        description={t("replaceConfirmDescription", {
          currentCode: currentCode?.code ?? "",
          replacementCode: selectedCode,
          product: productName,
        })}
        isLoading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        title={t("replaceConfirmTitle")}
      />
    </>
  );
}
