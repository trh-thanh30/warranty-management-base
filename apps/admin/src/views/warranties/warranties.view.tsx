"use client";

import { ShieldPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { ActivateWarrantyDialog } from "./components/activate-warranty-dialog";
import { WarrantiesDirectoryCard } from "./components/warranties-directory-card";
import { useWarrantiesDirectory } from "./hooks/use-warranties-directory";

export function WarrantiesView() {
  const t = useTranslations("Warranties");
  const {
    clearFilters,
    closeActivate,
    filters,
    openActivate,
    pageSize,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    toggleSort,
    updateSearch,
    updateStatus,
    warrantiesQuery,
    warrantyToActivate,
  } = useWarrantiesDirectory();

  return (
    <PermissionGuard permissions={[PERMISSIONS.WARRANTY_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            <Button asChild>
              <Link href="/warranties/create">
                <ShieldPlus className="size-4" />
                {t("manualActivation")}
              </Link>
            </Button>
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <WarrantiesDirectoryCard
          data={warrantiesQuery.data}
          filters={filters}
          isError={warrantiesQuery.isError}
          isLoading={warrantiesQuery.isLoading}
          onActivate={openActivate}
          onClearFilters={clearFilters}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRetry={() => {
            void warrantiesQuery.refetch();
          }}
          onSearchChange={updateSearch}
          onSortChange={toggleSort}
          onStatusChange={updateStatus}
          pageSize={pageSize}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />

        <ActivateWarrantyDialog
          onActivated={() => {
            void warrantiesQuery.refetch();
          }}
          onOpenChange={(open) => {
            if (!open) closeActivate();
          }}
          open={Boolean(warrantyToActivate)}
          warranty={warrantyToActivate}
        />
      </div>
    </PermissionGuard>
  );
}
