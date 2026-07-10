"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { CategoriesDirectoryCard } from "./components/categories-directory-card";
import { DeactivateCategoryDialog } from "./components/deactivate-category-dialog";
import { useCategoriesDirectory } from "./hooks/use-categories-directory";

export function CategoriesView() {
  const t = useTranslations("Categories");
  const {
    canCreateCategories,
    categoriesQuery,
    categoryToDeactivate,
    clearFilters,
    closeDeactivate,
    confirmDeactivate,
    isDeactivating,
    openCreate,
    openDeactivate,
    openEdit,
    search,
    setPage,
    status,
    type,
    updateSearch,
    updateStatus,
    updateType,
  } = useCategoriesDirectory();

  return (
    <PermissionGuard permissions={[PERMISSIONS.CATEGORY_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            canCreateCategories ? (
              <Button asChild>
                <Link href="/categories/create">
                  <Plus className="size-4" />
                  {t("create")}
                </Link>
              </Button>
            ) : null
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <CategoriesDirectoryCard
          canCreate={canCreateCategories}
          data={categoriesQuery.data}
          isError={categoriesQuery.isError}
          isLoading={categoriesQuery.isLoading}
          onClearFilters={clearFilters}
          onCreate={openCreate}
          onDeactivate={openDeactivate}
          onEdit={openEdit}
          onPageChange={setPage}
          onRetry={() => {
            void categoriesQuery.refetch();
          }}
          onSearchChange={updateSearch}
          onStatusChange={updateStatus}
          onTypeChange={updateType}
          search={search}
          status={status}
          type={type}
        />

        <DeactivateCategoryDialog
          category={categoryToDeactivate}
          isDeactivating={isDeactivating}
          onConfirm={() => {
            void confirmDeactivate();
          }}
          onOpenChange={(open) => {
            if (!open) closeDeactivate();
          }}
          open={Boolean(categoryToDeactivate)}
        />
      </div>
    </PermissionGuard>
  );
}
