"use client";

import { SearchDropdown } from "@/src/components/common";
import { useDebounce } from "@repo/hooks";
import type { ActivationProductOption, ProductResponse } from "@repo/shared";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useInfiniteActivationProductOptions } from "../../products/hooks/use-products";
import {
  getActivationProductOptionDisabledReason,
  getActivationProductDisplayName,
  isVisibleActivationProductOption,
} from "../warranty-activation-request-product.utils";
import { ProductSearchResult } from "./product-search-result";

type ActivationProductSelectFieldProps = {
  categoryId: string;
  id: string;
  onClear: () => void;
  onSelect: (product: ProductResponse) => void;
  selectedProduct?: ProductResponse;
};

export function ActivationProductSelectField({
  categoryId,
  id,
  onClear,
  onSelect,
  selectedProduct,
}: ActivationProductSelectFieldProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const productsQuery = useInfiniteActivationProductOptions(
    {
      categoryId,
      limit: 20,
      search: debouncedSearch || undefined,
    },
    { enabled: Boolean(categoryId) },
  );
  const products = useMemo(
    () =>
      Array.from(
        new Map(
          (productsQuery.data?.pages ?? [])
            .flatMap((page) => page.items)
            .filter(isVisibleActivationProductOption)
            .map((product) => [product.id, product]),
        ).values(),
      ),
    [productsQuery.data?.pages],
  );

  function getDisabledReason(product: ActivationProductOption) {
    return getActivationProductOptionDisabledReason(product, t);
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
            productCode={product.productCode}
            productName={getActivationProductDisplayName(product)}
          />
        )}
        retryLabel={t("tryAgain")}
        searchValue={search}
        selectedLabel={
          selectedProduct
            ? [
                getActivationProductDisplayName(selectedProduct),
                selectedProduct.productCode,
              ]
                .filter(Boolean)
                .join(" · ")
            : undefined
        }
      />
      {selectedProduct ? (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
          <p
            className="line-clamp-2 whitespace-normal break-words text-sm font-medium text-slate-950 dark:text-slate-50"
            title={getActivationProductDisplayName(selectedProduct)}
          >
            {getActivationProductDisplayName(selectedProduct)}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
            {selectedProduct.productCode}
          </p>
        </div>
      ) : null}
    </div>
  );
}
