"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { useScrollReveal } from "@/src/hooks/use-scroll-reveal";
import { revealViewportOnce } from "@/src/constants/motion.constants";
import { motion } from "framer-motion";

import { Container } from "@/src/components/common/container";

export function SputterSection() {
  const t = useTranslations("HomePage.sputter");
  const { fadeUp } = useScrollReveal();

  return (
    <section className="w-full py-16 lg:py-24 bg-white">
      <Container className="space-y-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealViewportOnce}
          className="grid gap-12 lg:grid-cols-12 items-center"
        >
          {/* Left Description */}
          <div className="lg:col-span-6 space-y-5">
            <span className="block text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-premium-red">
              {t("eyebrow")}
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold uppercase tracking-wide text-deep-black leading-tight">
              {t("title")}
            </h2>
            <p className="text-base sm:text-lg text-stone-gray leading-relaxed">
              {t.rich("descriptionPrimary", {
                brand: (chunks) => (
                  <strong className="text-premium-red">{chunks}</strong>
                ),
              })}
            </p>
            <p className="text-base sm:text-lg text-stone-gray leading-relaxed">
              {t("descriptionSecondary")}
            </p>

            <div className="pt-2">
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-premium-red sm:bg-deep-black sm:hover:bg-premium-red active:scale-95 text-white px-7 py-3.5 rounded-md text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-md"
              >
                <span>{t("learnMore")}</span>
                <ChevronRight className="size-4" />
              </a>
            </div>
          </div>

          {/* Right Chamber Diagram */}
          <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-md overflow-hidden border border-border-gray bg-deep-black flex items-center justify-center">
            <Image
              src="/hero/hero_2.jpg"
              alt={t("chamberImageAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        </motion.div>

        {/* Sputter Structure & Stat Counters Row */}
        <div className="space-y-10 pt-4">
          {/* Full Viewport Width Banner Image */}
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] aspect-[21/9] sm:aspect-[24/9] lg:aspect-[32/10] overflow-hidden bg-white shadow-sm">
            <Image
              src="/hero/hero.jpg"
              alt={t("structureImageAlt")}
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* 3 Stat Counter Cards (Full-Width 3 Columns Row Underneath Image) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 sm:p-8 rounded-md bg-white border border-border-gray shadow-sm hover:shadow-md transition-shadow">
              <span className="block text-4xl sm:text-6xl font-semibold text-premium-red">
                {t("stats.warrantyValue")}
              </span>
              <span className="block text-xs sm:text-sm font-semibold text-deep-black uppercase tracking-wider mt-2.5">
                {t("stats.warrantyLabel")}
              </span>
            </div>

            <div className="p-6 sm:p-8 rounded-md bg-white border border-border-gray shadow-sm hover:shadow-md transition-shadow">
              <span className="block text-4xl sm:text-6xl font-semibold text-premium-red">
                99%
              </span>
              <span className="block text-xs sm:text-sm font-semibold text-deep-black uppercase tracking-wider mt-2.5">
                {t("stats.uvLabel")}
              </span>
            </div>

            <div className="p-6 sm:p-8 rounded-md bg-white border border-border-gray shadow-sm hover:shadow-md transition-shadow">
              <span className="block text-4xl sm:text-6xl font-semibold text-premium-red">
                98%
              </span>
              <span className="block text-xs sm:text-sm font-semibold text-deep-black uppercase tracking-wider mt-2.5">
                {t("stats.irLabel")}
              </span>
            </div>
          </div>

          {/* 3 Detail Columns */}
          <div className="grid gap-8 md:grid-cols-3 pt-6 border-t border-border-gray">
            <div className="space-y-2">
              <h4 className="text-base sm:text-lg font-semibold uppercase text-deep-black">
                {t("details.warranty.title")}
              </h4>
              <p className="text-sm text-stone-gray leading-relaxed">
                {t("details.warranty.description")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-base sm:text-lg font-semibold uppercase text-deep-black">
                {t("details.uv.title")}
              </h4>
              <p className="text-sm text-stone-gray leading-relaxed">
                {t("details.uv.description")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-base sm:text-lg font-semibold uppercase text-deep-black">
                {t("details.ir.title")}
              </h4>
              <p className="text-sm text-stone-gray leading-relaxed">
                {t("details.ir.description")}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
