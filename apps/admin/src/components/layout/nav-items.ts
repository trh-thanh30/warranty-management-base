import type {
  DashboardConfig,
  NavigationItem,
} from "@/src/config/dashboard.types";

export function flattenNavigationItems(
  items: NavigationItem[],
): NavigationItem[] {
  return items.flatMap((item) =>
    item.children?.length ? flattenNavigationItems(item.children) : [item],
  );
}

export function getNavItems(dashboardConfig: DashboardConfig) {
  return flattenNavigationItems(
    dashboardConfig.sidebarSections.flatMap((section) => section.items),
  )
    .filter((item) => !!item.href)
    .map((item) => ({
      title: item.title,
      href: item.href!,
      icon: item.icon,
    }));
}
