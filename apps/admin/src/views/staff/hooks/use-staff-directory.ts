"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import type { ApiUserStatus, UserAccountSummary } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useToast } from "@/src/hooks/use-toast";
import { useRouter } from "@/src/i18n/navigation";
import { useStaffMembers, useUpdateStaffMember } from "./use-staff";

const STAFF_PAGE_SIZE = 10;

export function useStaffDirectory() {
  const t = useTranslations("Staff");
  const toast = useToast();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { hasPermission, hasRole } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | ApiUserStatus>("ALL");
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccountSummary | null>(
    null,
  );
  const debouncedSearch = useDebounce(search.trim(), 300);
  const canManageStaff = hasRole("admin");
  const canViewStaff = canManageStaff && hasPermission(PERMISSIONS.USER_VIEW);
  const canCreateStaff =
    canManageStaff && hasPermission(PERMISSIONS.USER_CREATE);
  const staffQuery = useStaffMembers(
    {
      limit: STAFF_PAGE_SIZE,
      page,
      search: debouncedSearch || undefined,
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

  function openCreate() {
    router.push("/users/create");
  }

  function openEdit(user: UserAccountSummary) {
    router.push(`/users/${user.id}/edit`);
  }

  function openPermissions(user: UserAccountSummary) {
    setSelectedUser(user);
    setPermissionsOpen(true);
  }

  function updateSearch(nextSearch: string) {
    setSearch(nextSearch);
    setPage(1);
  }

  function updateStatus(nextStatus: "ALL" | ApiUserStatus) {
    setStatus(nextStatus);
    setPage(1);
  }

  function toggleStatus(user: UserAccountSummary) {
    const message =
      user.status === "ACTIVE"
        ? t("confirmDeactivate", { name: user.fullName || user.username })
        : t("confirmActivate", { name: user.fullName || user.username });

    if (window.confirm(message)) {
      updateStaffStatus(user);
    }
  }

  return {
    canCreateStaff,
    openCreate,
    openEdit,
    openPermissions,
    permissionsOpen,
    search,
    selectedUser,
    setPage,
    setPermissionsOpen,
    staffQuery,
    status,
    toggleStatus,
    updateSearch,
    updateStatus,
  };
}
