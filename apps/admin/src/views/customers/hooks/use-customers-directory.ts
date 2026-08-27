"use client";

import { useDebounce } from "@repo/hooks";
import type { CustomerStatus, ListCustomersQuery } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useExcel } from "@/src/hooks/use-excel";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { customersService } from "@/src/services/customers/customers.service";
import {
  useCustomers,
  useDeleteCustomer,
  useImportCustomers,
  useRestoreCustomer,
} from "./use-customers";

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
  const [status, setStatus] = useState<CustomerStatus | "ALL">("ACTIVE");
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canViewCustomers = hasPermission(PERMISSIONS.CUSTOMER_VIEW);
  const canCreateCustomers = hasPermission(PERMISSIONS.CUSTOMER_CREATE);
  const canDeleteCustomers = hasPermission(PERMISSIONS.CUSTOMER_DELETE);
  const importCustomers = useImportCustomers();
  const deleteCustomer = useDeleteCustomer();
  const restoreCustomer = useRestoreCustomer();
  const customersQuery = useCustomers(
    {
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
      status,
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
      status,
      sortBy,
      sortOrder,
    };
  }

  return {
    canCreateCustomers,
    canDeleteCustomers,
    closeImportDialog: () => setImportDialogOpen(false),
    customersQuery,
    downloadImportTemplate,
    exportCustomers,
    importCustomerFile,
    deleteCustomer: async (id: string) => {
      try {
        await deleteCustomer.mutateAsync(id);
        toast.success(t("deleted"));
      } catch {
        toast.error(t("deleteError"));
        throw new Error("Customer deletion failed");
      }
    },
    isDeleting: deleteCustomer.isPending,
    restoreCustomer: async (id: string) => {
      try {
        await restoreCustomer.mutateAsync(id);
        toast.success(t("restored"));
      } catch {
        toast.error(t("restoreError"));
        throw new Error("Customer restoration failed");
      }
    },
    isRestoring: restoreCustomer.isPending,
    isImportDialogOpen,
    isImporting: importCustomers.isPending,
    openImportDialog: () => setImportDialogOpen(true),
    pageSize,
    status,
    setStatus: (nextStatus: CustomerStatus | "ALL") => {
      setStatus(nextStatus);
      setPage(1);
    },
    search,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    toggleSort,
    updateSearch: setSearch,
  };
}
