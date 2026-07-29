"use client";

import { PanelLeft, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { CommandMenu } from "@/src/components/command-menu";
import { MobileSidebar } from "@/src/components/layout/mobile-sidebar";
import { UserMenu } from "@/src/components/user-menu";
import { useAdminUiStore } from "@/src/app/stores/ui.store";
import { NotificationBell } from "@/src/components/notification-bell";

export function Header() {
  const tCommon = useTranslations("Common");
  const setCommandOpen = useAdminUiStore((state) => state.setCommandOpen);
  const toggleSidebar = useAdminUiStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
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
        <Button
          className="hidden w-80 justify-start text-slate-500 md:inline-flex lg:w-96 xl:w-[28rem]"
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
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <NotificationBell />
        <UserMenu />
      </div>
      <CommandMenu />
    </header>
  );
}
