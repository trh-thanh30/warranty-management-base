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
import { usePermissions } from "@/src/hooks/use-permissions";
import { useTableControls } from "@/src/hooks/use-table-controls";
import { useToast } from "@/src/hooks/use-toast";
import { useStaffMembers, useUpdateStaffMember } from "./use-staff";

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
    closeStatusConfirm,
    confirmStatusChange,
    isUpdatingStatus: statusMutation.isPending,
    openPermissions,
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
