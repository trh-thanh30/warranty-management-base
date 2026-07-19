"use client";

import { PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { ProductResponse, ProductStatus } from "@repo/shared";
import { HttpClientError } from "@repo/shared";
import { PERMISSIONS, type PermissionKey } from "@repo/shared/constants";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useToast } from "@/src/hooks/use-toast";
import { productsService } from "@/src/services/products/products.service";
import {
  ProductFormCard,
  ProductFormSkeleton,
} from "./components/product-form-card";
import { useProductDetail } from "./hooks/use-product-detail";
import { useProductFormWorkflow } from "./hooks/use-product-form-workflow";
import { productKeys } from "./hooks/use-products";

type ProductFormViewProps =
  | {
      mode: "create";
      productId?: never;
    }
  | {
      mode: "edit";
      productId: string;
    };

export function ProductFormView({ mode, productId }: ProductFormViewProps) {
  const t = useTranslations("Products");
  const workflow = useProductFormWorkflow();
  const isEditing = mode === "edit";
  const { product, productQuery } = useProductDetail(
    isEditing ? { mode: "edit", productId } : { mode: "create" },
  );
  const requiredPermission: PermissionKey = isEditing
    ? PERMISSIONS.PRODUCT_UPDATE
    : PERMISSIONS.PRODUCT_CREATE;
  const title = isEditing ? t("editTitle") : t("createTitle");
  const description = isEditing ? t("editDescription") : t("createDescription");

  return (
    <PermissionGuard permissions={[requiredPermission]}>
      <FormPageShell
        backHref="/products"
        backLabel={t("backToDirectory")}
        description={description}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={title}
        descriptionAccessory={
          isEditing && product ? (
            <ProductStatusHeaderSelect product={product} />
          ) : null
        }
      >
        {isEditing && productQuery.isLoading ? (
          <ProductFormSkeleton description={description} title={title} />
        ) : isEditing && (productQuery.isError || !product) ? (
          <StatePanel
            action={
              <Button
                onClick={() => {
                  void productQuery.refetch();
                }}
                variant="secondary"
              >
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={PackageSearch}
            title={t("loadErrorTitle")}
          />
        ) : (
          <ProductFormCard
            description={description}
            onCancel={workflow.goBackToDirectory}
            onSaved={workflow.handleSaved}
            product={product}
            title={title}
          />
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}

function ProductStatusHeaderSelect({ product }: { product: ProductResponse }) {
  const t = useTranslations("Products");
  const toast = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ProductEditableStatus>(
    toEditableStatus(product.status),
  );
  const updateStatus = useMutation({
    mutationFn: (nextStatus: ProductEditableStatus) =>
      productsService.updateProduct(product.id, { status: nextStatus }),
    onError: (error) => {
      setStatus(toEditableStatus(product.status));
      const message =
        error instanceof HttpClientError
          ? error.message
          : t("statusUpdateError");
      toast.error(message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success(t("statusUpdated"));
    },
  });

  useEffect(() => {
    setStatus(toEditableStatus(product.status));
  }, [product.id, product.status]);

  return (
    <div className="w-full sm:w-56">
      <label className="sr-only" htmlFor="product-header-status">
        {t("productStatus")}
      </label>
      <Select
        disabled={updateStatus.isPending}
        onValueChange={(value) => {
          const nextStatus = value as ProductEditableStatus;
          if (nextStatus === status) return;

          setStatus(nextStatus);
          updateStatus.mutate(nextStatus);
        }}
        value={status}
      >
        <SelectTrigger
          aria-label={t("productStatus")}
          className="font-medium disabled:opacity-60"
          id="product-header-status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ACTIVE">{t("statuses.ACTIVE")}</SelectItem>
          <SelectItem value="INACTIVE">{t("statuses.INACTIVE")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

type ProductEditableStatus = Extract<ProductStatus, "ACTIVE" | "INACTIVE">;

function toEditableStatus(status: ProductStatus): ProductEditableStatus {
  return status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}
