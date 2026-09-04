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
import { useInfiniteProducts } from "@/src/views/products/hooks/use-products";
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import { useDebounce } from "@repo/hooks";
import type {
  ActivationCodeAssignedProduct,
  ProductResponse,
} from "@repo/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Label,
} from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { PackageCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  activationCodeId: string;
  currentProduct?: ActivationCodeAssignedProduct | null;
  onAssigned: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function ActivationCodeProductAssignmentDialog({
  activationCodeId,
  currentProduct,
  onAssigned,
  onOpenChange,
  open,
}: Props) {
  const t = useTranslations("ActivationCodeAssignment");
  const [productId, setProductId] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const productsQuery = useInfiniteProducts(
    {
      limit: 20,
      search: debouncedSearch || undefined,
      status: "ACTIVE",
    },
    { enabled: open },
  );
  const products = useMemo(
    () => productsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [productsQuery.data],
  );
  const selectedProduct =
    products.find((product) => product.id === productId) ??
    (currentProduct?.id === productId ? currentProduct : null);
  const mutation = useMutation({
    mutationFn: () =>
      activationCodesService.assignProduct({ activationCodeId, productId }),
    onSuccess: () => {
      onAssigned();
      onOpenChange(false);
    },
  });
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) return;
    setProductId(currentProduct?.id ?? "");
    setSearch("");
    resetMutation();
  }, [currentProduct?.id, open, resetMutation]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <PackageCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription className="mt-1 leading-6">
              {t("description")}
            </DialogDescription>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Label htmlFor="activation-code-product">{t("product")}</Label>
          <Combobox
            disabled={mutation.isPending}
            onValueChange={setProductId}
            shouldFilter={false}
            value={productId}
          >
            <ComboboxTrigger
              id="activation-code-product"
              loading={productsQuery.isLoading}
              loadingLabel={t("loadingProducts")}
              placeholder={t("productPlaceholder")}
              selectedLabel={
                selectedProduct ? getProductLabel(selectedProduct) : undefined
              }
            />
            <ComboboxContent>
              <ComboboxInput
                onValueChange={setSearch}
                placeholder={t("productSearchPlaceholder")}
                value={search}
              />
              <ComboboxList
                onReachEnd={() => {
                  if (
                    productsQuery.hasNextPage &&
                    !productsQuery.isFetchingNextPage
                  ) {
                    void productsQuery.fetchNextPage();
                  }
                }}
              >
                {products.map((product) => (
                  <ComboboxItem
                    key={product.id}
                    keywords={[product.productCode, product.serialNumber ?? ""]}
                    value={product.id}
                  >
                    {getProductLabel(product)}
                  </ComboboxItem>
                ))}
                {productsQuery.isFetchingNextPage ? (
                  <ComboboxLoading label={t("loadingMoreProducts")} />
                ) : null}
                {!productsQuery.isLoading && products.length === 0 ? (
                  <ComboboxEmpty>{t("noProducts")}</ComboboxEmpty>
                ) : null}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
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
            disabled={!productId || !activationCodeId || mutation.isPending}
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

function getProductLabel(
  product: ProductResponse | ActivationCodeAssignedProduct,
) {
  return `${product.displayName || product.name} · ${product.productCode}`;
}
