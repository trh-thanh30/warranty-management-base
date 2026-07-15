"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { DeactivateServiceCenterDialog } from "./components/deactivate-service-center-dialog";
import { ServiceCentersDirectoryCard } from "./components/service-centers-directory-card";
import { useServiceCentersDirectory } from "./hooks/use-service-centers-directory";

export function ServiceCentersView() {
  const t = useTranslations("ServiceCenters");
  const directory = useServiceCentersDirectory();

  return (
    <PermissionGuard permissions={[PERMISSIONS.SERVICE_CENTER_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            directory.canCreate ? (
              <Button asChild className="w-full sm:w-auto">
                <Link href="/service-centers/create">
                  <Plus className="size-4" />
                  <span className="sm:hidden">{t("createShort")}</span>
                  <span className="hidden sm:inline">{t("create")}</span>
                </Link>
              </Button>
            ) : null
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <ServiceCentersDirectoryCard
          canCreate={directory.canCreate}
          data={directory.serviceCentersQuery.data}
          isError={directory.serviceCentersQuery.isError}
          isLoading={directory.serviceCentersQuery.isLoading}
          onClearFilters={directory.clearFilters}
          onDeactivate={directory.openDeactivate}
          onPageChange={directory.setPage}
          onPageSizeChange={directory.setPageSize}
          onProvinceChange={directory.updateProvince}
          onRetry={() => {
            void directory.serviceCentersQuery.refetch();
          }}
          onSearchChange={directory.updateSearch}
          onSortChange={directory.toggleSort}
          onStatusChange={directory.updateStatus}
          pageSize={directory.pageSize}
          province={directory.province}
          provinceOptions={directory.provincesQuery.data ?? []}
          provincesAreLoading={directory.provincesQuery.isLoading}
          search={directory.search}
          sortBy={directory.sortBy}
          sortOrder={directory.sortOrder}
          status={directory.status}
        />

        <DeactivateServiceCenterDialog
          isDeactivating={directory.isDeactivating}
          onConfirm={() => {
            void directory.confirmDeactivate();
          }}
          onOpenChange={(open) => {
            if (!open) directory.closeDeactivate();
          }}
          open={Boolean(directory.serviceCenterToDeactivate)}
          serviceCenter={directory.serviceCenterToDeactivate}
        />
      </div>
    </PermissionGuard>
  );
}
