"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { UserAccountSummary } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useRouter } from "@/src/i18n/navigation";

export function useStaffAccountWorkflow() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission, hasRole } = usePermissions();
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [temporaryPasswordOpen, setTemporaryPasswordOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );
  const [savedUser, setSavedUser] = useState<UserAccountSummary | null>(null);
  const canManagePermissions =
    hasRole("admin") && hasPermission(PERMISSIONS.USER_PERMISSION_MANAGE);

  function goBackToDirectory() {
    router.push("/users");
  }

  function handleSaved(
    user: UserAccountSummary,
    created: boolean,
    generatedPassword?: string,
  ) {
    setSavedUser(user);
    void queryClient.invalidateQueries({ queryKey: ["staff"] });

    if (created && generatedPassword) {
      setTemporaryPassword(generatedPassword);
      setTemporaryPasswordOpen(true);
      return;
    }

    goBackToDirectory();
  }

  function handleTemporaryPasswordOpenChange(open: boolean) {
    setTemporaryPasswordOpen(open);
    if (!open) {
      setTemporaryPassword(null);
      if (canManagePermissions) {
        setPermissionsOpen(true);
        return;
      }
      goBackToDirectory();
    }
  }

  function handlePermissionsOpenChange(open: boolean) {
    setPermissionsOpen(open);
    if (!open) goBackToDirectory();
  }

  return {
    canManagePermissions,
    goBackToDirectory,
    handlePermissionsOpenChange,
    handleSaved,
    handleTemporaryPasswordOpenChange,
    permissionsOpen,
    savedUser,
    temporaryPassword,
    temporaryPasswordOpen,
  };
}
