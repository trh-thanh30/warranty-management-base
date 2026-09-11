"use client";

import type { CategoryResponse, ProductResponse } from "@repo/shared";
import { Button } from "@repo/ui";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { SearchDropdown } from "@/src/components/common/search-dropdown";
import { SelectControl } from "@/src/components/common/select-control";
import { formatProductSearchOption } from "@/src/utils";

type WarrantyClaimWarrantyFiltersProps = {
  categories: CategoryResponse[];
  categoryId: string;
  categoriesLoading: boolean;
  onCategoryChange: (categoryId: string) => void;
  onClearFilters: () => void;
  onClearProduct: () => void;
  onProductSearchChange: (value: string) => void;
  onProductSelect: (product: ProductResponse) => void;
  onProductsReachEnd: () => void;
  productSearch: string;
  products: ProductResponse[];
  productsError: boolean;
  productsLoading: boolean;
  selectedProduct: ProductResponse | null;
};

export function WarrantyClaimWarrantyFilters({
  categories,
  categoryId,
  categoriesLoading,
  onCategoryChange,
  onClearFilters,
  onClearProduct,
  onProductSearchChange,
  onProductSelect,
  onProductsReachEnd,
  productSearch,
  products,
  productsError,
  productsLoading,
  selectedProduct,
}: WarrantyClaimWarrantyFiltersProps) {
  const t = useTranslations("WarrantyClaims");
  const hasFilters = Boolean(categoryId || selectedProduct);

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
            {t("optionalFilters")}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t("optionalFiltersDescription")}
          </p>
        </div>
        {hasFilters ? (
          <Button
            className="h-9 shrink-0 gap-1.5 px-2.5"
            onClick={onClearFilters}
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-4" />
            {t("clearFilters")}
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="create-warranty-claim-category-filter"
          >
            {t("categoryFilter")}
          </label>
          <SelectControl
            ariaLabel={t("categoryFilter")}
            disabled={categoriesLoading}
            id="create-warranty-claim-category-filter"
            onValueChange={onCategoryChange}
            options={[
              { label: t("allCategories"), value: "" },
              ...categories.map((category) => ({
                label: category.name,
                value: category.id,
              })),
            ]}
            value={categoryId}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="create-warranty-claim-product-filter"
          >
            {t("productFilter")}
          </label>
          <SearchDropdown
            emptyLabel={t("noFilterProduct")}
            errorLabel={t("productFilterLoadError")}
            getItemKey={(product) => product.id}
            id="create-warranty-claim-product-filter"
            isError={productsError}
            isLoading={productsLoading}
            items={products}
            loadingLabel={t("loadingProducts")}
            onItemSelect={onProductSelect}
            onReachEnd={onProductsReachEnd}
            onSearchChange={(value) => {
              if (selectedProduct) onClearProduct();
              onProductSearchChange(value);
            }}
            placeholder={t("productFilterPlaceholder")}
            renderItem={(product) => (
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {product.displayName ?? product.name}
                </span>
                <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">
                  {product.productCode}
                </span>
              </span>
            )}
            searchValue={productSearch}
            selectedLabel={
              selectedProduct
                ? formatProductSearchOption(selectedProduct)
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
