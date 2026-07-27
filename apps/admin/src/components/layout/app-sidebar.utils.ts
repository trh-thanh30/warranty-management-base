import type { UnreadNotificationCount } from "@repo/shared";
import type { NavigationItem } from "@/src/config/dashboard.types";

export function getNavigationBadge(count: number, hasError: boolean) {
  if (hasError || count <= 0) return null;
  return count > 99 ? "99+" : String(count);
}

export function isNavigationItemActive(
  item: NavigationItem,
  pathname: string,
): boolean {
  const activeHrefs = item.href
    ? [item.href, ...(item.activeHrefs ?? [])]
    : (item.activeHrefs ?? []);
  const directlyActive = activeHrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );

  return (
    directlyActive ||
    (item.children?.some((child) => isNavigationItemActive(child, pathname)) ??
      false)
  );
}

export function getNavigationItemBadge(
  item: NavigationItem,
  notificationCounts: UnreadNotificationCount | undefined,
  notificationCountsError: boolean,
): string | null {
  if (item.badge) return item.badge;

  if (item.notificationBadgeKey) {
    return getNavigationBadge(
      notificationCounts?.[item.notificationBadgeKey] ?? 0,
      notificationCountsError,
    );
  }

  for (const child of item.children ?? []) {
    const childBadge = getNavigationItemBadge(
      child,
      notificationCounts,
      notificationCountsError,
    );
    if (childBadge) return childBadge;
  }

  return null;
}
