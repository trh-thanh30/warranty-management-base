import { useCallback, useMemo } from "react";
import { useAuth, type BaseAuthUser } from "./use-auth";

export type UsePermissionOptions = {
  mode?: "all" | "any";
};

export function usePermission<TUser extends BaseAuthUser = BaseAuthUser>(
  requiredPermissions: string | string[] = [],
  options: UsePermissionOptions = {},
) {
  const { mode = "all" } = options;
  const { isAuthenticated, permissions, role, user } = useAuth<TUser>();
  const required = useMemo(() => {
    return Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];
  }, [requiredPermissions]);

  const hasPermission = useCallback(
    (permission: string) => {
      return isAuthenticated && permissions.includes(permission);
    },
    [isAuthenticated, permissions],
  );

  const hasAnyPermission = useCallback(
    (items: string[]) => {
      return (
        isAuthenticated &&
        items.some((permission) => permissions.includes(permission))
      );
    },
    [isAuthenticated, permissions],
  );

  const hasAllPermissions = useCallback(
    (items: string[]) => {
      return (
        isAuthenticated &&
        items.every((permission) => permissions.includes(permission))
      );
    },
    [isAuthenticated, permissions],
  );

  const hasRole = useCallback(
    (allowedRoles: string | string[]) => {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      return isAuthenticated && role !== null && roles.includes(role);
    },
    [isAuthenticated, role],
  );

  const can = useMemo(() => {
    if (!isAuthenticated) {
      return false;
    }

    if (required.length === 0) {
      return true;
    }

    if (mode === "any") {
      return required.some((permission) => permissions.includes(permission));
    }

    return required.every((permission) => permissions.includes(permission));
  }, [isAuthenticated, mode, permissions, required]);

  return {
    can,
    hasAllPermissions,
    hasAnyPermission,
    hasPermission,
    hasRole,
    permissions,
    role,
    user,
  };
}
