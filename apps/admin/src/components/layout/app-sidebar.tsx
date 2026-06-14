"use client";

import { ChevronRight, PanelLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, Badge, Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { useAdminUiStore } from "@/src/app/stores/ui.store";
import { getDashboardConfig } from "@/src/config/dashboard.config";
import type { NavigationItem } from "@/src/config/dashboard.types";
import { Link, usePathname } from "@/src/i18n/navigation";

function NavGroup({
  items,
  label,
  pathname,
  collapsed,
}: {
  items: NavigationItem[];
  label: string;
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <div className="space-y-1">
      {!collapsed ? (
        <p className="px-3 pb-1 pt-4 text-xs font-medium text-slate-500 dark:text-slate-500 animate-in fade-in duration-200">
          {label}
        </p>
      ) : (
        <div className="h-4" />
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href
          ? pathname === item.href || pathname.startsWith(`${item.href}/`)
          : false;
        const className = cn(
          "flex h-9 items-center rounded-md text-sm font-medium transition-all duration-200",
          collapsed
            ? "justify-center w-9 h-9 mx-auto px-0"
            : "w-full gap-3 px-3",
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
                {item.badge ? (
                  <Badge variant="secondary">{item.badge}</Badge>
                ) : null}
                {!item.href && !item.badge ? (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                ) : null}
              </>
            )}
          </>
        );

        if (item.href) {
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={className}
              href={item.href}
              key={item.title}
              title={collapsed ? item.title : undefined}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            className={className}
            key={item.title}
            type="button"
            title={collapsed ? item.title : undefined}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

export function AppSidebar({
  collapsedOverride,
  showCollapseButton = true,
}: {
  collapsedOverride?: boolean;
  showCollapseButton?: boolean;
}) {
  const t = useTranslations("DashboardConfig");
  const tCommon = useTranslations("Common");
  const dashboardConfig = getDashboardConfig(t);
  const pathname = usePathname();
  const BrandLogo = dashboardConfig.brand.logo;
  const user = dashboardConfig.userMenu;
  const storedCollapsed = useAdminUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAdminUiStore((state) => state.toggleSidebar);
  const collapsed = collapsedOverride ?? storedCollapsed;

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
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white dark:bg-slate-50 dark:text-slate-950">
          <BrandLogo className="h-4 w-4" />
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1 animate-in fade-in duration-200">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">
                {dashboardConfig.brand.name}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {dashboardConfig.brand.description}
              </p>
            </div>
            {showCollapseButton ? (
              <Button
                aria-label={tCommon("collapseSidebar")}
                onClick={toggleSidebar}
                size="icon"
                variant="ghost"
                className="h-8 w-8"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            ) : null}
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {dashboardConfig.sidebarSections.map((section) => (
          <NavGroup
            items={section.items}
            key={section.label}
            label={section.label}
            pathname={pathname}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div
          className={cn(
            "flex items-center rounded-md transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer",
            collapsed
              ? "justify-center p-0 h-9 w-9 mx-auto"
              : "gap-3 px-2 py-2",
          )}
          title={collapsed ? `${user.name} (${user.email})` : undefined}
        >
          <Avatar className={cn(collapsed ? "h-8 w-8" : "h-10 w-10")}>
            <AvatarFallback>{user.avatarFallback}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 animate-in fade-in duration-200">
                <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">
                  {user.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
