"use client";

import { SearchDropdown } from "@/src/components/common";
import { useDebounce } from "@repo/hooks";
import type { ProductResponse } from "@repo/shared";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useInfiniteProducts } from "../../products/hooks/use-products";
import {
  getProductSelectDisabledReason,
  getProductWarrantyStatusLabel,
} from "../warranty-activation-request-product.utils";
import { ProductSearchResult } from "./product-search-result";

type ActivationProductSelectFieldProps = {
  categoryId: string;
  id: string;
  onClear: () => void;
  onSelect: (product: ProductResponse) => void;
  selectedProduct?: ProductResponse;
  unavailableProductIds: Set<string>;
};

export function ActivationProductSelectField({
  categoryId,
  id,
  onClear,
  onSelect,
  selectedProduct,
  unavailableProductIds,
}: ActivationProductSelectFieldProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const productsQuery = useInfiniteProducts(
    {
      activationEligible: "true",
      categoryId,
      limit: 20,
      search: debouncedSearch || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
      status: "ACTIVE",
    },
    { enabled: Boolean(categoryId) },
  );
  const products = useMemo(
    () =>
      Array.from(
        new Map(
          (productsQuery.data?.pages ?? [])
            .flatMap((page) => page.items)
            .map((product) => [product.id, product]),
        ).values(),
      ),
    [productsQuery.data?.pages],
  );

  function getDisabledReason(product: ProductResponse) {
    if (unavailableProductIds.has(product.id)) {
      return t("activationProductAlreadySelected");
    }
    return getProductSelectDisabledReason(product, t);
  }

  return (
    <div className="space-y-2">
      <SearchDropdown
        emptyLabel={t("noEligibleProduct")}
        errorLabel={t("productLoadError")}
        getItemDisabledReason={getDisabledReason}
        getItemKey={(product) => product.id}
        id={id}
        isError={productsQuery.isError}
        isLoading={productsQuery.isFetching}
        items={products}
        loadingLabel={
          productsQuery.isFetchingNextPage
            ? t("loadingMoreProducts")
            : t("loadingEligibleProducts")
        }
        onItemSelect={(product) => {
          onSelect(product);
          setSearch("");
        }}
        onReachEnd={() => {
          if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
            void productsQuery.fetchNextPage();
          }
        }}
        onRetry={() => void productsQuery.refetch()}
        onSearchChange={(value) => {
          if (selectedProduct) onClear();
          setSearch(value);
        }}
        placeholder={t("activationProductPlaceholder")}
        renderItem={(product) => (
          <ProductSearchResult
            disabledReason={getDisabledReason(product)}
            ownerName={product.owner?.fullName}
            productCode={product.productCode}
            productName={product.name}
            serialNumber={product.serialNumber}
            statusLabel={getProductWarrantyStatusLabel(product, t)}
            warrantyCode={product.warrantyCode}
          />
        )}
        retryLabel={t("tryAgain")}
        searchValue={search}
        selectedLabel={
          selectedProduct
            ? [
                selectedProduct.name,
                selectedProduct.productCode,
                selectedProduct.warrantyCode,
              ]
                .filter(Boolean)
                .join(" · ")
            : undefined
        }
      />
      {selectedProduct ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">
            {selectedProduct.name}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
            {[
              selectedProduct.productCode,
              selectedProduct.serialNumber,
              selectedProduct.warrantyCode,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
