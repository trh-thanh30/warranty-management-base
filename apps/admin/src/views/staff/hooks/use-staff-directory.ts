"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import type {
  ApiUserStatus,
  ListUsersQuery,
  UserAccountSummary,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { useExcel } from "@/src/hooks/use-excel";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { usersService } from "@/src/services/users/users.service";
import {
  useImportStaff,
  useStaffMembers,
  useUpdateStaffMember,
} from "./use-staff";

const STAFF_PAGE_SIZE = 10;
type StaffSortBy = NonNullable<ListUsersQuery["sortBy"]>;

type StaffDirectoryFilters = {
  status: "ALL" | ApiUserStatus;
};

const INITIAL_STAFF_DIRECTORY_FILTERS = {
  status: "ALL",
} satisfies StaffDirectoryFilters;

export function useStaffDirectory() {
  const t = useTranslations("Staff");
  const toast = useToast();
  const { createDatedFilename, downloadBlob, downloadRowsAsExcel } = useExcel();
  const { user: currentUser } = useAuth();
  const { hasPermission, hasRole } = usePermissions();
  const {
    filterHandlers,
    filters,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    sortBy,
    sortOrder,
    toggleSort,
  } = useTableControls<StaffDirectoryFilters, StaffSortBy>({
    initialFilters: INITIAL_STAFF_DIRECTORY_FILTERS,
    initialPageSize: STAFF_PAGE_SIZE,
    initialSortBy: "createdAt",
    initialSortOrder: "desc",
  });
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccountSummary | null>(
    null,
  );
  const [statusUser, setStatusUser] = useState<UserAccountSummary | null>(null);
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { status } = filters;
  const canManageStaff = hasRole("admin");
  const canViewStaff = canManageStaff && hasPermission(PERMISSIONS.USER_VIEW);
  const canCreateStaff =
    canManageStaff && hasPermission(PERMISSIONS.USER_CREATE);
  const staffQuery = useStaffMembers(
    {
      limit: pageSize,
      page,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: status === "ALL" ? undefined : status,
    },
    {
      enabled: Boolean(currentUser) && canViewStaff,
    },
  );
  const statusMutation = useUpdateStaffMember();
  const importStaff = useImportStaff();

  async function downloadImportTemplate() {
    try {
      const blob = await usersService.downloadStaffImportTemplate();
      downloadBlob(blob, "staff-import-template.xlsx");
      toast.success(t("excel.templateDownloaded"));
    } catch {
      toast.error(t("excel.templateDownloadError"));
    }
  }

  async function exportStaff() {
    try {
      const blob = await usersService.exportStaff(getExportQuery());
      downloadBlob(blob, createDatedFilename("staff"));
      toast.success(t("excel.exported"));
    } catch {
      toast.error(t("excel.exportError"));
    }
  }

  async function importStaffFile(file: File) {
    try {
      const result = await importStaff.mutateAsync(file);
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

      if (result.temporaryCredentials.length > 0) {
        try {
          await downloadRowsAsExcel(
            result.temporaryCredentials.map((credential) => ({
              Email: credential.email,
              "Họ và tên": credential.fullName,
              "Mật khẩu tạm thời": credential.temporaryPassword,
              "Tên đăng nhập": credential.username,
            })),
            createDatedFilename("staff-temporary-passwords"),
            "Mật khẩu tạm",
          );
        } catch {
          toast.error(t("excel.credentialsDownloadError"));
        }
      }

      toast.success(
        t("excel.importSuccess", {
          created: result.created,
          updated: result.updated,
        }),
      );
      setImportDialogOpen(false);
      void staffQuery.refetch();
    } catch {
      toast.error(t("excel.importError"));
    }
  }

  function getExportQuery(): Omit<ListUsersQuery, "role" | "roles"> {
    return {
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: status === "ALL" ? undefined : status,
    };
  }

  function updateStaffStatus(user: UserAccountSummary) {
    statusMutation.mutate(
      {
        body: {
          status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        },
        userId: user.id,
      },
      {
        onSuccess: () => toast.success(t("statusUpdated")),
        onError: () => toast.error(t("saveError")),
      },
    );
  }

  function openPermissions(user: UserAccountSummary) {
    setSelectedUser(user);
    setPermissionsOpen(true);
  }

  function openStatusConfirm(user: UserAccountSummary) {
    setStatusUser(user);
  }

  function closeStatusConfirm() {
    setStatusUser(null);
  }

  function confirmStatusChange() {
    if (!statusUser) return;

    updateStaffStatus(statusUser);
    closeStatusConfirm();
  }

  return {
    canCreateStaff,
    canViewStaff,
    closeStatusConfirm,
    closeImportDialog: () => setImportDialogOpen(false),
    confirmStatusChange,
    isUpdatingStatus: statusMutation.isPending,
    isImportDialogOpen,
    isImporting: importStaff.isPending,
    downloadImportTemplate,
    exportStaff,
    importStaffFile,
    openPermissions,
    openImportDialog: () => setImportDialogOpen(true),
    openStatusConfirm,
    pageSize,
    permissionsOpen,
    search,
    selectedUser,
    setPage,
    setPageSize,
    setPermissionsOpen,
    sortBy,
    sortOrder,
    staffQuery,
    status,
    statusUser,
    toggleSort,
    updateSearch: setSearch,
    updateStatus: filterHandlers.status,
  };
}
