"use client";

import { ActivationCodeStatusBadge } from "@/src/components/activation-code-status-badge";
import { SearchDropdown } from "@/src/components/common/search-dropdown";
import { useToast } from "@/src/hooks/use-toast";
import { getLocalizedApiError } from "@/src/lib/localized-api-error.utils";
import type { AvailableActivationCode } from "@/src/services/activation-codes/activation-code-batches.types";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import { useDebounce } from "@repo/hooks";
import {
  type ActivationCodeProductAssignmentMode,
  MAX_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT,
  MAX_AUTOMATIC_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT,
  type ProductResponse,
} from "@repo/shared";
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Check, ChevronDown, KeyRound, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

export function AssignActivationCodesForm({
  active = true,
  onAssigned,
  onCancel,
  product,
}: {
  active?: boolean;
  onAssigned?: () => Promise<void> | void;
  onCancel?: () => void;
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
  const [assignmentMode, setAssignmentMode] =
    useState<ActivationCodeProductAssignmentMode>("SELECTED");
  const [quantity, setQuantity] = useState("1");
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<AvailableActivationCode[]>(
    [],
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currentCodes = useMemo(
    () => product?.assignedActivationCodes ?? [],
    [product?.assignedActivationCodes],
  );
  const assignedCodeCountByBatch = useMemo(
    () =>
      currentCodes.reduce<Record<string, number>>((counts, code) => {
        counts[code.batchCode] = (counts[code.batchCode] ?? 0) + 1;
        return counts;
      }, {}),
    [currentCodes],
  );
  const canSubmit = Boolean(product);
  const debouncedBatchSearch = useDebounce(batchSearch.trim(), 300);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const batchesQuery = useInfiniteQuery({
    enabled: active && canSubmit,
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
    enabled: active && canSubmit && assignmentMode === "SELECTED",
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
  const selectedCodeIds = useMemo(
    () => new Set(selectedCodes.map((code) => code.id)),
    [selectedCodes],
  );
  const parsedQuantity = Number(quantity);
  const hasValidQuantity =
    Number.isInteger(parsedQuantity) &&
    parsedQuantity >= 1 &&
    parsedQuantity <= MAX_AUTOMATIC_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT;
  const hasValidAssignment =
    assignmentMode === "SELECTED"
      ? selectedCodes.length > 0
      : assignmentMode === "ALL_AVAILABLE"
        ? batchId !== "ALL"
        : hasValidQuantity;
  const mutation = useMutation({
    mutationFn: () => {
      if (assignmentMode === "ALL_AVAILABLE") {
        return activationCodesService.assignProduct({
          assignmentMode,
          batchId,
          productId: product!.id,
        });
      }
      if (assignmentMode === "QUANTITY") {
        return activationCodesService.assignProduct({
          assignmentMode,
          ...(selectedBatchIds.length ? { batchIds: selectedBatchIds } : {}),
          productId: product!.id,
          quantity: parsedQuantity,
        });
      }
      return activationCodesService.assignProduct({
        activationCodeIds: selectedCodes.map((code) => code.id),
        assignmentMode: "SELECTED",
        productId: product!.id,
      });
    },
    onMutate: () => setErrorMessage(null),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["activation-code-detail"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({
          queryKey: ["activation-code-assignment-batches"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["activation-code-assignment-options"],
        }),
      ]);
      await onAssigned?.();
      setBatchId("ALL");
      setSelectedBatchLabel(t("allBatches"));
      setAssignmentMode("SELECTED");
      setQuantity("1");
      setSelectedBatchIds([]);
      setSearch("");
      setSelectedCodes([]);
      toast.success(t("success", { count: result.activationCodeIds.length }));
    },
    onError: (error) => {
      const message = getLocalizedApiError(error, t, {
        apiErrors: tApiErrors,
        fallbackKey: "error",
      });
      setErrorMessage(message);
      toast.error(message);
    },
  });
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!active) return;
    setBatchId("ALL");
    setSelectedBatchLabel(t("allBatches"));
    setBatchSearch("");
    setSearch("");
    setAssignmentMode("SELECTED");
    setQuantity("1");
    setSelectedBatchIds([]);
    setSelectedCodes([]);
    setErrorMessage(null);
    resetMutation();
  }, [active, resetMutation, t]);

  const productName = product?.displayName || product?.name || "";
  return (
    <>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <KeyRound className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{t("title")}</h2>
          <p className="mt-1 text-sm font-medium leading-6 text-gray-500">
            {t("description", { product: productName })}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {currentCodes.length > 0 ? (
          <div className="rounded-lg border border-slate-200  p-3 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  {t("currentCodes")}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {t("assignedCodesCount", { count: currentCodes.length })}
                </p>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="shrink-0"
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    {t("viewCurrentCodes")}
                    <ChevronDown className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-[calc(100vw-3rem)] max-w-md p-3 duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:data-[state=open]:slide-in-from-top-2 data-[side=bottom]:data-[state=closed]:slide-out-to-top-2 motion-reduce:animate-none"
                  collisionPadding={12}
                >
                  <p className="border-b border-slate-200 pb-2 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
                    {t("currentCodes")}
                  </p>
                  <div
                    className="mt-2 max-h-[min(12rem,40vh)] touch-pan-y space-y-2 overflow-y-auto overscroll-contain pr-1"
                    onWheel={(event) => event.stopPropagation()}
                  >
                    {currentCodes.map((currentCode) => (
                      <div
                        className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-700"
                        key={currentCode.id}
                      >
                        <span className="truncate font-semibold">
                          {currentCode.code}
                        </span>
                        <ActivationCodeStatusBadge
                          className="shrink-0"
                          status={currentCode.status}
                        />
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="product-activation-code-batch">
            {t("batchLabel")}
          </Label>
          <SearchDropdown
            closeOnSelect={assignmentMode !== "QUANTITY"}
            disabled={mutation.isPending || !canSubmit}
            emptyLabel={t("emptyBatches")}
            errorLabel={t("batchLoadError")}
            getItemDisabledReason={(batch) =>
              "assignableCount" in batch && batch.assignableCount === 0
                ? t("batchUnavailableReason")
                : null
            }
            getItemKey={(batch) => batch.id}
            id="product-activation-code-batch"
            isError={batchesQuery.isError}
            isItemSelected={(batch) =>
              assignmentMode === "QUANTITY" &&
              batch.id !== "ALL" &&
              selectedBatchIds.includes(batch.id)
            }
            isLoading={batchesQuery.isFetching}
            items={batchOptions}
            loadingLabel={
              batchesQuery.isFetchingNextPage
                ? t("loadingMoreBatches")
                : t("loadingBatches")
            }
            onItemSelect={(batch) => {
              if (assignmentMode === "QUANTITY") {
                setSelectedBatchIds((current) => {
                  if (batch.id === "ALL") return [];
                  return current.includes(batch.id)
                    ? current.filter((id) => id !== batch.id)
                    : [...current, batch.id];
                });
                setBatchSearch("");
                setErrorMessage(null);
                return;
              }
              setBatchId(batch.id);
              setSelectedBatchLabel(
                batch.id === "ALL"
                  ? t("allBatches")
                  : `${batch.batchName} · ${batch.batchCode}`,
              );
              setBatchSearch("");
              setSearch("");
              if (batch.id === "ALL") setAssignmentMode("SELECTED");
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
              if (assignmentMode !== "QUANTITY" && batchId !== "ALL") {
                setBatchId("ALL");
                setSelectedBatchLabel(t("allBatches"));
                setSearch("");
                setAssignmentMode("SELECTED");
              }
              setBatchSearch(value);
              setErrorMessage(null);
            }}
            placeholder={t("allBatches")}
            renderItem={(batch) =>
              !("assignableCount" in batch) ? (
                <div className="min-w-0">
                  <p className="font-medium">{t("allBatches")}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {t("allBatchesDescription")}
                  </p>
                </div>
              ) : (
                <div className="min-w-0">
                  <p className="truncate font-semibold">{batch.batchName}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {batch.batchCode}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge
                      variant={
                        batch.assignableCount > 0 ? "success" : "warning"
                      }
                    >
                      {t(
                        batch.assignableCount > 0
                          ? "batchAvailable"
                          : "batchUnavailable",
                      )}
                    </Badge>
                    <Badge variant="info">
                      {t("batchAssignedToProductCount", {
                        count: assignedCodeCountByBatch[batch.batchCode] ?? 0,
                      })}
                    </Badge>
                    <Badge variant="secondary">
                      {t("batchAssignableCount", {
                        count: batch.assignableCount,
                      })}
                    </Badge>
                  </div>
                </div>
              )
            }
            retryLabel={t("tryAgain")}
            searchValue={batchSearch}
            selectedLabel={
              assignmentMode === "QUANTITY"
                ? selectedBatchIds.length > 0
                  ? t("selectedBatchCount", { count: selectedBatchIds.length })
                  : t("allBatches")
                : (selectedBatchLabel ?? undefined)
            }
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <Checkbox
              checked={assignmentMode === "ALL_AVAILABLE"}
              disabled={mutation.isPending || !canSubmit || batchId === "ALL"}
              id="product-activation-code-all-mode"
              onCheckedChange={(checked) => {
                setAssignmentMode(
                  checked === true ? "ALL_AVAILABLE" : "SELECTED",
                );
                setSelectedCodes([]);
                setErrorMessage(null);
              }}
            />
            <div className="min-w-0">
              <Label
                className="cursor-pointer font-medium"
                htmlFor="product-activation-code-all-mode"
              >
                {t("allAvailableAssignment")}
              </Label>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t("allAvailableAssignmentDescription")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <Checkbox
              checked={assignmentMode === "QUANTITY"}
              disabled={mutation.isPending || !canSubmit}
              id="product-activation-code-quantity-mode"
              onCheckedChange={(checked) => {
                setAssignmentMode(checked === true ? "QUANTITY" : "SELECTED");
                setSelectedCodes([]);
                setErrorMessage(null);
              }}
            />
            <div className="min-w-0">
              <Label
                className="cursor-pointer font-medium"
                htmlFor="product-activation-code-quantity-mode"
              >
                {t("quantityAssignment")}
              </Label>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t("quantityAssignmentDescription")}
              </p>
            </div>
          </div>
        </div>

        {assignmentMode === "QUANTITY" ? (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <Label htmlFor="product-activation-code-quantity">
              {t("quantity")}
            </Label>
            <Input
              disabled={mutation.isPending}
              id="product-activation-code-quantity"
              max={MAX_AUTOMATIC_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT}
              min={1}
              onChange={(event) => setQuantity(event.target.value)}
              type="number"
              value={quantity}
            />
            {!hasValidQuantity ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {t("quantityInvalid")}
              </p>
            ) : null}
          </div>
        ) : null}

        {assignmentMode === "ALL_AVAILABLE" ? (
          <div className="space-y-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 font-semibold dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
              {batchId === "ALL"
                ? t("automaticModeRequiresBatch")
                : t("allAvailableNotice", { product: productName })}
            </div>
            {errorMessage ? (
              <p
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}
          </div>
        ) : assignmentMode === "SELECTED" ? (
          <div className="space-y-2">
            <Label htmlFor="product-activation-codes">{t("codes")}</Label>
            <SearchDropdown
              closeOnSelect={false}
              disabled={mutation.isPending || !canSubmit}
              emptyLabel={t("empty")}
              errorLabel={t("codesLoadError")}
              getItemKey={(code) => code.id}
              getItemDisabledReason={(code) =>
                selectedCodes.length >=
                  MAX_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT &&
                !selectedCodeIds.has(code.id)
                  ? t("selectionLimit", {
                      count: MAX_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT,
                    })
                  : null
              }
              id="product-activation-codes"
              isError={codesQuery.isError}
              isItemSelected={(code) => selectedCodeIds.has(code.id)}
              isLoading={codesQuery.isFetching}
              items={selectableCodes}
              loadingLabel={
                codesQuery.isFetchingNextPage ? t("loadingMore") : t("loading")
              }
              onItemSelect={(code) => {
                setSelectedCodes((current) =>
                  current.some((item) => item.id === code.id)
                    ? current.filter((item) => item.id !== code.id)
                    : [...current, code],
                );
                setErrorMessage(null);
              }}
              onReachEnd={() => {
                if (codesQuery.hasNextPage && !codesQuery.isFetchingNextPage) {
                  void codesQuery.fetchNextPage();
                }
              }}
              onRetry={() => void codesQuery.refetch()}
              onSearchChange={(value) => {
                setSearch(value);
                setErrorMessage(null);
              }}
              placeholder={t("placeholder")}
              renderItem={(code) => (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                      selectedCodeIds.has(code.id)
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
                    }`}
                  >
                    {selectedCodeIds.has(code.id) ? (
                      <Check className="size-3.5" />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
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
                      {t("codeBatch", {
                        batch: code.batchName || code.batchCode,
                      })}
                    </p>
                  </div>
                </div>
              )}
              retryLabel={t("tryAgain")}
              searchValue={search}
            />

            {selectedCodes.length > 0 ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    {t("selectedCount", {
                      count: selectedCodes.length,
                      limit: MAX_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT,
                    })}
                  </p>
                  <Button
                    className="h-8 px-2 text-xs"
                    disabled={mutation.isPending}
                    onClick={() => setSelectedCodes([])}
                    type="button"
                    variant="ghost"
                  >
                    {t("clearSelection")}
                  </Button>
                </div>
                <div className="mt-2 max-h-36 space-y-1 overflow-y-auto pr-1">
                  {selectedCodes.map((code) => (
                    <div
                      className="flex min-h-10 items-center justify-between gap-3 rounded-md bg-white px-3 py-1.5 text-sm shadow-sm dark:bg-slate-900"
                      key={code.id}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {code.copyCode ?? code.maskedCode}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {t("codeBatch", {
                            batch: code.batchName || code.batchCode,
                          })}
                        </p>
                      </div>
                      <Button
                        aria-label={t("remove", {
                          code: code.copyCode ?? code.maskedCode,
                        })}
                        className="size-8 shrink-0 p-0"
                        disabled={mutation.isPending}
                        onClick={() =>
                          setSelectedCodes((current) =>
                            current.filter((item) => item.id !== code.id),
                          )
                        }
                        type="button"
                        variant="ghost"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("selectionHint")}
              </p>
            )}

            {errorMessage ? (
              <p
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}
          </div>
        ) : errorMessage ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            disabled={mutation.isPending}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            {t("cancel")}
          </Button>
        ) : null}
        <Button
          disabled={
            !product || !hasValidAssignment || mutation.isPending || !canSubmit
          }
          onClick={() => mutation.mutate()}
          type="button"
        >
          {mutation.isPending
            ? t("assigning")
            : assignmentMode === "SELECTED"
              ? t("confirm", { count: selectedCodes.length })
              : t("confirmAutomatic")}
        </Button>
      </div>
    </>
  );
}
