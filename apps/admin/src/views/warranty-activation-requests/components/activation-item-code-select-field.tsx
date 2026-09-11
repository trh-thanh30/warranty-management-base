"use client";

import { ActivationCodeStatusBadge } from "@/src/components/activation-code-status-badge";
import { SearchDropdown } from "@/src/components/common";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import type { AvailableActivationCode } from "@/src/services/activation-codes/activation-code-batches.types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { ActivationCodeBatchSelectField } from "./activation-code-batch-select-field";

type ActivationItemCodeSelectFieldProps = {
  id: string;
  onClear: () => void;
  onSelect: (code: AvailableActivationCode) => void;
  productId: string;
  selectedCode?: AvailableActivationCode;
};

export function ActivationItemCodeSelectField({
  id,
  onClear,
  onSelect,
  productId,
  selectedCode,
}: ActivationItemCodeSelectFieldProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const [search, setSearch] = useState("");
  const [batchId, setBatchId] = useState("ALL");
  useEffect(() => {
    setBatchId("ALL");
    setSearch("");
  }, [productId]);
  const query = useInfiniteQuery({
    queryKey: [
      "available-activation-codes",
      "edit-item",
      productId,
      batchId,
      search,
    ],
    queryFn: ({ pageParam }) =>
      activationCodesService.listAvailableByProduct(productId, {
        assignment: "ASSIGNED",
        batchId: batchId === "ALL" ? undefined : batchId,
        limit: 10,
        page: pageParam,
        search: search.trim() || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
  const codes = useMemo(
    () =>
      Array.from(
        new Map(
          [
            ...(query.data?.pages.flatMap((page) => page.items) ?? []),
            // Keep the current request's PENDING_APPROVAL code selectable.
            // It intentionally overrides the unavailable copy version returned
            // by the general availability endpoint.
            ...(selectedCode ? [selectedCode] : []),
          ].map((code) => [code.id, code]),
        ).values(),
      ),
    [query.data?.pages, selectedCode],
  );

  return (
    <div className="space-y-2">
      <ActivationCodeBatchSelectField
        id={`${id}-batch`}
        onChange={(nextBatchId) => {
          setBatchId(nextBatchId);
          setSearch("");
          onClear();
        }}
        productId={productId}
        value={batchId}
      />
      <SearchDropdown
        emptyLabel={t("noAvailableActivationCodes")}
        errorLabel={t("activationCodesLoadError")}
        getItemDisabledReason={(code) => (code.selectable ? null : code.status)}
        getItemKey={(code) => code.id}
        id={id}
        isError={query.isError}
        isLoading={query.isFetching}
        items={codes}
        loadingLabel={t("loadingActivationCodes")}
        onItemSelect={(code) => {
          onSelect(code);
          setSearch("");
        }}
        onReachEnd={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            void query.fetchNextPage();
          }
        }}
        onRetry={() => void query.refetch()}
        onSearchChange={(value) => {
          if (!value && selectedCode) onClear();
          setSearch(value);
        }}
        placeholder={t("activationCodeOptionalPlaceholder")}
        renderItem={(code) => (
          <div className="flex w-full min-w-0 items-center justify-between gap-3">
            <span className="truncate font-medium">{code.maskedCode}</span>
            <ActivationCodeStatusBadge status={code.status} />
          </div>
        )}
        retryLabel={t("tryAgain")}
        searchValue={search}
        selectedLabel={selectedCode?.maskedCode}
      />
    </div>
  );
}
