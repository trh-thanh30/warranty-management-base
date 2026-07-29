"use client";

import { Layers3, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { PaginationControls } from "@/src/components/common/pagination-controls";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { ProductManagementTabs } from "../product-management/components/product-management-tabs";
import { DeactivateProductTemplateDialog } from "./components/deactivate-product-template-dialog";
import { ProductTemplateUsageGuideDialog } from "./components/product-template-usage-guide-dialog";
import { ProductTemplatesTable } from "./components/product-templates-table";
import {
  type TemplatePublicationFilter,
  type TemplateStatusFilter,
  useProductTemplatesDirectory,
} from "./hooks/use-product-templates-directory";

export function ProductTemplatesView() {
  const t = useTranslations("ProductTemplates");
  const directory = useProductTemplatesDirectory();
  const data = directory.templatesQuery.data;
  return (
    <PermissionGuard permissions={[PERMISSIONS.PRODUCT_TEMPLATE_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            <>
              <ProductTemplateUsageGuideDialog />
              {directory.canCreate ? (
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/product-templates/create">
                    <Plus className="size-4" />
                    {t("create")}
                  </Link>
                </Button>
              ) : null}
            </>
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <ProductManagementTabs activeTab="templates" />

        <Card>
          <CardHeader className="gap-4">
            <div>
              <CardTitle>{t("directoryTitle")}</CardTitle>
              <CardDescription className="mt-1.5">
                {t("directoryDescription")}
              </CardDescription>
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  aria-label={t("searchLabel")}
                  className="pl-9"
                  onChange={(event) => directory.setSearch(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  value={directory.search}
                />
              </div>
              <Select
                onValueChange={(value) =>
                  directory.setPublication(value as TemplatePublicationFilter)
                }
                value={directory.publication}
              >
                <SelectTrigger aria-label={t("publicationFilter")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    {t("allPublicationStatuses")}
                  </SelectItem>
                  <SelectItem value="PUBLISHED">{t("published")}</SelectItem>
                  <SelectItem value="HIDDEN">{t("hidden")}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) =>
                  directory.setStatus(value as TemplateStatusFilter)
                }
                value={directory.status}
              >
                <SelectTrigger aria-label={t("statusFilter")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("allStatuses")}</SelectItem>
                  <SelectItem value="ACTIVE">{t("active")}</SelectItem>
                  <SelectItem value="INACTIVE">{t("inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {directory.templatesQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton className="h-16" key={index} />
                ))}
              </div>
            ) : directory.templatesQuery.isError ? (
              <StatePanel
                action={
                  <Button
                    onClick={() => void directory.templatesQuery.refetch()}
                  >
                    {t("tryAgain")}
                  </Button>
                }
                description={t("loadErrorDescription")}
                icon={Layers3}
                title={t("loadErrorTitle")}
              />
            ) : data && data.items.length > 0 ? (
              <div
                className="scroll-mt-24 space-y-4"
                id="product-templates-directory-results"
              >
                <ProductTemplatesTable
                  items={data.items}
                  onDeactivate={directory.openDeactivate}
                />
                <PaginationControls
                  nextLabel={t("next")}
                  onPageChange={directory.setPage}
                  onPageSizeChange={directory.setPageSize}
                  page={data.meta.page}
                  pageSize={data.meta.limit}
                  pageSizeLabel={t("pageSize")}
                  previousLabel={t("previous")}
                  scrollTargetId="product-templates-directory-results"
                  summary={t("pagination", {
                    page: data.meta.page,
                    total: data.meta.total,
                    totalPages: Math.max(data.meta.totalPages, 1),
                  })}
                  totalPages={data.meta.totalPages}
                />
              </div>
            ) : (
              <StatePanel
                action={
                  directory.canCreate ? (
                    <Button asChild>
                      <Link href="/product-templates/create">
                        {t("create")}
                      </Link>
                    </Button>
                  ) : null
                }
                description={t("emptyDescription")}
                icon={Layers3}
                title={t("emptyTitle")}
              />
            )}
          </CardContent>
        </Card>

        <DeactivateProductTemplateDialog
          isDeactivating={directory.isDeactivating}
          onConfirm={() => void directory.confirmDeactivate()}
          onOpenChange={(open) => {
            if (!open) directory.closeDeactivate();
          }}
          open={Boolean(directory.templateToDeactivate)}
          template={directory.templateToDeactivate}
        />
      </div>
    </PermissionGuard>
  );
}
