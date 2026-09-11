"use client";

import { SearchDropdown } from "@/src/components/common";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import type { ActivationCodeBatchListItem } from "@/src/services/activation-codes/activation-code-batches.types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const ALL_BATCHES = "ALL";

type ActivationCodeBatchSelectFieldProps = {
  disabled?: boolean;
  id: string;
  onChange: (batchId: string) => void;
  productId?: string;
  value: string;
};

type BatchOption =
  | ActivationCodeBatchListItem
  | {
      id: typeof ALL_BATCHES;
      batchCode: string;
      batchName: string;
    };

export function ActivationCodeBatchSelectField({
  disabled = false,
  id,
  onChange,
  productId,
  value,
}: ActivationCodeBatchSelectFieldProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(
    t("allActivationCodeBatches"),
  );
  const debouncedSearch = search.trim();
  const query = useInfiniteQuery({
    enabled: Boolean(productId),
    queryKey: ["activation-request-code-batches", productId, debouncedSearch],
    queryFn: ({ pageParam }) =>
      activationCodesService.listBatches({
        limit: 20,
        page: pageParam,
        search: debouncedSearch || undefined,
        status: "AVAILABLE",
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
  const batches = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data?.pages],
  );
  const items = useMemo<BatchOption[]>(() => {
    const allBatchesOption: BatchOption = {
      id: ALL_BATCHES,
      batchCode: "",
      batchName: t("allActivationCodeBatches"),
    };
    return [...(search.trim() ? [] : [allBatchesOption]), ...batches];
  }, [batches, search, t]);

  useEffect(() => {
    if (value === ALL_BATCHES) setSelectedLabel(t("allActivationCodeBatches"));
  }, [t, value]);

  return (
    <SearchDropdown
      disabled={disabled || !productId}
      emptyLabel={t("noActivationCodeBatches")}
      errorLabel={t("activationCodeBatchesLoadError")}
      getItemKey={(batch) => batch.id}
      id={id}
      isLoading={query.isFetching}
      isError={query.isError}
      items={items}
      loadingLabel={t("loadingActivationCodeBatches")}
      onItemSelect={(batch) => {
        onChange(batch.id);
        setSelectedLabel(
          batch.id === ALL_BATCHES
            ? t("allActivationCodeBatches")
            : `${batch.batchName} · ${batch.batchCode}`,
        );
        setSearch("");
      }}
      onReachEnd={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) {
          void query.fetchNextPage();
        }
      }}
      onRetry={() => void query.refetch()}
      onSearchChange={setSearch}
      placeholder={t("searchActivationCodeBatches")}
      renderItem={(batch) =>
        batch.id === ALL_BATCHES ? (
          <div className="min-w-0">
            <p className="font-medium">{t("allActivationCodeBatches")}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t("allActivationCodeBatchesDescription")}
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
      searchValue={search}
      selectedLabel={selectedLabel}
    />
  );
}
