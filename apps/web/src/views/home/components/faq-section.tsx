"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { faqItems } from "../home.constants";
import { useScrollReveal } from "@/src/hooks/use-scroll-reveal";
import { revealViewportOnce } from "@/src/constants/motion.constants";
import { motionDuration, motionEase } from "@/src/constants/motion.constants";

import { Container } from "@/src/components/common/container";

export function FaqSection() {
  const t = useTranslations("HomePage.faq");
  const { container, fadeUp, scaleIn } = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="w-full py-16" aria-label={t("ariaLabel")}>
      <Container>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={revealViewportOnce}
          className="lg:min-h-[50vh]"
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
                  <span className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-premium-red">
                    {t("eyebrow")}
                  </span>
                </div>
                <h2 className="mt-4 text-4xl sm:text-5xl lg:text-5xl font-semibold uppercase leading-tight tracking-wider text-deep-black">
                  {t("title")}
                </h2>
                <p className="mt-6 max-w-xl text-base sm:text-lg text-stone-gray leading-relaxed">
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
                          ? "rounded-md border-brand-blue bg-white shadow-md"
                          : "rounded-md border-cloud bg-white shadow-xs hover:border-pewter/60"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIdx(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="flex w-full cursor-pointer items-center justify-between gap-5 px-8 py-5 text-left focus-visible:outline-none"
                      >
                        <span className="text-base sm:text-lg font-medium uppercase tracking-wider text-charcoal hover:text-brand-blue transition-colors">
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
                              <p className="text-base text-stone-gray">
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
      </Container>
    </section>
  );
}
