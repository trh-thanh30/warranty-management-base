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
import { Link } from "@/src/i18n/navigation";

type ProductFormViewProps =
  | {
      mode: "create";
      productId?: never;
      createMode: "from-template" | "independent";
      templateId?: string;
    }
  | {
      mode: "edit";
      productId: string;
      createMode?: never;
      templateId?: never;
    };

export function ProductFormView({
  createMode,
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
    enabled:
      mode === "create" && createMode === "from-template" && !!templateId,
  });
  const requiredPermission: PermissionKey = isEditing
    ? PERMISSIONS.PRODUCT_UPDATE
    : PERMISSIONS.PRODUCT_CREATE;
  const title = isEditing
    ? t("editTitle")
    : createMode === "from-template"
      ? t("createFromTemplateTitle")
      : t("createIndependentTitle");
  const description = isEditing
    ? t("editDescription")
    : createMode === "from-template"
      ? t("createFromTemplateDescription")
      : t("createIndependentDescription");
  const missingTemplate =
    mode === "create" && createMode === "from-template" && !templateId;
  const templateLoadFailed =
    mode === "create" &&
    createMode === "from-template" &&
    !!templateId &&
    (templateQuery.isError ||
      (!templateQuery.isLoading &&
        (!templateQuery.data || !templateQuery.data.isActive)));

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
        {missingTemplate ? (
          <StatePanel
            action={
              <Button asChild>
                <Link href="/product-templates">{t("chooseTemplate")}</Link>
              </Button>
            }
            description={t("chooseTemplateDescription")}
            icon={PackageSearch}
            title={t("chooseTemplateTitle")}
          />
        ) : templateLoadFailed ? (
          <StatePanel
            action={
              <Button asChild>
                <Link href="/product-templates">
                  {t("chooseAnotherTemplate")}
                </Link>
              </Button>
            }
            description={t("templateLoadErrorDescription")}
            icon={PackageSearch}
            title={t("templateLoadErrorTitle")}
          />
        ) : (isEditing && productQuery.isLoading) ||
          (mode === "create" &&
            createMode === "from-template" &&
            templateQuery.isLoading) ? (
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
            createMode={createMode}
            productTemplate={templateQuery.data ?? null}
            title={title}
          />
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
