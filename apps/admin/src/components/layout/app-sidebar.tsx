"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { UnreadNotificationCount } from "@repo/shared";
import { Avatar, AvatarFallback, AvatarImage, Badge } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { useAdminUiStore } from "@/src/app/stores/ui.store";
import { getDashboardConfig } from "@/src/config/dashboard.config";
import type { NavigationItem } from "@/src/config/dashboard.types";
import { Link, usePathname } from "@/src/i18n/navigation";
import { usePermissions } from "@/src/hooks/use-permissions";
import {
  canAccessNavigationItem,
  resolveNavigationHref,
} from "@/src/config/navigation-permissions";
import { useUnreadNotificationCount } from "@/src/hooks/use-notifications";
import { useAuth } from "@/src/app/providers/auth-provider";
import { getInitials } from "@/src/utils/get-initials";
import { getNavigationBadge } from "./app-sidebar.utils";

type NavGroupProps = {
  items: NavigationItem[];
  label: string;
  pathname: string;
  collapsed: boolean;
  notificationCounts?: UnreadNotificationCount;
  notificationCountsError: boolean;
};

type NavItemProps = {
  item: NavigationItem;
  pathname: string;
  collapsed: boolean;
  notificationCounts?: UnreadNotificationCount;
  notificationCountsError: boolean;
};

function isNavItemActive(item: NavigationItem, pathname: string) {
  const activeHrefs = item.href
    ? [item.href, ...(item.activeHrefs ?? [])]
    : (item.activeHrefs ?? []);

  return activeHrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );
}

function NavItem({
  item,
  pathname,
  collapsed,
  notificationCounts,
  notificationCountsError,
}: NavItemProps) {
  const t = useTranslations("DashboardConfig");
  const Icon = item.icon;
  const active = isNavItemActive(item, pathname);
  const notificationCount = item.notificationBadgeKey
    ? (notificationCounts?.[item.notificationBadgeKey] ?? 0)
    : 0;
  const notificationBadge = item.notificationBadgeKey
    ? getNavigationBadge(notificationCount, notificationCountsError)
    : null;
  const badge = item.badge ?? notificationBadge;
  const className = cn(
    "relative flex h-9 items-center rounded-md text-sm font-medium transition-all duration-200",
    collapsed ? "justify-center w-9 h-9 mx-auto px-0" : "w-full gap-3 px-3",
    active
      ? "bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-slate-50"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50",
  );
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-left">
            {item.title}
          </span>
          {badge ? (
            <Badge className="h-4 min-w-4 justify-center rounded-full bg-red-500 px-1 py-0 text-[10px] leading-none text-white hover:bg-red-500 dark:bg-red-500">
              {badge}
            </Badge>
          ) : null}
          {!item.href && !badge ? (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          ) : null}
        </>
      )}
      {collapsed && badge ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
          {badge}
        </span>
      ) : null}
    </>
  );

  if (item.href) {
    return (
      <Link
        aria-current={active ? "page" : undefined}
        aria-label={
          notificationBadge
            ? `${item.title}. ${t("unreadNotifications", {
                count: notificationCount,
              })}`
            : item.title
        }
        className={className}
        href={item.href}
        title={collapsed ? item.title : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={className}
      type="button"
      title={collapsed ? item.title : undefined}
    >
      {content}
    </button>
  );
}

function NavGroup({
  items,
  label,
  pathname,
  collapsed,
  notificationCounts,
  notificationCountsError,
}: NavGroupProps) {
  return (
    <div className="space-y-1">
      {!collapsed ? (
        <p className="px-3 pb-1 pt-4 text-xs font-medium text-slate-500 dark:text-slate-500 animate-in fade-in duration-200">
          {label}
        </p>
      ) : (
        <div className="h-4" />
      )}
      {items.map((item) => (
        <NavItem
          collapsed={collapsed}
          item={item}
          key={item.title}
          pathname={pathname}
          notificationCounts={notificationCounts}
          notificationCountsError={notificationCountsError}
        />
      ))}
    </div>
  );
}

export function AppSidebar({
  collapsedOverride,
}: {
  collapsedOverride?: boolean;
}) {
  const t = useTranslations("DashboardConfig");
  const dashboardConfig = getDashboardConfig(t);
  const { hasPermission, hasRole } = usePermissions();
  const pathname = usePathname();
  const { user } = useAuth();
  const notificationCountsQuery = useUnreadNotificationCount({
    enabled: Boolean(user),
  });
  const storedCollapsed = useAdminUiStore((state) => state.sidebarCollapsed);
  const collapsed = collapsedOverride ?? storedCollapsed;
  const displayName = user?.full_name || user?.username || "Admin";
  const email = user?.email || "";
  const avatarFallback = getInitials(displayName);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950",
        collapsed ? "w-16" : "w-72",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-3 px-5",
          !collapsed && "justify-center",
          collapsed && "justify-center px-0",
        )}
      >
        {collapsed ? (
          <Image
            alt={dashboardConfig.brand.name}
            className="h-8 w-8 object-contain animate-in fade-in duration-200"
            height={32}
            priority
            src="/logo.png"
            width={32}
          />
        ) : (
          <Image
            alt={dashboardConfig.brand.name}
            className="h-11 w-auto max-w-[210px] object-contain animate-in fade-in duration-200"
            height={44}
            priority
            src="/logo.png"
            width={210}
          />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {dashboardConfig.sidebarSections.map((section) => {
          const items = section.items
            .filter(
              (item) =>
                (!item.requiredRole || hasRole(item.requiredRole)) &&
                canAccessNavigationItem(item, hasPermission),
            )
            .map((item) => ({
              ...item,
              href: resolveNavigationHref(item, hasPermission),
            }));

          return items.length > 0 ? (
            <NavGroup
              items={items}
              key={section.label}
              label={section.label}
              pathname={pathname}
              collapsed={collapsed}
              notificationCounts={notificationCountsQuery.data}
              notificationCountsError={notificationCountsQuery.isError}
            />
          ) : null;
        })}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div
          className={cn(
            "flex items-center rounded-md",
            collapsed
              ? "justify-center p-0 h-9 w-9 mx-auto"
              : "gap-3 px-2 py-2",
          )}
          title={collapsed ? `${displayName} (${email})` : undefined}
        >
          <Avatar className={cn(collapsed ? "h-8 w-8" : "h-10 w-10")}>
            {user?.avatar_url ? (
              <AvatarImage alt={displayName} src={user.avatar_url} />
            ) : null}
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 animate-in fade-in duration-200">
                <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">
                  {displayName}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {email}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
