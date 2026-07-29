import {
  MODERATOR_PERMISSION_DEPENDENCIES,
  MODERATOR_MANAGEABLE_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  type PermissionKey,
} from "@repo/shared/constants";
import type { UserPermissionOverride } from "@repo/shared";

export function buildModeratorPermissionOverrides(
  selectedPermissions: ReadonlySet<PermissionKey>,
): UserPermissionOverride[] {
  const defaults = new Set(ROLE_DEFAULT_PERMISSIONS.moderator);

  return MODERATOR_MANAGEABLE_PERMISSIONS.flatMap((permissionKey) => {
    const selected = selectedPermissions.has(permissionKey);
    const selectedByDefault = defaults.has(permissionKey);

    if (selected === selectedByDefault) {
      return [];
    }

    return [{ permissionKey, granted: selected }];
  });
}

export function toggleModeratorPermission(
  selectedPermissions: ReadonlySet<PermissionKey>,
  permission: PermissionKey,
  checked: boolean,
): Set<PermissionKey> {
  const next = new Set(selectedPermissions);

  if (checked) {
    next.add(permission);
    const requiredPermission = MODERATOR_PERMISSION_DEPENDENCIES[permission];
    if (requiredPermission) next.add(requiredPermission);
    return next;
  }

  next.delete(permission);

  for (const [dependentPermission, requiredPermission] of Object.entries(
    MODERATOR_PERMISSION_DEPENDENCIES,
  )) {
    if (requiredPermission === permission) {
      next.delete(dependentPermission as PermissionKey);
    }
  }

  return next;
}

export function formatPermissionLabel(permission: PermissionKey): string {
  return permission
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
