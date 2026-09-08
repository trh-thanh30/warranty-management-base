"use client";

import { useState } from "react";
import { useDebounce } from "@repo/hooks";
import type { DealerResponse, DealerSortBy } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useTranslations } from "next-intl";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  useDealerProvinces,
  useDealers,
  useDeactivateDealer,
  useImportDealers,
} from "@/src/hooks/use-dealers";
import { useExcel } from "@/src/hooks/use-excel";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { dealersService } from "@/src/services/dealers/dealers.service";
import { DEALERS_PAGE_SIZE } from "../dealers.constants";
import type { DealerStatusFilter } from "../dealers.types";
import { toDealerActiveQuery } from "../dealers.utils";

type DealerDirectoryFilters = {
  province: string;
  status: DealerStatusFilter;
};

const INITIAL_DEALER_FILTERS = {
  province: "",
  status: "ACTIVE",
} satisfies DealerDirectoryFilters;

export function useDealersDirectory() {
  const t = useTranslations("Dealers");
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
  } = useTableControls<DealerDirectoryFilters, DealerSortBy>({
    initialFilters: INITIAL_DEALER_FILTERS,
    initialPageSize: DEALERS_PAGE_SIZE,
    initialSortBy: "name",
    initialSortOrder: "asc",
  });
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canView = hasPermission(PERMISSIONS.DEALER_VIEW);
  const canCreate = hasPermission(PERMISSIONS.DEALER_CREATE);
  const deactivateDealer = useDeactivateDealer();
  const importDealers = useImportDealers();
  const [dealerToDeactivate, setDealerToDeactivate] =
    useState<DealerResponse | null>(null);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const listQuery = {
    isActive: toDealerActiveQuery(filters.status),
    limit: pageSize,
    page,
    province: filters.province || undefined,
    search: debouncedSearch || undefined,
    sortBy,
    sortOrder,
  };
  const dealersQuery = useDealers(listQuery, {
    enabled: Boolean(user) && canView,
  });
  const provincesQuery = useDealerProvinces({
    enabled: Boolean(user) && canView,
  });

  async function confirmDeactivate() {
    if (!dealerToDeactivate) return;

    try {
      await deactivateDealer.mutateAsync(dealerToDeactivate.id);
      toast.success(t("deactivated"));
      setDealerToDeactivate(null);
    } catch {
      toast.error(t("deactivateError"));
    }
  }

  async function downloadImportTemplate() {
    try {
      const blob = await dealersService.downloadImportTemplate();
      downloadBlob(blob, "dealer-import-template.xlsx");
      toast.success(t("excel.templateDownloaded"));
    } catch {
      toast.error(t("excel.templateDownloadError"));
    }
  }

  async function exportDealers() {
    try {
      const blob = await dealersService.exportDealers(listQuery);
      downloadBlob(blob, createDatedFilename("dealers"));
      toast.success(t("excel.exported"));
    } catch {
      toast.error(t("excel.exportError"));
    }
  }

  async function importDealerFile(file: File) {
    try {
      const result = await importDealers.mutateAsync(file);
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
      void dealersQuery.refetch();
    } catch {
      toast.error(t("excel.importError"));
    }
  }

  return {
    canCreate,
    clearFilters: resetControls,
    closeDeactivate: () => setDealerToDeactivate(null),
    closeImportDialog: () => setImportDialogOpen(false),
    confirmDeactivate,
    dealerToDeactivate,
    dealersQuery,
    downloadImportTemplate,
    exportDealers,
    importDealerFile,
    isDeactivating: deactivateDealer.isPending,
    isImportDialogOpen,
    isImporting: importDealers.isPending,
    openDeactivate: setDealerToDeactivate,
    openImportDialog: () => setImportDialogOpen(true),
    pageSize,
    province: filters.province,
    provincesQuery,
    search,
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
