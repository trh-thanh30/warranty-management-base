import {
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

export function formatPermissionLabel(permission: PermissionKey): string {
  return permission
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
