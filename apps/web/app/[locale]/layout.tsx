import { SiteSettingsProvider } from "@/src/app/providers/site-settings-provider";
import { ToastProvider } from "@/src/app/providers/toast-provider";
import { GoogleAnalytics } from "@/src/components/common/google-analytics";
import { PublicQuickChat } from "@/src/components/common/public-quick-chat";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";
import { LenisProvider } from "@/src/components/providers/lenis-provider";
import { QueryProvider } from "@/src/components/providers/query-provider";
import { routing } from "@/src/i18n/routing";
import { resolveSiteOrigin } from "@/src/config/seo.config";
import { getCachedSiteSetting } from "@/src/services/website-config/website-config.service";
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Inter, Maven_Pro, Saira_Condensed } from "next/font/google";
import { notFound } from "next/navigation";
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
            <SiteSettingsProvider siteSettings={siteSettings}>
              <LenisProvider>
                <SiteHeader logoUrl={siteSettings?.headerLogo?.url} />
                <div className="pt-[84px]">{children}</div>
                <SiteFooter siteSettings={siteSettings} />
                <PublicQuickChat siteSettings={siteSettings} />
                <ToastProvider />
              </LenisProvider>
            </SiteSettingsProvider>
          </QueryProvider>
        </NextIntlClientProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
