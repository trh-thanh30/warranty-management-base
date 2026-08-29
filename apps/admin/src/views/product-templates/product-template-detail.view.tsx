"use client";

import { Layers3, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button, Skeleton } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useProductTemplate } from "@/src/hooks/use-product-templates";
import { Link } from "@/src/i18n/navigation";
import { ProductTemplateSummaryCard } from "./components/product-template-summary-card";

export function ProductTemplateDetailView({
  templateId,
}: {
  templateId: string;
}) {
  const t = useTranslations("ProductTemplates");
  const templateQuery = useProductTemplate(templateId);
  const template = templateQuery.data;

  return (
    <PermissionGuard permissions={[PERMISSIONS.PRODUCT_TEMPLATE_VIEW]}>
      <FormPageShell
        backHref="/product-templates"
        backLabel={t("backToDirectory")}
        description={t("detailDescription")}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-7xl"
        title={template?.name ?? t("detailTitle")}
      >
        {templateQuery.isLoading ? (
          <Skeleton className="h-80" />
        ) : templateQuery.isError || !template ? (
          <StatePanel
            action={
              <Button onClick={() => void templateQuery.refetch()}>
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={Layers3}
            title={t("loadErrorTitle")}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
              <PermissionGuard
                permissions={[PERMISSIONS.PRODUCT_TEMPLATE_UPDATE]}
              >
                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/product-templates/${template.id}/edit`}>
                    <Pencil className="size-4" />
                    {t("edit")}
                  </Link>
                </Button>
              </PermissionGuard>
            </div>
            <ProductTemplateSummaryCard template={template} />
          </div>
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
