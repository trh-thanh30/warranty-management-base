import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/src/i18n/routing";
import {
  createPageAlternates,
  resolveSiteOrigin,
} from "@/src/config/seo.config";

export async function generateAboutMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "AboutPage.metadata" });
  const siteOrigin = resolveSiteOrigin();

  return {
    alternates: createPageAlternates(siteOrigin, "/", locale),
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(siteOrigin),
  };
}
