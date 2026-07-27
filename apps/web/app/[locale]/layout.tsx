import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Saira_Condensed, Inter, Maven_Pro } from "next/font/google";
import { routing } from "@/src/i18n/routing";
import { SiteHeader } from "@/src/components/layout/site-header";
import { SiteFooter } from "@/src/components/layout/site-footer";
import { LenisProvider } from "@/src/components/providers/lenis-provider";
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

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${sairaCondensed.variable} ${inter.variable} ${mavenPro.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <LenisProvider>
            <SiteHeader />
            <div className="pt-[84px]">{children}</div>
            <SiteFooter />
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
