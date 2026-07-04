"use client";

import { useTranslations } from "next-intl";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import { Link, useRouter } from "@/src/i18n/navigation";
import { useAuth } from "@/src/app/providers/auth-provider";
import { getInitials } from "@/src/utils/get-initials";

export function UserMenu() {
  const t = useTranslations("DashboardConfig");
  const dashboardConfig = getDashboardConfig(t);
  const fallbackUser = dashboardConfig.userMenu;
  const { user, logout } = useAuth();
  const router = useRouter();
  const displayName = user?.full_name || user?.username || fallbackUser.name;
  const email = user?.email || fallbackUser.email;
  const avatarFallback = getInitials(displayName);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-10 gap-2 px-2" variant="ghost">
          <Avatar className="h-8 w-8">
            {user?.avatar_url ? (
              <AvatarImage alt={displayName} src={user.avatar_url} />
            ) : null}
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {fallbackUser.menuItems.map((item) => {
          const Icon = item.icon;
          const itemClassName = cn(
            "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors",
            item.isDestructive
              ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900",
          );

          if (item.isDestructive) {
            return (
              <DropdownMenuItem asChild key={item.label}>
                <button className={itemClassName} onClick={handleLogout}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem asChild key={item.label}>
              <Link href={item.href} className={itemClassName}>
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
