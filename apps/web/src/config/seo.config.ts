import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { routing, type AppLocale } from "@/src/i18n/routing";

export const DEFAULT_SITE_ORIGIN = "https://baohanh.lexzenz.com";

export const INDEXABLE_PATHNAMES = [
  "/",
  "/warranty",
  "/warranty/lookup",
  "/warranty/request",
  "/warranty/track",
  "/dealers",
  "/support-centers",
  "/contact",
  "/guide",
  "/policies",
  "/policies/general",
  "/policies/privacy",
  "/policies/purchasing",
  "/policies/warranty-return",
  "/policies/shipping",
  "/policies/payment",
] as const;

export type IndexablePathname = (typeof INDEXABLE_PATHNAMES)[number];

export function resolveSiteOrigin(
  value = process.env.NEXT_PUBLIC_WEB_URL,
): string {
  const configuredValue = value?.trim() || DEFAULT_SITE_ORIGIN;
  const url = new URL(configuredValue);

  return url.origin;
}

export function createLocalizedUrl(
  siteOrigin: string,
  pathname: IndexablePathname,
  locale: AppLocale,
) {
  const pathnameConfig = routing.pathnames[pathname];
  const localizedPathname =
    typeof pathnameConfig === "string"
      ? pathnameConfig
      : pathnameConfig[locale];
  const localePathname = localizedPathname === "/" ? "" : localizedPathname;

  return new URL(`/${locale}${localePathname}`, siteOrigin).toString();
}

export function createPageAlternates(
  siteOrigin: string,
  pathname: IndexablePathname,
  locale: AppLocale,
): NonNullable<Metadata["alternates"]> {
  const languageUrls = createLanguageAlternates(siteOrigin, pathname);

  return {
    canonical: languageUrls[locale],
    languages: languageUrls,
  };
}

export function createLanguageAlternates(
  siteOrigin: string,
  pathname: IndexablePathname,
): Record<AppLocale | "x-default", string> {
  const languageUrls = Object.fromEntries(
    routing.locales.map((supportedLocale) => [
      supportedLocale,
      createLocalizedUrl(siteOrigin, pathname, supportedLocale),
    ]),
  ) as Record<AppLocale, string>;

  return {
    ...languageUrls,
    "x-default": languageUrls[routing.defaultLocale],
  };
}

export function createGeneratePageMetadata(pathname: IndexablePathname) {
  return async ({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> => {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
      return {};
    }

    const siteOrigin = resolveSiteOrigin();

    return {
      alternates: createPageAlternates(siteOrigin, pathname, locale),
      metadataBase: new URL(siteOrigin),
    };
  };
}
