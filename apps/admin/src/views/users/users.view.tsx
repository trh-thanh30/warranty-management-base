"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, UserRoundX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@repo/hooks";
import type { ApiUserStatus, UserAccountSummary } from "@repo/shared";
import { Button } from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { StatePanel } from "@/src/components/common/state-panel";
import { useToast } from "@/src/hooks/use-toast";
import { usersService } from "@/src/services/users.service";
import { useAuth } from "@/src/app/providers/auth-provider";
import { StaffDirectoryCard } from "./components/staff-directory-card";
import { StaffFormDialog } from "./components/staff-form-dialog";
import { StaffPermissionsDialog } from "./components/staff-permissions-dialog";
import { TemporaryPasswordDialog } from "./components/temporary-password-dialog";

const STAFF_PAGE_SIZE = 10;

export function UsersView() {
  const t = useTranslations("Staff");
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | ApiUserStatus>("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [temporaryPasswordOpen, setTemporaryPasswordOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );
  const [selectedUser, setSelectedUser] = useState<UserAccountSummary | null>(
    null,
  );
  const debouncedSearch = useDebounce(search.trim(), 300);
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
    enabled: currentUser?.role === "admin",
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
    setSelectedUser(null);
    setFormOpen(true);
  }

  function openEdit(user: UserAccountSummary) {
    setSelectedUser(user);
    setFormOpen(true);
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

  function handleSaved(
    user: UserAccountSummary,
    created: boolean,
    generatedPassword?: string,
  ) {
    void queryClient.invalidateQueries({ queryKey: ["staff"] });
    if (created && generatedPassword) {
      setSelectedUser(user);
      setTemporaryPassword(generatedPassword);
      setTemporaryPasswordOpen(true);
    }
  }

  function handleTemporaryPasswordOpenChange(open: boolean) {
    setTemporaryPasswordOpen(open);
    if (!open) {
      setTemporaryPassword(null);
      setPermissionsOpen(true);
    }
  }

  const data = staffQuery.data;

  if (currentUser?.role !== "admin") {
    return (
      <StatePanel
        description={t("forbiddenDescription")}
        icon={UserRoundX}
        title={t("forbiddenTitle")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t("create")}
          </Button>
        }
        description={t("description")}
        eyebrow={t("eyebrow")}
        title={t("title")}
      />

      <StaffDirectoryCard
        data={data}
        isError={staffQuery.isError}
        isLoading={staffQuery.isLoading}
        onCreate={openCreate}
        onEdit={openEdit}
        onPermissions={openPermissions}
        onRetry={() => {
          void staffQuery.refetch();
        }}
        onSearchChange={updateSearch}
        onStatusChange={updateStatus}
        onToggleStatus={toggleStatus}
        search={search}
        setPage={setPage}
        status={status}
      />

      <StaffFormDialog
        onOpenChange={setFormOpen}
        onSaved={handleSaved}
        open={formOpen}
        user={selectedUser}
      />
      <StaffPermissionsDialog
        onOpenChange={setPermissionsOpen}
        open={permissionsOpen}
        user={selectedUser}
      />
      <TemporaryPasswordDialog
        onOpenChange={handleTemporaryPasswordOpenChange}
        open={temporaryPasswordOpen}
        password={temporaryPassword}
      />
    </div>
  );
}
