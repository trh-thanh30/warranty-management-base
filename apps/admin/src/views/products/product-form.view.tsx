"use client";

import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";
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
