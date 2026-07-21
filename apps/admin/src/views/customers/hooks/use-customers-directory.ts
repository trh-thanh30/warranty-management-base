"use client";

import { useDebounce } from "@repo/hooks";
import type { ListCustomersQuery } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useExcel } from "@/src/hooks/use-excel";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { customersService } from "@/src/services/customers/customers.service";
import { useCustomers, useImportCustomers } from "./use-customers";

const CUSTOMERS_PAGE_SIZE = 10;
type CustomerSortBy = NonNullable<ListCustomersQuery["sortBy"]>;

export function useCustomersDirectory() {
  const t = useTranslations("Customers");
  const toast = useToast();
  const { createDatedFilename, downloadBlob } = useExcel();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const {
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    sortBy,
    sortOrder,
    toggleSort,
  } = useTableControls<Record<never, never>, CustomerSortBy>({
    initialPageSize: CUSTOMERS_PAGE_SIZE,
    initialSortBy: "createdAt",
    initialSortOrder: "desc",
  });
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canViewCustomers = hasPermission(PERMISSIONS.CUSTOMER_VIEW);
  const canCreateCustomers = hasPermission(PERMISSIONS.CUSTOMER_CREATE);
  const importCustomers = useImportCustomers();
  const customersQuery = useCustomers(
    {
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
    },
    {
      enabled: Boolean(currentUser) && canViewCustomers,
    },
  );

  async function downloadImportTemplate() {
    try {
      const blob = await customersService.downloadImportTemplate();
      downloadBlob(blob, "customer-import-template.xlsx");
      toast.success(t("excel.templateDownloaded"));
    } catch {
      toast.error(t("excel.templateDownloadError"));
    }
  }

  async function exportCustomers() {
    try {
      const blob = await customersService.exportCustomers(getExportQuery());
      downloadBlob(blob, createDatedFilename("customers"));
      toast.success(t("excel.exported"));
    } catch {
      toast.error(t("excel.exportError"));
    }
  }

  async function importCustomerFile(file: File) {
    try {
      const result = await importCustomers.mutateAsync(file);

      if (result.errors.length > 0) {
        const firstError = result.errors[0];
        toast.error(
          t("excel.importHasErrors", {
            count: result.errors.length,
            row: firstError?.rowNumber ?? 0,
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
      void customersQuery.refetch();
    } catch {
      toast.error(t("excel.importError"));
    }
  }

  function getExportQuery(): ListCustomersQuery {
    return {
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
    };
  }

  return {
    canCreateCustomers,
    closeImportDialog: () => setImportDialogOpen(false),
    customersQuery,
    downloadImportTemplate,
    exportCustomers,
    importCustomerFile,
    isImportDialogOpen,
    isImporting: importCustomers.isPending,
    openImportDialog: () => setImportDialogOpen(true),
    pageSize,
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    toggleSort,
    updateSearch: setSearch,
  };
}
