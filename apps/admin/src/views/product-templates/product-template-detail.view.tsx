"use client";

import { useState } from "react";
import { Layers3, PackageOpen, Pencil, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { PaginationControls } from "@/src/components/common/pagination-controls";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useProductTemplate } from "@/src/hooks/use-product-templates";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import { stripHtml } from "@/src/utils/rich-text";
import { useProducts } from "../products/hooks/use-products";
import { LinkedProductsTable } from "./components/linked-products-table";

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
            <div className="flex flex-wrap justify-end gap-2">
              {hasPermission(PERMISSIONS.PRODUCT_CREATE) &&
              template.isActive ? (
                <Button asChild variant="secondary">
                  <Link
                    href={`/products/create?mode=from-template&templateId=${template.id}`}
                  >
                    <PlusCircle className="size-4" />
                    {t("createProductFromTemplate")}
                  </Link>
                </Button>
              ) : null}
              {hasPermission(PERMISSIONS.PRODUCT_TEMPLATE_UPDATE) ? (
                <Button asChild>
                  <Link href={`/product-templates/${template.id}/edit`}>
                    <Pencil className="size-4" />
                    {t("edit")}
                  </Link>
                </Button>
              ) : null}
            </div>
            <Card>
              <CardContent className="space-y-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{template.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {[template.brand, template.model]
                        .filter(Boolean)
                        .join(" · ") || "-"}
                    </p>
                  </div>
                  <Badge variant={template.isActive ? "success" : "secondary"}>
                    {template.isActive ? t("active") : t("inactive")}
                  </Badge>
                </div>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Detail
                    label={t("category")}
                    value={template.categoryRef?.name ?? template.category}
                  />
                  <Detail
                    label={t("manufactureYear")}
                    value={String(template.manufactureYear ?? "-")}
                  />
                  <Detail
                    label={t("defaultWarrantyDuration")}
                    value={t("durationValue", {
                      count: template.defaultWarrantyDurationMonths,
                    })}
                  />
                  <Detail
                    label={t("products")}
                    value={String(template.productCount)}
                  />
                </dl>
                {template.description ? (
                  <div>
                    <h3 className="text-sm font-medium">
                      {t("descriptionLabel")}
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                      {stripHtml(template.description)}
                    </p>
                  </div>
                ) : null}
                {template.assets.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {template.assets.map((asset) => (
                      <figure
                        className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800"
                        key={asset.id}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={asset.altText ?? template.name}
                          className="aspect-video w-full object-cover"
                          src={asset.url}
                        />
                        <figcaption className="p-2 text-xs text-slate-500">
                          {t(`assetRoles.${asset.role}`)}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-950 dark:text-slate-50">
        {value}
      </dd>
    </div>
  );
}
