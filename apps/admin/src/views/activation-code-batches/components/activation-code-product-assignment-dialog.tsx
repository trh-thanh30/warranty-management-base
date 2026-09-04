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
import { activationCodesService } from "@/src/services/activation-codes/activation-codes.service";
import { useInfiniteProducts } from "@/src/views/products/hooks/use-products";
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
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type Props = {
  activationCode: string;
  activationCodeId: string;
  currentProduct?: ActivationCodeAssignedProduct | null;
  onAssigned: (mode: "assigned" | "changed") => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function ActivationCodeProductAssignmentDialog({
  activationCode,
  activationCodeId,
  currentProduct,
  onAssigned,
  onOpenChange,
  open,
}: Props) {
  const t = useTranslations("ActivationCodeAssignment");
  const [productId, setProductId] = useState("");
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
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
  const isChangingProduct = Boolean(
    currentProduct && productId && productId !== currentProduct.id,
  );
  const mutation = useMutation({
    mutationFn: () =>
      activationCodesService.assignProduct({ activationCodeId, productId }),
    onSuccess: () => {
      onAssigned(currentProduct ? "changed" : "assigned");
      setConfirmOpen(false);
      onOpenChange(false);
    },
  });
  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) return;
    setProductId(currentProduct?.id ?? "");
    setSearch("");
    setConfirmOpen(false);
    resetMutation();
  }, [currentProduct?.id, open, resetMutation]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <PackageCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold">
                {t(currentProduct ? "changeTitle" : "title")}
              </DialogTitle>
              <DialogDescription className="mt-1 leading-6 text-sm font-medium text-gray-500">
                {t(currentProduct ? "changeDescription" : "description")}
              </DialogDescription>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {currentProduct ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-medium uppercase text-slate-500">
                  {t("currentProduct")}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {getProductLabel(currentProduct)}
                </p>
              </div>
            ) : null}
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
                      keywords={[
                        product.productCode,
                        product.serialNumber ?? "",
                      ]}
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
              <p
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
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
              disabled={
                !productId ||
                !activationCodeId ||
                mutation.isPending ||
                productId === currentProduct?.id
              }
              onClick={() =>
                isChangingProduct ? setConfirmOpen(true) : mutation.mutate()
              }
              type="button"
            >
              {mutation.isPending
                ? t(currentProduct ? "changing" : "assigning")
                : t(currentProduct ? "changeConfirm" : "confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmActionDialog
        cancelLabel={t("cancel")}
        confirmLabel={t("changeConfirm")}
        description={t("changeConfirmDescription", {
          activationCode,
          currentProduct: currentProduct ? getProductLabel(currentProduct) : "",
          replacementProduct: selectedProduct
            ? getProductLabel(selectedProduct)
            : "",
        })}
        isLoading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        title={t("changeConfirmTitle")}
      />
    </>
  );
}

function getProductLabel(
  product: ProductResponse | ActivationCodeAssignedProduct,
) {
  return `${product.displayName || product.name} · ${product.productCode}`;
}
