"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import type { ApiUserStatus, UserAccountSummary } from "@repo/shared";
import { Button } from "@repo/ui";
import { PERMISSIONS } from "@repo/shared/constants";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useToast } from "@/src/hooks/use-toast";
import { usePermissions } from "@/src/hooks/use-permissions";
import { usersService } from "@/src/services/users.service";
import { useAuth } from "@/src/app/providers/auth-provider";
import { Link, useRouter } from "@/src/i18n/navigation";
import { StaffDirectoryCard } from "./components/staff-directory-card";
import { StaffPermissionsDialog } from "./components/staff-permissions-dialog";

const STAFF_PAGE_SIZE = 10;

export function UsersView() {
  const t = useTranslations("Staff");
  const toast = useToast();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { hasPermission, hasRole } = usePermissions();
  const queryClient = useQueryClient();
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
  const queryKey = [
    "staff",
    { page, search: debouncedSearch, status },
  ] as const;
  const staffQuery = useQuery({
    queryKey,
    queryFn: () =>
      usersService.listModerators({
        limit: STAFF_PAGE_SIZE,
        page,
        search: debouncedSearch || undefined,
        status: status === "ALL" ? undefined : status,
      }),
    enabled: Boolean(currentUser) && canViewStaff,
  });
  const statusMutation = useMutation({
    mutationFn: (user: UserAccountSummary) =>
      usersService.updateModerator(user.id, {
        status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      }),
    onSuccess: () => {
      toast.success(t("statusUpdated"));
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: () => toast.error(t("saveError")),
  });

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
      statusMutation.mutate(user);
    }
  }

  const data = staffQuery.data;

  return (
    <PermissionGuard permissions={[PERMISSIONS.USER_VIEW]} requiredRole="admin">
      <div className="space-y-6">
        <PageHeader
          actions={
            canCreateStaff ? (
              <Button asChild>
                <Link href="/users/create">
                  <Plus className="size-4" />
                  {t("create")}
                </Link>
              </Button>
            ) : null
          }
          description={t("description")}
          eyebrow={t("eyebrow")}
          title={t("title")}
        />

        <StaffDirectoryCard
          data={data}
          canCreate={canCreateStaff}
          isError={staffQuery.isError}
          isLoading={staffQuery.isLoading}
          onCreate={openCreate}
          onEdit={openEdit}
          onPageChange={setPage}
          onPermissions={openPermissions}
          onRetry={() => {
            void staffQuery.refetch();
          }}
          onSearchChange={updateSearch}
          onStatusChange={updateStatus}
          onToggleStatus={toggleStatus}
          search={search}
          status={status}
        />

        <StaffPermissionsDialog
          onOpenChange={setPermissionsOpen}
          open={permissionsOpen}
          user={selectedUser}
        />
      </div>
    </PermissionGuard>
  );
}
