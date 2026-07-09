"use client";

import type { PermissionKey } from "@repo/shared/constants";
import type { AuthUserRole } from "@repo/shared";
import { useAuth } from "@/src/app/providers/auth-provider";

type PermissionMode = "all" | "any";

export function usePermissions() {
  const { user } = useAuth();
  const userPermissions = user?.permissions ?? [];

  function hasRole(role: Exclude<AuthUserRole, null>) {
    return user?.role === role;
  }

  function hasPermission(permission: PermissionKey) {
    return userPermissions.includes(permission);
  }

  function hasPermissions(
    permissions: PermissionKey[],
    mode: PermissionMode = "all",
  ) {
    if (permissions.length === 0) return true;

    return mode === "all"
      ? permissions.every(hasPermission)
      : permissions.some(hasPermission);
  }

  return {
    hasRole,
    hasPermission,
    hasPermissions,
    permissions: userPermissions,
    role: user?.role ?? null,
  };
}
