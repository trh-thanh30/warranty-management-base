"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { UnreadNotificationCount } from "@repo/shared";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { useAdminUiStore } from "@/src/app/stores/ui.store";
import { getDashboardConfig } from "@/src/config/dashboard.config";
import type { NavigationItem } from "@/src/config/dashboard.types";
import { Link, usePathname } from "@/src/i18n/navigation";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useUnreadNotificationCount } from "@/src/hooks/use-notifications";
import { useAuth } from "@/src/app/providers/auth-provider";
import { getInitials } from "@/src/utils/get-initials";
import {
  getActiveNavigationHref,
  getNavigationBadge,
  hasActiveNavigationDescendant,
  isNavigationItemActive,
} from "./app-sidebar.utils";

type NavGroupProps = {
  items: NavigationItem[];
  label: string;
  activeHref?: string;
  collapsed: boolean;
  notificationCounts?: UnreadNotificationCount;
  notificationCountsError: boolean;
};

type NavItemProps = {
  item: NavigationItem;
  activeHref?: string;
  collapsed: boolean;
  notificationCounts?: UnreadNotificationCount;
  notificationCountsError: boolean;
};

function NavItem({
  item,
  activeHref,
  collapsed,
  notificationCounts,
  notificationCountsError,
}: NavItemProps) {
  const t = useTranslations("DashboardConfig");

  if (item.children?.length) {
    return (
      <NavParentItem
        activeHref={activeHref}
        collapsed={collapsed}
        item={item}
        notificationCounts={notificationCounts}
        notificationCountsError={notificationCountsError}
      />
    );
  }

  const Icon = item.icon;
  const active = isNavigationItemActive(item, activeHref);
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

function NavParentItem({
  item,
  activeHref,
  collapsed,
  notificationCounts,
  notificationCountsError,
}: NavItemProps) {
  const Icon = item.icon;
  const childActive = hasActiveNavigationDescendant(item, activeHref);
  const [open, setOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  const triggerClassName = cn(
    "relative flex h-9 items-center rounded-md text-sm font-medium transition-colors duration-200",
    collapsed ? "mx-auto h-9 w-9 justify-center px-0" : "w-full gap-3 px-3",
    childActive
      ? "bg-slate-50 text-slate-950 dark:bg-slate-900/60 dark:text-slate-50"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50",
  );

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label={item.title}
            className={triggerClassName}
            title={item.title}
            type="button"
          >
            <Icon className="size-4 shrink-0" />
            {childActive ? (
              <span className="absolute -right-0.5 top-1 size-1.5 rounded-full bg-slate-900 dark:bg-slate-100" />
            ) : null}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56" side="right">
          {item.children?.map((child) => {
            const ChildIcon = child.icon;
            const active = isNavigationItemActive(child, activeHref);
            return (
              <DropdownMenuItem asChild key={child.title}>
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2",
                    active && "bg-slate-100 font-medium dark:bg-slate-800",
                  )}
                  href={child.href ?? "/website-config"}
                >
                  <ChildIcon className="size-4" />
                  {child.title}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div>
      <button
        aria-expanded={open}
        className={triggerClassName}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Icon className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
        <ChevronRight
          aria-hidden="true"
          className={cn(
            "size-4 text-slate-400 transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </button>
      {open ? (
        <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-2 dark:border-slate-800">
          {item.children?.map((child) => (
            <NavItem
              activeHref={activeHref}
              collapsed={false}
              item={child}
              key={child.title}
              notificationCounts={notificationCounts}
              notificationCountsError={notificationCountsError}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NavGroup({
  items,
  label,
  activeHref,
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
          activeHref={activeHref}
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
  const canAccess = (item: NavigationItem) =>
    (!item.requiredRole || hasRole(item.requiredRole)) &&
    (!item.requiredPermission || hasPermission(item.requiredPermission));
  const visibleSections = dashboardConfig.sidebarSections
    .map((section) => ({
      ...section,
      items: section.items
        .filter(canAccess)
        .map((item) => ({
          ...item,
          children: item.children?.filter(canAccess),
        }))
        .filter((item) => item.href || !item.children || item.children.length),
    }))
    .filter((section) => section.items.length > 0);
  const activeHref = getActiveNavigationHref(
    visibleSections.flatMap((section) => section.items),
    pathname,
  );

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
        {visibleSections.map((section) => (
          <NavGroup
            activeHref={activeHref}
            collapsed={collapsed}
            items={section.items}
            key={section.label}
            label={section.label}
            notificationCounts={notificationCountsQuery.data}
            notificationCountsError={notificationCountsQuery.isError}
          />
        ))}
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
