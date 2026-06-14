"use client";

import { useTranslations } from "next-intl";
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { getDashboardConfig } from "@/src/config/dashboard.config";
import { Link } from "@/src/i18n/navigation";

export function UserMenu() {
  const t = useTranslations("DashboardConfig");
  const dashboardConfig = getDashboardConfig(t);
  const user = dashboardConfig.userMenu;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-10 gap-2 px-2" variant="ghost">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user.avatarFallback}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline">
            {user.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              asChild
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors",
                item.isDestructive
                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900",
              )}
              key={item.label}
            >
              <Link href={item.href} className="flex w-full items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
