import type { PermissionKey } from "@repo/shared/constants";

type PermissionAwareNavigation = {
  href?: string;
  permissionHrefs?: Array<{ permission: PermissionKey; href: string }>;
  requiredAnyPermissions?: PermissionKey[];
  requiredPermission?: PermissionKey;
};

export function canAccessNavigationItem(
  item: PermissionAwareNavigation,
  hasPermission: (permission: PermissionKey) => boolean,
) {
  if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
    return false;
  }
  if (
    item.requiredAnyPermissions?.length &&
    !item.requiredAnyPermissions.some(hasPermission)
  ) {
    return false;
  }
  return true;
}

export function resolveNavigationHref(
  item: PermissionAwareNavigation,
  hasPermission: (permission: PermissionKey) => boolean,
) {
  return (
    item.permissionHrefs?.find(({ permission }) => hasPermission(permission))
      ?.href ?? item.href
  );
}
