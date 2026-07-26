import type { AuthUserRole } from "@repo/shared";
import type { PermissionKey } from "@repo/shared/constants";
import type { NavigationItem } from "./dashboard.types";

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

export function getAccessibleNavigationItems(
  items: NavigationItem[],
  hasPermission: (permission: PermissionKey) => boolean,
  hasRole: (role: Exclude<AuthUserRole, null>) => boolean,
): NavigationItem[] {
  return items.flatMap((item) => {
    if (
      (item.requiredRole && !hasRole(item.requiredRole)) ||
      !canAccessNavigationItem(item, hasPermission)
    ) {
      return [];
    }

    const children = item.children
      ? getAccessibleNavigationItems(item.children, hasPermission, hasRole)
      : undefined;

    if (item.children && !children?.length) return [];

    return [
      {
        ...item,
        children,
        href: resolveNavigationHref(item, hasPermission),
      },
    ];
  });
}
