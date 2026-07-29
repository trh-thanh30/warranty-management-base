"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Microscope, Factory, ClipboardCheck } from "lucide-react";
import { Container } from "@/src/components/common/container";
import {
  aboutCraftsmanshipSpecs,
  aboutCraftsmanshipStats,
} from "../about.constants";

const stepIcons = {
  research: Microscope,
  cleanroom: Factory,
  inspection: ClipboardCheck,
};

export function AboutCraftsmanship() {
  const t = useTranslations("AboutPage");

  return (
    <section className="w-full bg-surface-muted py-20 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Left Column: R&D & Manufacturing Steps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6"
          >
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-premium-red/10 px-4 py-1.5 text-xs sm:text-sm font-semibold uppercase tracking-widest text-premium-red mb-3 font-sans">
                {t("craftsmanship.eyebrow")}
              </span>
              <h2 className="font-condensed text-4xl sm:text-5xl font-bold uppercase tracking-tight text-deep-black leading-tight">
                <span>{t("craftsmanship.titlePrefix")} </span>
                <span className="text-premium-red block">
                  {t("craftsmanship.titleSuffix")}
                </span>
              </h2>
              <p className="font-sans text-sm sm:text-base text-stone-gray leading-relaxed mt-4 text-pretty">
                {t("craftsmanship.description")}
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {aboutCraftsmanshipSpecs.map((specKey) => {
                const IconComponent =
                  stepIcons[specKey as keyof typeof stepIcons] ?? Microscope;

                return (
                  <div
                    key={specKey}
                    className="flex items-start gap-4 rounded-2xl border border-border-gray bg-white p-5 shadow-xs"
                  >
                    <div className="size-12 rounded-xl bg-gradient-to-br from-premium-red to-warm-red flex items-center justify-center text-white shrink-0 shadow-sm">
                      <IconComponent className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-sans text-base font-bold uppercase tracking-wide text-deep-black">
                        {t(`craftsmanship.${specKey}.title`)}
                      </h4>
                      <p className="font-sans text-xs sm:text-sm text-stone-gray leading-relaxed mt-1 text-left text-pretty">
                        {t(`craftsmanship.${specKey}.description`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: 4-Cell Stat Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative"
          >
            <div className="rounded-3xl border border-border-gray bg-white p-8 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                {aboutCraftsmanshipStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="rounded-2xl bg-surface-muted p-6 text-center border border-border-gray/60"
                  >
                    <div className="font-condensed text-3xl sm:text-4xl font-bold text-premium-red mb-1.5">
                      {stat.value}
                    </div>
                    <div className="font-sans text-xs font-semibold uppercase tracking-wider text-stone-gray">
                      {t(`craftsmanship.stats.${stat.id}`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
