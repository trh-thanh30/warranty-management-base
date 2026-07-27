import type { DashboardConfig } from "@/src/config/dashboard.types";
import type { NavigationItem } from "@/src/config/dashboard.types";

function flattenItems(items: NavigationItem[]): NavigationItem[] {
  return items.flatMap((item) => [item, ...flattenItems(item.children ?? [])]);
}

export function getNavItems(dashboardConfig: DashboardConfig) {
  return flattenItems(
    dashboardConfig.sidebarSections.flatMap((section) => section.items),
  )
    .filter((item) => !!item.href)
    .map((item) => ({
      title: item.title,
      href: item.href!,
      icon: item.icon,
    }));
}
