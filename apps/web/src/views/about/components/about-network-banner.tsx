"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/src/components/common/container";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { Counter } from "@/src/components/animation/counter";

const AboutNetworkMap = dynamic(
  () => import("./about-network-map").then((mod) => mod.AboutNetworkMap),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="w-full h-[460px] sm:h-[520px] rounded-2xl animate-pulse bg-surface-muted border border-border-gray/60"
      />
    ),
  },
);

export function AboutNetworkBanner() {
  const t = useTranslations("AboutPage");

  return (
    <section className="relative w-full bg-surface-muted py-20 lg:py-28 overflow-hidden">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Left Column: Headlines, 4 Stats & CTA (6 Columns) */}
          <div className="lg:col-span-6 space-y-8 z-10 lg:pr-6">
            <div className="space-y-3">
              {/* Clean Red Line Eyebrow Tag */}
              <div className="flex items-center gap-3">
                <span className="w-8 h-[2px] bg-premium-red shrink-0" />
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-premium-red">
                  {t("network.eyebrow")}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-deep-black leading-tight">
                <span>{t("network.titlePrefix")} </span>
                <span className="text-premium-red block">
                  {t("network.titleSuffix")}
                </span>
              </h2>
            </div>

            <p className="text-sm sm:text-base text-stone-gray leading-relaxed text-pretty max-w-xl">
              {t("network.description")}
            </p>

            {/* 4 Stats Grid with Animated Count-up Numbers */}
            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="border-l-2 border-premium-red pl-4 space-y-1">
                <div className="text-2xl sm:text-4xl font-bold text-premium-red tracking-tight">
                  <Counter value={100} suffix="+" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-gray">
                  {t("network.stats.dealers")}
                </div>
              </div>

              <div className="border-l-2 border-premium-red pl-4 space-y-1">
                <div className="text-2xl sm:text-4xl font-bold text-premium-red tracking-tight">
                  <Counter value={34} />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-gray">
                  {t("network.stats.provinces")}
                </div>
              </div>

              <div className="border-l-2 border-premium-red pl-4 space-y-1">
                <div className="text-2xl sm:text-4xl font-bold text-premium-red tracking-tight">
                  <Counter value={10} suffix={t("network.stats.yearsSuffix")} />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-gray">
                  {t("network.stats.warrantyYears")}
                </div>
              </div>

              <div className="border-l-2 border-premium-red pl-4 space-y-1">
                <div className="text-2xl sm:text-4xl font-bold text-premium-red tracking-tight">
                  24/7
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-gray">
                  {t("network.stats.support")}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={APP_ROUTES.dealers}
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-premium-red hover:bg-warm-red px-8 py-4 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-all cursor-pointer"
              >
                <span>{t("network.viewDealersCta")}</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>

      {/* Right Column: Full-Bleed OSM Map (Right 50% of Viewport on Desktop) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.8 }}
        className="mt-10 lg:mt-0 lg:absolute lg:top-0 lg:bottom-0 lg:right-0 lg:w-1/2 w-full h-[500px] lg:h-full"
      >
        <AboutNetworkMap />
      </motion.div>
    </section>
  );
}
