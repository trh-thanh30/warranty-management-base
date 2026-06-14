import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/src/app/providers/theme-provider";
import { routing } from "@/src/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  title: "Booking Admin",
  description: "Operational dashboard for the booking system base",
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
            <NextTopLoader
              color="#2563eb"
              crawlSpeed={180}
              easing="ease-out"
              height={3}
              shadow="0 0 10px rgba(37, 99, 235, 0.35)"
              showSpinner={false}
              speed={220}
              zIndex={2147483647}
            />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
