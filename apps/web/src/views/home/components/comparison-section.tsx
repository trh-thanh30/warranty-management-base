"use client";

import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/src/hooks/use-scroll-reveal";
import { revealViewportOnce } from "@/src/constants/motion.constants";
import { motion } from "framer-motion";

export function ComparisonSection() {
  const t = useTranslations("HomePage.comparison");
  const { fadeUp } = useScrollReveal();

  return (
    <section className="w-full py-16 lg:py-24 bg-white border-b border-border-gray">
      <div className="mx-auto max-w-[1720px] px-6 sm:px-10 lg:px-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealViewportOnce}
          className="grid gap-12 lg:grid-cols-12 items-center"
        >
          {/* Left Summary */}
          <div className="lg:col-span-5 space-y-4">
            <span className="inline-block bg-premium-red/10 text-premium-red border border-premium-red/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em]">
              {t("eyebrow")}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-condensed font-semibold uppercase text-deep-black">
              FUJITEK FILMS
            </h2>
            <p className="text-base sm:text-lg text-stone-gray font-medium leading-relaxed">
              {t("description")}
            </p>
            <div className="pt-2">
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-premium-red hover:bg-warm-red text-white px-7 py-3.5 rounded-[12px] text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors duration-300 shadow-md cursor-pointer"
              >
                <span>{t("bookNow")}</span>
                <ChevronRight className="size-4" />
              </a>
            </div>
          </div>

          {/* Right Comparison Columns */}
          <div className="lg:col-span-7 grid gap-6 sm:grid-cols-2">
            {/* Common Film (❌) */}
            <div className="p-7 sm:p-8 rounded-[24px] bg-premium-red/5 border border-premium-red/20 space-y-4">
              <div className="flex items-center gap-3">
                <XCircle className="size-8 text-premium-red shrink-0" />
                <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black">
                  {t("standard.title")}
                </h3>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-stone-gray font-semibold">
                <li className="flex items-start gap-2">
                  <span className="text-premium-red font-medium">•</span>
                  <span>{t("standard.items.heat")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-premium-red font-medium">•</span>
                  <span>{t("standard.items.glare")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-premium-red font-medium">•</span>
                  <span>{t("standard.items.signal")}</span>
                </li>
              </ul>
            </div>

            {/* FUJITEK Film (✅) */}
            <div className="p-7 sm:p-8 rounded-[24px] bg-surface-muted/60 border-2 border-premium-red space-y-4 shadow-lg relative">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-8 text-premium-red shrink-0" />
                <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black">
                  FUJITEK Films
                </h3>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-deep-black font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-premium-red font-medium">•</span>
                  <span>{t("fujitek.items.protection")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-premium-red font-medium">•</span>
                  <span>{t("fujitek.items.signal")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-premium-red font-medium">•</span>
                  <span>{t("fujitek.items.warranty")}</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
