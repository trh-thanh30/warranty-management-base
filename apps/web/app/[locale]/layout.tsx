import { SiteSettingsProvider } from "@/src/app/providers/site-settings-provider";
import { ToastProvider } from "@/src/app/providers/toast-provider";
import { GoogleAnalytics } from "@/src/components/common/google-analytics";
import { PresenceTracker } from "@/src/components/common/presence-tracker";
import { PublicQuickChat } from "@/src/components/common/public-quick-chat";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { QueryProvider } from "@/src/components/providers/query-provider";
import { resolveSiteOrigin } from "@/src/config/seo.config";
import { routing } from "@/src/i18n/routing";
import { getCachedSiteSetting } from "@/src/services/website-config/website-config.service";
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Inter, Maven_Pro, Saira_Condensed } from "next/font/google";
import { notFound } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import "../globals.css";

const sairaCondensed = Saira_Condensed({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-saira-condensed",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mavenPro = Maven_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-maven-pro",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(resolveSiteOrigin()),
    title: t("title"),
    description: t("description"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const [messages, siteSettings] = await Promise.all([
    getMessages(),
    getCachedSiteSetting(locale).catch(() => null),
  ]);

  return (
    <html
      lang={locale}
      className={`${sairaCondensed.variable} ${inter.variable} ${mavenPro.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <NextTopLoader
              color="var(--color-premium-red)"
              crawlSpeed={180}
              easing="ease-out"
              height={4}
              shadow="0 0 10px var(--color-premium-red)"
              showSpinner={false}
              speed={220}
              zIndex={2147483647}
            />
            <PresenceTracker />
            <SiteSettingsProvider siteSettings={siteSettings}>
              <SiteHeader logoUrl={siteSettings?.headerLogo?.url} />
              {children}
              <SiteFooter siteSettings={siteSettings} />
              <PublicQuickChat siteSettings={siteSettings} />
              <ToastProvider />
            </SiteSettingsProvider>
          </QueryProvider>
        </NextIntlClientProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
