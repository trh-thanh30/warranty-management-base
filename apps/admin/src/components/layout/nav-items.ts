import type { DashboardConfig } from "@/src/config/dashboard.types";

export function getNavItems(dashboardConfig: DashboardConfig) {
  return dashboardConfig.sidebarSections
    .flatMap((section) => section.items)
    .filter((item) => !!item.href)
    .map((item) => ({
      title: item.title,
      href: item.href!,
      icon: item.icon,
    }));
}
