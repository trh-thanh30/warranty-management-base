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
  useServiceCenters,
} from "@/src/hooks/use-service-centers";
import { useVietnamProvinces } from "@/src/hooks/use-locations";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
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

  return {
    canCreate,
    clearFilters: resetControls,
    closeDeactivate: () => setServiceCenterToDeactivate(null),
    confirmDeactivate,
    isDeactivating: deactivateServiceCenter.isPending,
    openDeactivate: setServiceCenterToDeactivate,
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
