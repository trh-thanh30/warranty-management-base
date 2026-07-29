"use client";

import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/src/i18n/routing";
import { usePathname, useRouter } from "@/src/i18n/navigation";

type LanguageSwitcherProps = {
  className?: string;
  onNavigate?: () => void;
};

function VietnamFlag() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-7 shrink-0 overflow-hidden rounded-sm"
      viewBox="0 0 28 20"
    >
      <rect width="28" height="20" fill="#DA251D" />
      <path
        d="m14 4.2 1.3 4h4.2l-3.4 2.45 1.3 4-3.4-2.47-3.4 2.47 1.3-4L8.5 8.2h4.2L14 4.2Z"
        fill="#FFCD00"
      />
    </svg>
  );
}

function UnitedKingdomFlag() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-7 shrink-0 overflow-hidden rounded-sm"
      viewBox="0 0 28 20"
    >
      <rect width="28" height="20" fill="#012169" />
      <path d="M0 0 28 20M28 0 0 20" stroke="#FFF" strokeWidth="4" />
      <path d="M0 0 28 20M28 0 0 20" stroke="#C8102E" strokeWidth="2" />
      <path d="M14 0v20M0 10h28" stroke="#FFF" strokeWidth="6" />
      <path d="M14 0v20M0 10h28" stroke="#C8102E" strokeWidth="3.2" />
    </svg>
  );
}

export function LanguageSwitcher({
  className = "",
  onNavigate,
}: LanguageSwitcherProps) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("SiteHeader");
  const [isPending, startTransition] = useTransition();

  const changeLanguage = (nextLocale: AppLocale) => {
    if (nextLocale === locale) return;

    onNavigate?.();
    startTransition(() => {
      // The pathname and params both come from the active route, so they
      // always form a valid pair even though TypeScript cannot narrow them.
      // @ts-expect-error -- Keep dynamic route params while changing locale.
      router.replace({ pathname, params }, { locale: nextLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("languageMenuAriaLabel")}
          disabled={isPending}
          className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-border-gray bg-white px-3 text-sm font-semibold text-deep-black transition-colors duration-200 hover:border-premium-red hover:bg-light-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${className}`}
        >
          {locale === "vi" ? <VietnamFlag /> : <UnitedKingdomFlag />}
          <span aria-hidden="true">{locale.toUpperCase()}</span>
          <ChevronDown aria-hidden="true" className="size-4 text-stone-gray" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-44 border-border-gray bg-white p-1.5 text-deep-black"
      >
        <DropdownMenuItem
          aria-current={locale === "vi" ? "true" : undefined}
          className="min-h-10 gap-2.5 px-2.5"
          onSelect={() => changeLanguage("vi")}
        >
          <VietnamFlag />
          <span className="flex-1">{t("languages.vietnamese")}</span>
          {locale === "vi" ? (
            <Check aria-hidden="true" className="size-4 text-premium-red" />
          ) : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          aria-current={locale === "en" ? "true" : undefined}
          className="min-h-10 gap-2.5 px-2.5"
          onSelect={() => changeLanguage("en")}
        >
          <UnitedKingdomFlag />
          <span className="flex-1">{t("languages.english")}</span>
          {locale === "en" ? (
            <Check aria-hidden="true" className="size-4 text-premium-red" />
          ) : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
