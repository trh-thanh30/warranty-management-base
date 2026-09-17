import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing, type AppLocale } from "@/src/i18n/routing";

export const DEFAULT_SITE_ORIGIN = "https://baohanh.lexzenz.com";

export const INDEXABLE_PATHNAMES = [
  "/warranty",
  "/warranty/activate",
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
type LocalizedPathname = IndexablePathname | "/";

export const SEO_PAGE_KEYS = {
  "/warranty": "warranty",
  "/warranty/activate": "activation",
  "/warranty/lookup": "lookup",
  "/warranty/request": "request",
  "/warranty/track": "track",
  "/dealers": "dealers",
  "/support-centers": "supportCenters",
  "/contact": "contact",
  "/guide": "guide",
  "/policies": "policies",
  "/policies/general": "generalPolicy",
  "/policies/privacy": "privacyPolicy",
  "/policies/purchasing": "purchasingPolicy",
  "/policies/warranty-return": "warrantyReturnPolicy",
  "/policies/shipping": "shippingPolicy",
  "/policies/payment": "paymentPolicy",
} as const satisfies Record<IndexablePathname, string>;

export function resolveSiteOrigin(
  value = process.env.NEXT_PUBLIC_WEB_URL,
): string {
  const configuredValue = value?.trim() || DEFAULT_SITE_ORIGIN;
  const url = new URL(configuredValue);

  return url.origin;
}

export function createLocalizedUrl(
  siteOrigin: string,
  pathname: LocalizedPathname,
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
  pathname: LocalizedPathname,
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
  pathname: LocalizedPathname,
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

export function createPageSeoMetadata({
  siteOrigin,
  pathname,
  locale,
  title,
  description,
  siteName,
}: {
  siteOrigin: string;
  pathname: IndexablePathname;
  locale: AppLocale;
  title: string;
  description: string;
  siteName: string;
}): Metadata {
  const alternates = createPageAlternates(siteOrigin, pathname, locale);

  return {
    title,
    description,
    alternates,
    metadataBase: new URL(siteOrigin),
    openGraph: {
      title,
      description,
      url: createLocalizedUrl(siteOrigin, pathname, locale),
      siteName,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
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

    const t = await getTranslations({ locale, namespace: "Seo" });
    const pageKey = SEO_PAGE_KEYS[pathname];

    return createPageSeoMetadata({
      siteOrigin: resolveSiteOrigin(),
      pathname,
      locale,
      title: t(`${pageKey}.title`),
      description: t(`${pageKey}.description`),
      siteName: t("siteName"),
    });
  };
}
