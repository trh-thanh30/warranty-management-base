"use client";

import { useState } from "react";
import { useDebounce } from "@repo/hooks";
import type { ServiceCenterSortBy, ServiceCenterSummary } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useTranslations } from "next-intl";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import {
  useDeactivateServiceCenter,
  useImportServiceCenters,
  useServiceCenters,
} from "@/src/hooks/use-service-centers";
import { useExcel } from "@/src/hooks/use-excel";
import { useVietnamProvinces } from "@/src/hooks/use-locations";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { serviceCentersService } from "@/src/services/service-centers/service-centers.service";
import { SERVICE_CENTERS_PAGE_SIZE } from "../service-centers.constants";
import type { ServiceCenterStatusFilter } from "../service-centers.types";
import { toServiceCenterActiveQuery } from "../service-centers.utils";

type ServiceCenterDirectoryFilters = {
  province: string;
  status: ServiceCenterStatusFilter;
};

const INITIAL_SERVICE_CENTER_FILTERS = {
  province: "",
  status: "ALL",
} satisfies ServiceCenterDirectoryFilters;

export function useServiceCentersDirectory() {
  const t = useTranslations("ServiceCenters");
  const toast = useToast();
  const { createDatedFilename, downloadBlob } = useExcel();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const {
    filterHandlers,
    filters,
    page,
    pageSize,
    resetControls,
    search,
    setPage,
    setPageSize,
    setSearch,
    sortBy,
    sortOrder,
    toggleSort,
  } = useTableControls<ServiceCenterDirectoryFilters, ServiceCenterSortBy>({
    initialFilters: INITIAL_SERVICE_CENTER_FILTERS,
    initialPageSize: SERVICE_CENTERS_PAGE_SIZE,
    initialSortBy: "name",
    initialSortOrder: "asc",
  });
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canView = hasPermission(PERMISSIONS.SERVICE_CENTER_VIEW);
  const canCreate = hasPermission(PERMISSIONS.SERVICE_CENTER_CREATE);
  const deactivateServiceCenter = useDeactivateServiceCenter();
  const importServiceCenters = useImportServiceCenters();
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [serviceCenterToDeactivate, setServiceCenterToDeactivate] =
    useState<ServiceCenterSummary | null>(null);
  const serviceCentersQuery = useServiceCenters(
    {
      isActive: toServiceCenterActiveQuery(filters.status),
      limit: pageSize,
      page,
      province: filters.province || undefined,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
    },
    { enabled: Boolean(user) && canView },
  );
  const provincesQuery = useVietnamProvinces({
    enabled: Boolean(user) && canView,
  });

  async function confirmDeactivate() {
    if (!serviceCenterToDeactivate) return;

    try {
      await deactivateServiceCenter.mutateAsync(serviceCenterToDeactivate.id);
      toast.success(t("deactivated"));
      setServiceCenterToDeactivate(null);
    } catch {
      toast.error(t("deactivateError"));
    }
  }

  async function downloadImportTemplate() {
    try {
      const blob = await serviceCentersService.downloadImportTemplate();
      downloadBlob(blob, "service-center-import-template.xlsx");
      toast.success(t("excel.templateDownloaded"));
    } catch {
      toast.error(t("excel.templateDownloadError"));
    }
  }

  async function exportServiceCenters() {
    try {
      const blob = await serviceCentersService.exportServiceCenters({
        isActive: toServiceCenterActiveQuery(filters.status),
        province: filters.province || undefined,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      });
      downloadBlob(blob, createDatedFilename("service-centers"));
      toast.success(t("excel.exported"));
    } catch {
      toast.error(t("excel.exportError"));
    }
  }

  async function importServiceCenterFile(file: File) {
    try {
      const result = await importServiceCenters.mutateAsync(file);
      if (result.errors.length > 0) {
        toast.error(
          t("excel.importHasErrors", {
            count: result.errors.length,
            row: result.errors[0]?.rowNumber ?? 0,
          }),
        );
        return;
      }

      toast.success(
        t("excel.importSuccess", {
          created: result.created,
          updated: result.updated,
        }),
      );
      setImportDialogOpen(false);
      void serviceCentersQuery.refetch();
    } catch {
      toast.error(t("excel.importError"));
    }
  }

  return {
    canCreate,
    clearFilters: resetControls,
    closeImportDialog: () => setImportDialogOpen(false),
    closeDeactivate: () => setServiceCenterToDeactivate(null),
    confirmDeactivate,
    downloadImportTemplate,
    exportServiceCenters,
    importServiceCenterFile,
    isImportDialogOpen,
    isImporting: importServiceCenters.isPending,
    isDeactivating: deactivateServiceCenter.isPending,
    openDeactivate: setServiceCenterToDeactivate,
    openImportDialog: () => setImportDialogOpen(true),
    pageSize,
    province: filters.province,
    provincesQuery: {
      ...provincesQuery,
      data: provincesQuery.data?.map((province) => province.name) ?? [],
    },
    search,
    serviceCentersQuery,
    serviceCenterToDeactivate,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    status: filters.status,
    toggleSort,
    updateProvince: filterHandlers.province,
    updateSearch: setSearch,
    updateStatus: filterHandlers.status,
  };
}
