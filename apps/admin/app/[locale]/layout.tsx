import { AuthProvider } from "@/src/app/providers/auth-provider";
import { QueryProvider } from "@/src/app/providers/query-provider";
import { ThemeProvider } from "@/src/app/providers/theme-provider";
import { ToastProvider } from "@/src/app/providers/toast-provider";
import { routing } from "@/src/i18n/routing";
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const metadataLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  const t = await getTranslations({ locale: metadataLocale, namespace: "App" });

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
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <AuthProvider>
              <QueryProvider>
                <NextTopLoader
                  color="var(--admin-route-loader-color)"
                  crawlSpeed={180}
                  easing="ease-out"
                  height={3}
                  shadow="0 0 10px var(--admin-route-loader-shadow)"
                  showSpinner={false}
                  speed={220}
                  zIndex={2147483647}
                />
                {children}
                <ToastProvider />
              </QueryProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
