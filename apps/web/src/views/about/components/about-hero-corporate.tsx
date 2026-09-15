"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Award, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { openPublicQuickChat } from "@/src/components/common/public-quick-chat.events";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { Counter } from "@/src/components/animation/counter";
import {
  PUBLIC_DEALER_NETWORK_URL,
  PUBLIC_FEATURES,
} from "@/src/config/public-features.config";

export function AboutHeroCorporate() {
  const t = useTranslations("AboutPage");

  return (
    <section className="relative flex w-full items-center overflow-hidden bg-surface-muted lg:min-h-[calc(100svh-5.25rem)]">
      <div className="grid w-full items-stretch lg:min-h-[calc(100svh-5.25rem)] lg:grid-cols-12">
        {/* Left Column: Padded Content Area (Order 2 on Mobile, Order 1 on Desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="order-2 lg:order-1 lg:col-span-7 xl:col-span-6 px-6 sm:px-12 lg:px-16 xl:px-20 py-8 sm:py-12 lg:py-16 flex flex-col justify-center space-y-6 z-10"
        >
          <div className="inline-flex items-center gap-2 rounded-md bg-premium-red px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-widest text-white shadow-md w-fit">
            <Award className="size-4 shrink-0" />
            <span>{t("hero.eyebrow")}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold uppercase tracking-wide text-deep-black leading-tight">
            <span>{t("hero.titlePrefix")} </span>
            <span className="text-premium-red block sm:inline">
              {t("hero.titleHighlight")}{" "}
            </span>
            <span>{t("hero.titleSuffix")}</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-gray leading-relaxed text-pretty max-w-2xl">
            {t("hero.description")}
          </p>

          {/* 3 Border-Left Stat Cards with Animated Count-up Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-2 pb-4">
            <div className="border-l-2 border-premium-red pl-4 space-y-1">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-premium-red tracking-tight whitespace-nowrap">
                <Counter value={99} suffix="%" />
              </div>
              <p className="text-xs sm:text-xs font-semibold uppercase tracking-wider text-stone-gray leading-snug">
                {t("hero.stats.uvIr")}
              </p>
            </div>

            <div className="border-l-2 border-premium-red pl-4 space-y-1">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-premium-red tracking-tight whitespace-nowrap">
                <Counter value={100} suffix="%" />
              </div>
              <p className="text-xs sm:text-xs font-semibold uppercase tracking-wider text-stone-gray leading-snug">
                {t("hero.stats.origin")}
              </p>
            </div>

            <div className="border-l-2 border-premium-red pl-4 space-y-1">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-premium-red tracking-tight whitespace-nowrap">
                <Counter value={10} suffix={t("hero.stats.yearsSuffix")} />
              </div>
              <p className="text-xs sm:text-xs font-semibold uppercase tracking-wider text-stone-gray leading-snug">
                {t("hero.stats.warranty")}
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            {PUBLIC_FEATURES.pages.products ? (
              <Button
                asChild
                className="h-auto rounded-md bg-premium-red px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-warm-red sm:text-sm"
              >
                <Link href={APP_ROUTES.products}>
                  <span>{t("hero.exploreProductsCta")}</span>
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button
                className="h-auto rounded-md bg-premium-red px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-warm-red sm:text-sm"
                onClick={openPublicQuickChat}
                type="button"
              >
                <span>{t("hero.contactCta")}</span>
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            )}

            <Button
              asChild
              variant="secondary"
              className="h-auto rounded-md border-border-gray bg-white px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-deep-black shadow-sm transition-all hover:bg-light-gray sm:text-sm"
            >
              <a
                href={PUBLIC_DEALER_NETWORK_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{t("hero.dealerNetworkCta")}</span>
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Right Column: Hero Image Showcase (Order 1 on Mobile, Order 2 on Desktop) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative order-1 aspect-video w-full overflow-hidden lg:order-2 lg:col-span-5 lg:aspect-auto lg:min-h-full xl:col-span-6"
        >
          <Image
            src="/hero/hero_5.jpg"
            alt={t("hero.titleHighlight")}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
          {/* Smooth Desktop Left-to-Right Fade */}
          <div className="absolute inset-y-0 left-0 hidden lg:block w-72 bg-gradient-to-r from-surface-muted via-surface-muted/60 to-transparent z-10 pointer-events-none" />
          {/* Smooth Mobile Bottom-to-Top Fade */}
          <div className="absolute inset-x-0 bottom-0 lg:hidden h-20 bg-gradient-to-t from-surface-muted via-surface-muted/60 to-transparent z-10 pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
