"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { PERMISSIONS } from "@repo/shared/constants";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { StaffDirectoryCard } from "./components/staff-directory-card";
import { StaffPermissionsDialog } from "./components/staff-permissions-dialog";
import { useStaffDirectory } from "./hooks/use-staff-directory";

export function StaffView() {
  const t = useTranslations("Staff");
  const {
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
  } = useStaffDirectory();

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
          data={staffQuery.data}
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
