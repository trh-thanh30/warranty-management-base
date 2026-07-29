"use client";

import { useEffect, useId, useState } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { UnreadNotificationCount } from "@repo/shared";
import {
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { useAdminUiStore } from "@/src/app/stores/ui.store";
import { getDashboardConfig } from "@/src/config/dashboard.config";
import type { NavigationItem } from "@/src/config/dashboard.types";
import { Link, usePathname } from "@/src/i18n/navigation";
import { usePermissions } from "@/src/hooks/use-permissions";
import { getAccessibleNavigationItems } from "@/src/config/navigation-permissions";
import { useUnreadNotificationCount } from "@/src/hooks/use-notifications";
import { useAuth } from "@/src/app/providers/auth-provider";
import { UserMenu } from "@/src/components/user-menu";
import {
  getActiveNavigationHref,
  getNavigationItemBadge,
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
  isChild?: boolean;
  notificationCounts?: UnreadNotificationCount;
  notificationCountsError: boolean;
};

function NavItemLink({
  item,
  activeHref,
  collapsed,
  isChild = false,
  notificationCounts,
  notificationCountsError,
}: NavItemProps) {
  const t = useTranslations("DashboardConfig");

  const Icon = item.icon;
  const active = isNavigationItemActive(item, activeHref);
  const notificationCount = item.notificationBadgeKey
    ? (notificationCounts?.[item.notificationBadgeKey] ?? 0)
    : 0;
  const badge = getNavigationItemBadge(
    item,
    notificationCounts,
    notificationCountsError,
  );
  const className = cn(
    "relative flex h-9 items-center rounded-md text-sm font-medium transition-all duration-200",
    collapsed
      ? "mx-auto h-9 w-9 justify-center px-0"
      : isChild
        ? "w-full gap-3 pl-3 pr-2"
        : "w-full gap-3 px-3",
    active
      ? "bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-slate-50"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50",
  );

  if (!item.href) return null;

  return (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label={
        badge && item.notificationBadgeKey
          ? `${item.title}. ${t("unreadNotifications", {
              count: notificationCount,
            })}`
          : item.title
      }
      className={className}
      href={item.href}
      title={collapsed ? item.title : undefined}
    >
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate text-left">
            {item.title}
          </span>
          {badge ? (
            <Badge className="h-4 min-w-4 justify-center rounded-full bg-red-500 px-1 py-0 text-[10px] leading-none text-white hover:bg-red-500 dark:bg-red-500">
              {badge}
            </Badge>
          ) : null}
        </>
      ) : null}
      {collapsed && badge ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function NavItemGroup({
  item,
  activeHref,
  collapsed,
  notificationCounts,
  notificationCountsError,
}: NavItemProps) {
  const childActive = hasActiveNavigationDescendant(item, activeHref);
  const [expanded, setExpanded] = useState(childActive);
  const submenuId = useId();
  const Icon = item.icon;
  const badge = getNavigationItemBadge(
    item,
    notificationCounts,
    notificationCountsError,
  );

  useEffect(() => {
    if (childActive) setExpanded(true);
  }, [childActive, activeHref]);

  const parentClassName = cn(
    "relative flex h-9 items-center rounded-md text-sm font-medium transition-all duration-200",
    collapsed ? "mx-auto h-9 w-9 justify-center px-0" : "w-full gap-3 px-3",
    childActive
      ? "bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-slate-50"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50",
  );

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label={badge ? `${item.title}: ${badge}` : item.title}
            className={parentClassName}
            title={item.title}
            type="button"
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-slate-500 dark:bg-slate-400"
            />
            {badge ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                {badge}
              </span>
            ) : null}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none"
          side="right"
        >
          <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
          {item.children?.map((child) => {
            if (!child.href) return null;

            const ChildIcon = child.icon;
            const childActive = isNavigationItemActive(child, activeHref);
            const childBadge = getNavigationItemBadge(
              child,
              notificationCounts,
              notificationCountsError,
            );

            return (
              <DropdownMenuItem asChild key={child.title}>
                <Link
                  aria-current={childActive ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2",
                    childActive && "bg-slate-100 dark:bg-slate-900",
                  )}
                  href={child.href}
                >
                  <ChildIcon
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-slate-500"
                  />
                  <span className="min-w-0 flex-1 truncate">{child.title}</span>
                  {childBadge ? (
                    <Badge className="h-4 min-w-4 justify-center rounded-full bg-red-500 px-1 py-0 text-[10px] leading-none text-white hover:bg-red-500 dark:bg-red-500">
                      {childBadge}
                    </Badge>
                  ) : null}
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
        aria-controls={submenuId}
        aria-expanded={expanded}
        className={parentClassName}
        onClick={() => setExpanded((current) => !current)}
        type="button"
      >
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
        {badge ? (
          <span
            aria-hidden={expanded}
            className={cn(
              "inline-flex h-4 min-w-4 shrink-0 transition-[opacity,transform] duration-200 motion-reduce:transition-none",
              expanded
                ? "pointer-events-none scale-90 opacity-0"
                : "scale-100 opacity-100",
            )}
          >
            <Badge className="h-4 min-w-4 justify-center rounded-full bg-red-500 px-1 py-0 text-[10px] leading-none text-white hover:bg-red-500 dark:bg-red-500">
              {badge}
            </Badge>
          </span>
        ) : null}
        <ChevronRight
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-[240ms] motion-reduce:transition-none",
            expanded && "rotate-90",
          )}
        />
      </button>

      <div
        aria-hidden={!expanded}
        className={cn(
          "grid transition-[grid-template-rows,opacity] ease-out motion-reduce:delay-0 motion-reduce:transition-none",
          expanded
            ? "grid-rows-[1fr] opacity-100 duration-[240ms]"
            : "grid-rows-[0fr] opacity-0 delay-[60ms] duration-200",
        )}
        id={submenuId}
        inert={!expanded}
        role="group"
      >
        <div className="ml-3 min-h-0 overflow-hidden border-l border-slate-200 pl-1 dark:border-slate-800">
          <div
            className={cn(
              "mt-1 space-y-1 transition-[opacity,transform] ease-out motion-reduce:delay-0 motion-reduce:transition-none",
              expanded
                ? "translate-y-0 opacity-100 delay-[50ms] duration-200"
                : "-translate-y-1 opacity-0 duration-150",
            )}
          >
            {item.children?.map((child) => (
              <NavItemLink
                collapsed={false}
                isChild
                item={child}
                key={child.title}
                notificationCounts={notificationCounts}
                notificationCountsError={notificationCountsError}
                activeHref={activeHref}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem(props: NavItemProps) {
  if (props.item.children?.length) {
    return <NavItemGroup {...props} />;
  }

  return <NavItemLink {...props} />;
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
  const visibleSections = dashboardConfig.sidebarSections
    .map((section) => ({
      ...section,
      items: getAccessibleNavigationItems(
        section.items,
        hasPermission,
        hasRole,
      ),
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
        <UserMenu collapsed={collapsed} variant="sidebar" />
      </div>
    </aside>
  );
}
