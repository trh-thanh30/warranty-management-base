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
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import type { AvailableActivationCode } from "@/src/services/activation-codes/activation-code-batches.types";
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
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AvailableActivationCode | null>(
    null,
  );
  const debouncedSearch = useDebounce(search.trim(), 300);
  const codesQuery = useInfiniteQuery({
    enabled: open,
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
    mutationFn: () =>
      activationCodesService.assignProduct({
        activationCodeId: selected!.id,
        productId: product!.id,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["activation-code-detail"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
      ]);
      onOpenChange(false);
    },
  });
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelected(null);
    resetMutation();
  }, [open, resetMutation]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <KeyRound className="size-5" />
          </div>
          <div className="min-w-0">
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription className="mt-1 leading-6">
              {t("description", {
                product: product?.displayName || product?.name || "",
              })}
            </DialogDescription>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Label htmlFor="product-activation-codes">{t("codes")}</Label>
          <Combobox
            disabled={mutation.isPending}
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
                      {code.maskedCode} · {code.batchCode}
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
                  {selected.maskedCode}
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
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {t("error")}
            </p>
          ) : null}
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
            disabled={!product || !selected || mutation.isPending}
            onClick={() => mutation.mutate()}
            type="button"
          >
            {mutation.isPending ? t("assigning") : t("confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
