"use client";

import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { PERMISSIONS, type PermissionKey } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import {
  ProductFormCard,
  ProductFormSkeleton,
} from "./components/product-form-card";
import { useProductDetail } from "./hooks/use-product-detail";
import { useProductFormWorkflow } from "./hooks/use-product-form-workflow";
type ProductFormViewProps =
  | {
      mode: "create";
      productId?: string;
    }
  | {
      mode: "edit";
      productId: string;
    };

export function ProductFormView({ mode, productId }: ProductFormViewProps) {
  const t = useTranslations("Products");
  const searchParams = useSearchParams();
  const workflow = useProductFormWorkflow();
  const cloneFrom =
    mode === "create" ? (productId ?? searchParams.get("cloneFrom")) : null;
  const isEditing = mode === "edit";
  const isCloning = mode === "create" && Boolean(cloneFrom);
  const { product, productQuery } = useProductDetail(
    isEditing
      ? { mode: "edit", productId }
      : isCloning
        ? { mode: "detail", productId: cloneFrom! }
        : { mode: "create" },
  );
  const requiredPermission: PermissionKey = isEditing
    ? PERMISSIONS.PRODUCT_UPDATE
    : PERMISSIONS.PRODUCT_CREATE;
  const title = isEditing
    ? t("editTitle")
    : isCloning
      ? t("cloneTitle")
      : t("createTitle");
  const description = isEditing
    ? t("editDescription")
    : isCloning
      ? t("cloneDescription")
      : t("createDescription");

  return (
    <PermissionGuard permissions={[requiredPermission]}>
      <FormPageShell
        backHref="/products"
        backLabel={t("backToDirectory")}
        description={description}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-7xl"
        title={title}
      >
        {(isEditing || isCloning) && productQuery.isLoading ? (
          <ProductFormSkeleton description={description} title={title} />
        ) : (isEditing || isCloning) && (productQuery.isError || !product) ? (
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
            isClone={isCloning}
            title={title}
          />
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
