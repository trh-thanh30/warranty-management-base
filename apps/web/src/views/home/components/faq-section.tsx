"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { faqItems } from "../home.constants";
import { useScrollReveal } from "@/src/hooks/use-scroll-reveal";
import { revealViewportOnce } from "@/src/constants/motion.constants";
import { motionDuration, motionEase } from "@/src/constants/motion.constants";

export function FaqSection() {
  const t = useTranslations("HomePage.faq");
  const { container, fadeUp, scaleIn } = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-[1720px] px-6 py-16 sm:px-10 lg:px-12"
      aria-label={t("ariaLabel")}
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={revealViewportOnce}
        className="lg:min-h-[50vh] text-charcoal"
      >
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.35fr] lg:items-start">
          {/* Left Column — Title & Description only */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={revealViewportOnce}
            className="flex flex-col gap-6 py-2 lg:pr-8"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.2em] text-brand-blue">
                  {t("eyebrow")}
                </span>
              </div>
              <h2 className="mt-4 text-4xl sm:text-5xl lg:text-5xl font-condensed font-medium uppercase leading-[1.1] tracking-wider text-charcoal">
                {t("title")}
              </h2>
              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-graphite font-sans font-medium">
                {t("description")}
              </p>
            </div>
          </motion.div>

          {/* Right Column — Brand-Colored Capsule Accordion FAQ List */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={revealViewportOnce}
            className="flex min-h-full flex-col justify-between gap-8 lg:pl-8"
          >
            <div className="space-y-4">
              {faqItems.map((item, i) => {
                const isOpen = openIdx === i;
                return (
                  <motion.div
                    key={item}
                    variants={scaleIn}
                    className={`overflow-hidden border transition-all duration-[330ms] ${
                      isOpen
                        ? "rounded-[24px] border-brand-blue bg-white shadow-md"
                        : "rounded-[40px] border-cloud bg-white shadow-xs hover:border-pewter/60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-center justify-between gap-5 px-8 py-5 text-left focus-visible:outline-none"
                    >
                      <span className="font-condensed text-base sm:text-lg font-medium uppercase tracking-wider text-charcoal hover:text-brand-blue transition-colors">
                        {t(`items.${item}.question`)}
                      </span>
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white transition-transform duration-[330ms] ${
                          isOpen
                            ? "rotate-180 bg-brand-blue"
                            : "bg-brand-blue/10 text-brand-blue"
                        }`}
                      >
                        <ArrowDown
                          className={`h-5 w-5 stroke-[2.5] ${isOpen ? "text-white" : "text-brand-blue"}`}
                          aria-hidden="true"
                        />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: motionDuration.normal,
                            ease: motionEase.out,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-6 pr-16">
                            <p className="text-base leading-relaxed text-graphite font-sans font-medium">
                              {t(`items.${item}.answer`)}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
