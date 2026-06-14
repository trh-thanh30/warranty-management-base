"use client";

import { Check, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui";
import { Link, usePathname } from "@/src/i18n/navigation";
import { routing, type AppLocale } from "@/src/i18n/routing";
import { cn } from "@repo/ui/lib/utils";

const localeLabels: Record<AppLocale, "vietnamese" | "english"> = {
  vi: "vietnamese",
  en: "english",
};

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const t = useTranslations("Common");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={t("language")} size="icon" variant="ghost">
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((item) => {
          const active = locale === item;

          return (
            <DropdownMenuItem
              asChild
              className={cn(
                active &&
                  "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-slate-50",
              )}
              key={item}
            >
              <Link
                aria-current={active ? "true" : undefined}
                className="flex w-full items-center justify-between gap-4"
                href={pathname}
                locale={item}
              >
                <span>{t(localeLabels[item])}</span>
                {active ? <Check className="h-4 w-4" /> : null}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
