"use client";

import { useEffect } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { LayoutDashboard, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@repo/ui";
import { useAdminUiStore } from "@/src/app/stores/ui.store";
import { getDashboardConfig } from "@/src/config/dashboard.config";
import { Link } from "@/src/i18n/navigation";

export function CommandMenu() {
  const t = useTranslations("DashboardConfig");
  const tCommon = useTranslations("Common");
  const dashboardConfig = getDashboardConfig(t);
  const open = useAdminUiStore((state) => state.commandOpen);
  const setOpen = useAdminUiStore((state) => state.setCommandOpen);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  // Dynamically collect unique searchable pages from sidebar and topnav configurations
  const itemsMap = new Map<
    string,
    {
      title: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
    }
  >();

  dashboardConfig.sidebarSections.forEach((section) => {
    section.items.forEach((item) => {
      if (item.href) {
        itemsMap.set(item.href, {
          title: item.title,
          href: item.href,
          icon: item.icon,
        });
      }
    });
  });

  dashboardConfig.topNavigation.forEach((item) => {
    if (item.href && !itemsMap.has(item.href)) {
      itemsMap.set(item.href, {
        title: item.title,
        href: item.href,
        icon: LayoutDashboard, // fallback icon
      });
    }
  });

  const searchableItems = Array.from(itemsMap.values());

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="p-0">
        <DialogTitle className="sr-only">{tCommon("searchPages")}</DialogTitle>
        <DialogDescription className="sr-only">
          {tCommon("searchPagesDescription")}
        </DialogDescription>
        <CommandPrimitive className="overflow-hidden rounded-lg bg-white dark:bg-slate-950">
          <div className="flex items-center border-b border-slate-200 px-3 dark:border-slate-800">
            <Search className="mr-2 h-4 w-4 shrink-0 text-slate-500" />
            <CommandPrimitive.Input
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              placeholder={tCommon("searchPagesPlaceholder")}
            />
          </div>
          <CommandPrimitive.List className="max-h-80 overflow-y-auto p-2">
            <CommandPrimitive.Empty className="py-6 text-center text-sm text-slate-500">
              {tCommon("noResults")}
            </CommandPrimitive.Empty>
            {searchableItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandPrimitive.Item
                  asChild
                  className="cursor-pointer rounded-md px-3 py-2 text-sm outline-none aria-selected:bg-slate-100 dark:aria-selected:bg-slate-900"
                  key={item.href}
                  onSelect={() => setOpen(false)}
                  value={item.title}
                >
                  <Link className="flex items-center gap-3" href={item.href}>
                    <Icon className="h-4 w-4 text-slate-500" />
                    {item.title}
                  </Link>
                </CommandPrimitive.Item>
              );
            })}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
