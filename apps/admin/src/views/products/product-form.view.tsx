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
import { useProductTemplate } from "@/src/hooks/use-product-templates";
type ProductFormViewProps =
  | {
      mode: "create";
      productId?: never;
      templateId?: string;
    }
  | {
      mode: "edit";
      productId: string;
      templateId?: never;
    };

export function ProductFormView({
  mode,
  productId,
  templateId,
}: ProductFormViewProps) {
  const t = useTranslations("Products");
  const workflow = useProductFormWorkflow();
  const isEditing = mode === "edit";
  const { product, productQuery } = useProductDetail(
    isEditing ? { mode: "edit", productId } : { mode: "create" },
  );
  const templateQuery = useProductTemplate(templateId ?? null, {
    enabled: mode === "create" && !!templateId,
  });
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
        {(isEditing && productQuery.isLoading) ||
        (mode === "create" && !!templateId && templateQuery.isLoading) ? (
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
            initialTemplate={templateQuery.data ?? null}
            title={title}
          />
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
