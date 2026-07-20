import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/src/app/providers/theme-provider";
import { AuthProvider } from "@/src/app/providers/auth-provider";
import { ToastProvider } from "@/src/app/providers/toast-provider";
import { QueryProvider } from "@/src/app/providers/query-provider";
import { routing } from "@/src/i18n/routing";
import "yet-another-react-lightbox/styles.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "Warranty Admin",
  description: "Operational dashboard for warranty management",
};

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
