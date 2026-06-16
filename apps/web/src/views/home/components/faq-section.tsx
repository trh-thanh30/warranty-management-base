"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Mail,
  Minus,
  PhoneCall,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { faqItems } from "../home.constants";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";
import { motionDuration, motionEase } from "@/src/constants/motion.constants";

const supportItems = [
  "Coverage starts from day one",
  "Direct billing with partner workshops",
  "Roadside support included on all plans",
];

const quickFacts = [
  { label: "Support", value: "7 days" },
  { label: "Workshops", value: "350+" },
  { label: "Max claim", value: "EUR 5,000" },
];

export function FaqSection() {
  const { container, fadeUp, scaleIn } = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-[1480px] px-5 py-8 sm:px-8 lg:px-12"
      aria-label="Frequently asked questions"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_80px_-55px_rgba(15,23,42,0.55)] lg:min-h-[72vh]"
      >
        <div className="grid min-h-[inherit] lg:grid-cols-[0.9fr_1.35fr]">
          <motion.div
            variants={fadeUp}
            className="flex flex-col justify-between gap-10 border-b border-slate-200 bg-[#f8fafc] p-7 sm:p-9 lg:border-b-0 lg:border-r lg:p-12"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#0b7dff]">
                Got questions?
              </p>
              <h2 className="mt-4 text-4xl font-light leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-[4rem]">
                Answers before you choose a plan.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 lg:text-lg">
                Eligibility, claims, garages, limits, and support are grouped
                here so the warranty flow stays clear before checkout.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e9f4ff] text-[#0b7dff]">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Need a quick answer?
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Our support team can confirm eligibility and claim next
                      steps before you book a repair.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <a
                    href="mailto:support@garanty.com"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-[#0b7dff]/40 hover:text-[#0b7dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b7dff]"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Email support
                  </a>
                  <a
                    href="tel:+33000000000"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#0b7dff] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_32px_-20px_rgba(11,125,255,0.9)] transition-all hover:bg-[#0969d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b7dff]"
                  >
                    <PhoneCall className="h-4 w-4" aria-hidden="true" />
                    Call claims
                  </a>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {quickFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">
                      {fact.label}
                    </p>
                    <p className="mt-2 text-2xl font-light tracking-tight text-slate-950">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={container}
            className="flex min-h-full flex-col justify-between gap-6 p-6 sm:p-8 lg:p-10"
          >
            <div className="space-y-3">
              {faqItems.map((item, i) => {
                const isOpen = openIdx === i;
                return (
                  <motion.div
                    key={item.question}
                    variants={scaleIn}
                    className={`rounded-[1.5rem] border transition-all duration-300 ${
                      isOpen
                        ? "border-[#0b7dff]/25 bg-[#f7fbff] shadow-[0_16px_42px_-34px_rgba(11,125,255,0.7)]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex min-h-[72px] w-full cursor-pointer items-center justify-between gap-5 px-5 py-4 text-left text-base font-semibold text-slate-950 transition-colors hover:text-[#0b7dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0b7dff] sm:px-6"
                    >
                      <span>{item.question}</span>
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                          isOpen
                            ? "border-[#0b7dff] bg-[#0b7dff] text-white"
                            : "border-slate-200 bg-white text-slate-500"
                        }`}
                      >
                        {isOpen ? (
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        )}
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
                          <p className="px-5 pb-6 text-base leading-8 text-slate-600 sm:px-6">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              variants={fadeUp}
              className="grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-3"
            >
              {supportItems.map((item) => (
                <div
                  key={item}
                  className="flex min-h-[64px] items-center gap-3 rounded-2xl bg-slate-50 px-4 text-sm font-medium text-slate-700"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
