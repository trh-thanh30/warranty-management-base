"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Languages, Moon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
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
  Switch,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { getDashboardConfig } from "@/src/config/dashboard.config";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";
import { useAuth } from "@/src/app/providers/auth-provider";
import { getInitials } from "@/src/utils/get-initials";
import { routing, type AppLocale } from "@/src/i18n/routing";

const localeLabels: Record<AppLocale, "vietnamese" | "english"> = {
  vi: "vietnamese",
  en: "english",
};

export function UserMenu() {
  const t = useTranslations("DashboardConfig");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const dashboardConfig = getDashboardConfig(t);
  const userMenuConfig = dashboardConfig.userMenu;
  const { user, isLoggingOut, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const router = useRouter();
  const displayName = user?.full_name || user?.username || "Admin";
  const email = user?.email || "";
  const avatarFallback = getInitials(displayName);
  const darkMode = mounted && resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        setMenuOpen(open);

        if (!open) {
          setShowLanguages(false);
        }
      }}
      open={menuOpen}
    >
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={tCommon("openUserMenu")}
          className="size-10 p-1"
          size="icon"
          variant="ghost"
        >
          <Avatar className="h-8 w-8">
            {user?.avatar_url ? (
              <AvatarImage alt={displayName} src={user.avatar_url} />
            ) : null}
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[calc(100vw-1rem)] max-w-64 sm:w-64"
        collisionPadding={8}
      >
        {showLanguages ? (
          <>
            <div className="flex items-center gap-2 px-1 py-1">
              <button
                aria-label={tCommon("back")}
                className="flex size-8 shrink-0 items-center justify-center rounded hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-50"
                onClick={() => setShowLanguages(false)}
                type="button"
              >
                <ArrowLeft className="size-4" />
              </button>
              <span className="truncate text-sm font-semibold">
                {tCommon("language")}
              </span>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto overscroll-contain">
              {routing.locales.map((item) => {
                const active = locale === item;

                return (
                  <DropdownMenuItem asChild key={item}>
                    <Link
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center gap-2",
                        active &&
                          "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-slate-50",
                      )}
                      href={pathname}
                      locale={item}
                    >
                      <span className="min-w-0 truncate">
                        {tCommon(localeLabels[item])}
                      </span>
                      {active ? <Check className="ml-auto size-4" /> : null}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <DropdownMenuLabel>
              <span className="block truncate">{displayName}</span>
              <span className="mt-0.5 block truncate text-xs font-normal text-slate-500 dark:text-slate-400">
                {email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2"
              onSelect={(event) => {
                event.preventDefault();
                setShowLanguages(true);
              }}
            >
              <Languages className="h-4 w-4 shrink-0" />
              <span>{tCommon("language")}</span>
              <span className="ml-auto truncate text-xs text-slate-500 dark:text-slate-400">
                {tCommon(localeLabels[locale])}
              </span>
              <ChevronRight className="size-4 shrink-0" />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2"
              onSelect={(event) => {
                event.preventDefault();

                if (mounted) {
                  setTheme(darkMode ? "light" : "dark");
                }
              }}
            >
              <Moon className="h-4 w-4 shrink-0" />
              <span>{tCommon("darkMode")}</span>
              <Switch
                aria-label={tCommon("darkMode")}
                checked={darkMode}
                className="ml-auto"
                disabled={!mounted}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
                onClick={(event) => event.stopPropagation()}
                size="sm"
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {userMenuConfig.menuItems.map((item) => {
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
                    <button
                      className={itemClassName}
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>
                        {isLoggingOut ? t("items.signingOut") : item.label}
                      </span>
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
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
