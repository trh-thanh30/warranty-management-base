"use client";

import { PanelLeft, Search, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { CommandMenu } from "@/src/components/command-menu";
import { MobileSidebar } from "@/src/components/layout/mobile-sidebar";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { UserMenu } from "@/src/components/user-menu";
import { useAdminUiStore } from "@/src/app/stores/ui.store";
import { getDashboardConfig } from "@/src/config/dashboard.config";
import { LanguageSwitcher } from "@/src/components/language-switcher";
import { Link } from "@/src/i18n/navigation";

export function Header() {
  const t = useTranslations("DashboardConfig");
  const tCommon = useTranslations("Common");
  const dashboardConfig = getDashboardConfig(t);
  const setCommandOpen = useAdminUiStore((state) => state.setCommandOpen);
  const toggleSidebar = useAdminUiStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileSidebar />
        <Button
          aria-label={tCommon("toggleSidebar")}
          className="hidden lg:inline-flex"
          onClick={toggleSidebar}
          size="icon"
          variant="ghost"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 lg:block" />
        <nav className="hidden items-center gap-6 lg:flex">
          {dashboardConfig.topNavigation.map((item) => (
            <Link
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-950 first:text-slate-950 dark:text-slate-400 dark:hover:text-slate-50 dark:first:text-slate-50"
              href={item.href}
              key={item.href}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Button
          className="hidden w-64 justify-start text-slate-500 md:inline-flex"
          onClick={() => setCommandOpen(true)}
          variant="secondary"
        >
          <Search className="h-4 w-4" />
          {tCommon("search")}
          <kbd className="ml-auto hidden rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-700 md:inline-block">
            Ctrl K
          </kbd>
        </Button>
        <Button
          aria-label={tCommon("searchPages")}
          className="md:hidden"
          onClick={() => setCommandOpen(true)}
          size="icon"
          variant="ghost"
        >
          <Search className="h-5 w-5" />
        </Button>
        <LanguageSwitcher />
        <ThemeToggle />
        <Button
          aria-label={tCommon("openSettings")}
          size="icon"
          variant="ghost"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <UserMenu />
      </div>
      <CommandMenu />
    </header>
  );
}
