"use client";

import { useState } from "react";
import { Layers3, PackageOpen, Pencil, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { PaginationControls } from "@repo/ui/pagination-controls";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useProductTemplate } from "@/src/hooks/use-product-templates";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import { useProducts } from "../products/hooks/use-products";
import { LinkedProductsTable } from "./components/linked-products-table";
import { ProductTemplateSummaryCard } from "./components/product-template-summary-card";

export function ProductTemplateDetailView({
  templateId,
}: {
  templateId: string;
}) {
  const t = useTranslations("ProductTemplates");
  const { hasPermission } = usePermissions();
  const [productsPage, setProductsPage] = useState(1);
  const [productsPageSize, setProductsPageSize] = useState(10);
  const canViewProducts = hasPermission(PERMISSIONS.PRODUCT_VIEW);
  const templateQuery = useProductTemplate(templateId);
  const productsQuery = useProducts(
    {
      limit: productsPageSize,
      page: productsPage,
      sortBy: "createdAt",
      sortOrder: "desc",
      templateId,
    },
    { enabled: canViewProducts },
  );
  const template = templateQuery.data;
  const linkedProducts = productsQuery.data;

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
              {hasPermission(PERMISSIONS.PRODUCT_CREATE) &&
              template.isActive ? (
                <Button
                  asChild
                  className="w-full sm:w-auto"
                  variant="secondary"
                >
                  <Link href={`/products/create?templateId=${template.id}`}>
                    <PlusCircle className="size-4" />
                    {t("createProductFromTemplate")}
                  </Link>
                </Button>
              ) : null}
              {hasPermission(PERMISSIONS.PRODUCT_TEMPLATE_UPDATE) ? (
                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/product-templates/${template.id}/edit`}>
                    <Pencil className="size-4" />
                    {t("edit")}
                  </Link>
                </Button>
              ) : null}
            </div>
            <ProductTemplateSummaryCard template={template} />
            {canViewProducts ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t("linkedProductsTitle")}</CardTitle>
                  <CardDescription>
                    {t("linkedProductsDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {productsQuery.isError ? (
                    <StatePanel
                      action={
                        <Button
                          onClick={() => void productsQuery.refetch()}
                          variant="secondary"
                        >
                          {t("tryAgain")}
                        </Button>
                      }
                      description={t("linkedProductsLoadErrorDescription")}
                      icon={PackageOpen}
                      title={t("linkedProductsLoadErrorTitle")}
                    />
                  ) : productsQuery.isLoading || !linkedProducts ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton className="h-12 w-full" key={index} />
                      ))}
                    </div>
                  ) : linkedProducts.items.length === 0 ? (
                    <StatePanel
                      description={t("linkedProductsEmptyDescription")}
                      icon={PackageOpen}
                      title={t("linkedProductsEmptyTitle")}
                    />
                  ) : (
                    <>
                      <LinkedProductsTable products={linkedProducts.items} />
                      <PaginationControls
                        nextLabel={t("next")}
                        onPageChange={setProductsPage}
                        onPageSizeChange={(pageSize) => {
                          setProductsPage(1);
                          setProductsPageSize(pageSize);
                        }}
                        page={linkedProducts.meta.page}
                        pageSize={productsPageSize}
                        pageSizeLabel={t("pageSize")}
                        previousLabel={t("previous")}
                        summary={t("linkedProductsPagination", {
                          page: linkedProducts.meta.page,
                          total: linkedProducts.meta.total,
                          totalPages: linkedProducts.meta.totalPages,
                        })}
                        totalPages={linkedProducts.meta.totalPages}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}
