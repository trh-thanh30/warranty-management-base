"use client";

import { ArrowLeft, Home } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SiteLogo } from "@/src/components/layout/components/site-logo";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";

export function PublicNotFound() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("PublicRouteStates");
  const routePath = `/${locale}${pathname === "/" ? "" : pathname}`;

  return (
    <main className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center overflow-hidden bg-surface-muted px-6 py-16 text-deep-black sm:px-10">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-premium-red"
      />
      <section className="relative w-full max-w-4xl text-center">
        <div className="inline-flex w-full max-w-[calc(100vw-3rem)] items-center gap-2 overflow-hidden rounded-full border border-premium-red/25 bg-white px-4 py-2 text-sm text-stone-gray shadow-sm sm:max-w-xl">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-premium-red"
          />
          <span className="shrink-0">{t("unknownRoute")}</span>
          <span aria-hidden="true" className="text-premium-red/40">
            ·
          </span>
          <code className="min-w-0 flex-1 truncate font-mono text-deep-black">
            {routePath}
          </code>
        </div>

        <div className="mt-12 flex items-center gap-4 sm:gap-8">
          <span aria-hidden="true" className="h-px flex-1 bg-premium-red/30" />
          <p className="font-condensed text-8xl font-black leading-none tracking-[0.06em] text-premium-red sm:text-9xl">
            404
          </p>
          <span aria-hidden="true" className="h-px flex-1 bg-premium-red/30" />
        </div>

        <h1 className="mt-12 text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-stone-gray sm:text-lg">
          {t("description")}
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-button border border-premium-red bg-white px-5 text-sm font-semibold text-premium-red transition-colors hover:bg-premium-red hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
            onClick={() => router.back()}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t("back")}
          </button>
          <Link
            className="inline-flex h-11 items-center justify-center gap-2 rounded-button bg-premium-red px-5 text-sm font-semibold text-white transition-colors hover:bg-warm-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
            href="/"
          >
            <Home aria-hidden="true" className="size-4" />
            {t("home")}
          </Link>
        </div>

        <div className="mt-14 flex justify-center">
          <SiteLogo
            alt="FUJITEK Việt Nam"
            className="h-10 w-auto opacity-80"
            height={40}
            width={200}
          />
        </div>
      </section>
    </main>
  );
}
