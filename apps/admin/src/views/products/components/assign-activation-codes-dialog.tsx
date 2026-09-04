"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxLoading,
  ComboboxTrigger,
} from "@/src/components/common/combobox";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";
import type { AvailableActivationCode } from "@/src/services/activation-codes/activation-code-batches.types";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import { useToast } from "@/src/hooks/use-toast";
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
import { ProductActivationCodeStatusBadge } from "./product-activation-code-status-badge";

export function AssignActivationCodesDialog({
  onOpenChange,
  open,
  product,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product: ProductResponse | null;
}) {
  const t = useTranslations("ProductActivationCodeAssignment");
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AvailableActivationCode | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const currentCode = product?.assignedActivationCode ?? null;
  const isReplacement = currentCode !== null;
  const canSubmit = !isReplacement || currentCode.canReplace;
  const debouncedSearch = useDebounce(search.trim(), 300);
  const codesQuery = useInfiniteQuery({
    enabled: open && canSubmit,
    queryKey: ["activation-code-assignment-options", debouncedSearch],
    queryFn: ({ pageParam }) =>
      activationCodesService.listAvailableByProduct(undefined, {
        assignment: "UNASSIGNED",
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["activation-code-detail"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({
          queryKey: ["activation-code-assignment-options"],
        }),
      ]);
      toast.success(t(isReplacement ? "replaceSuccess" : "success"));
      setConfirmOpen(false);
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t("error"));
    },
  });
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelected(null);
    setConfirmOpen(false);
    resetMutation();
  }, [open, resetMutation]);

  const productName = product?.displayName || product?.name || "";
  const selectedCode = selected?.copyCode ?? selected?.maskedCode ?? "";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
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
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-medium uppercase text-slate-500">
                  {t("currentCode")}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold">
                    {currentCode.code}
                  </span>
                  <ProductActivationCodeStatusBadge
                    status={currentCode.status}
                  />
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
              <Label htmlFor="product-activation-codes">
                {t(isReplacement ? "replacementCode" : "codes")}
              </Label>
              <Combobox
                disabled={mutation.isPending || !canSubmit}
                onValueChange={(id) => {
                  const code = codes.find((item) => item.id === id);
                  if (code) setSelected(code);
                }}
                shouldFilter={false}
                value=""
              >
                <ComboboxTrigger
                  id="product-activation-codes"
                  loading={codesQuery.isLoading}
                  loadingLabel={t("loading")}
                  placeholder={t("placeholder")}
                />
                <ComboboxContent>
                  <ComboboxInput
                    onValueChange={setSearch}
                    placeholder={t("searchPlaceholder")}
                    value={search}
                  />
                  <ComboboxList
                    onReachEnd={() => {
                      if (
                        codesQuery.hasNextPage &&
                        !codesQuery.isFetchingNextPage
                      ) {
                        void codesQuery.fetchNextPage();
                      }
                    }}
                  >
                    {codes
                      .filter((code) => code.selectable)
                      .map((code) => (
                        <ComboboxItem key={code.id} value={code.id}>
                          {code.copyCode ?? code.maskedCode} · {code.batchCode}
                        </ComboboxItem>
                      ))}
                    {codesQuery.isFetchingNextPage ? (
                      <ComboboxLoading label={t("loadingMore")} />
                    ) : null}
                    {!codesQuery.isLoading && codes.length === 0 ? (
                      <ComboboxEmpty>{t("empty")}</ComboboxEmpty>
                    ) : null}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              {selected ? (
                <div className="space-y-2 rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="text-sm">
                    <p className="truncate font-mono font-medium">
                      {selected.copyCode ?? selected.maskedCode}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {selected.assignedProduct
                        ? t("currentlyAssigned", {
                            product:
                              selected.assignedProduct.displayName ||
                              selected.assignedProduct.name,
                          })
                        : selected.batchCode}
                    </p>
                  </div>
                </div>
              ) : null}
              {mutation.isError ? (
                <p
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {t("error")}
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
