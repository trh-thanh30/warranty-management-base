import type { NavigationItem } from "@/src/config/dashboard.types";

export function getNavigationBadge(count: number, hasError: boolean) {
  if (hasError || count <= 0) return null;
  return count > 99 ? "99+" : String(count);
}

function navigationHrefs(item: NavigationItem) {
  return [...(item.href ? [item.href] : []), ...(item.activeHrefs ?? [])];
}

function flattenNavigationItems(items: NavigationItem[]): NavigationItem[] {
  return items.flatMap((item) => [
    item,
    ...flattenNavigationItems(item.children ?? []),
  ]);
}

export function getActiveNavigationHref(
  items: NavigationItem[],
  pathname: string,
) {
  return flattenNavigationItems(items)
    .flatMap(navigationHrefs)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((left, right) => right.length - left.length)[0];
}

export function isNavigationItemActive(
  item: NavigationItem,
  activeHref: string | undefined,
) {
  return Boolean(activeHref && navigationHrefs(item).includes(activeHref));
}

export function hasActiveNavigationDescendant(
  item: NavigationItem,
  activeHref: string | undefined,
): boolean {
  return (item.children ?? []).some(
    (child) =>
      isNavigationItemActive(child, activeHref) ||
      hasActiveNavigationDescendant(child, activeHref),
  );
}
