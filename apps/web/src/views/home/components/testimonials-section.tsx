"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Quote,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import { testimonials } from "../home.constants";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";
import { motionSpring } from "@/src/constants/motion.constants";

const proofPoints = [
  { label: "Claims covered", value: "EUR 8,850" },
  { label: "Average response", value: "24-48h" },
  { label: "Driver rating", value: "5.0/5" },
];

export function TestimonialsSection() {
  const { container, fadeUp, scaleIn } = useScrollReveal();
  const [activeIdx, setActiveIdx] = useState(0);
  const shouldReduce = useReducedMotion();
  const total = testimonials.length;
  const active = testimonials[activeIdx];

  if (!active) {
    return null;
  }

  function goTo(idx: number) {
    setActiveIdx((idx + total) % total);
  }

  return (
    <section
      className="mx-auto w-full max-w-[1480px] px-5 py-8 sm:px-8 lg:px-12"
      aria-label="Customer testimonials"
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
                Real stories
              </p>
              <h2 className="mt-4 text-4xl font-light leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-[4rem]">
                Drivers who avoided surprise repair bills.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 lg:text-lg">
                Real claims from everyday drivers, with the repair amount,
                workshop handoff, and cover outcome made easy to compare.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {proofPoints.map((point) => (
                <div
                  key={point.label}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">
                    {point.label}
                  </p>
                  <p className="mt-2 text-2xl font-light tracking-tight text-slate-950">
                    {point.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex min-h-full flex-col justify-between gap-6 p-6 sm:p-8 lg:p-10">
            <motion.div
              key={active.id}
              variants={scaleIn}
              initial="hidden"
              animate="show"
              className="grid flex-1 gap-6 lg:grid-cols-[1fr_0.72fr]"
            >
              <article className="flex min-h-[380px] flex-col justify-between rounded-[1.75rem] border border-[#0b7dff]/20 bg-[#f7fbff] p-6 shadow-[0_20px_60px_-42px_rgba(11,125,255,0.6)] sm:p-8">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0b7dff] text-white shadow-[0_14px_32px_-18px_rgba(11,125,255,0.8)]">
                      <Quote className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div
                      className="flex gap-1"
                      aria-label={`${active.rating} out of 5 stars`}
                    >
                      {Array.from({ length: active.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>

                  <blockquote className="mt-8 text-2xl font-light leading-[1.45] tracking-tight text-slate-950 sm:text-3xl">
                    &ldquo;{active.quote}&rdquo;
                  </blockquote>
                </div>

                <div className="mt-8 flex flex-col gap-5 border-t border-[#0b7dff]/10 pt-6 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      aria-hidden="true"
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0b7dff] shadow-sm"
                    >
                      {active.avatar}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-950">
                        {active.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {active.role} - {active.location}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {active.carModel}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    Claim covered: {active.claimAmount}
                  </div>
                </div>
              </article>

              <aside className="grid gap-4">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Outcome
                  </p>
                  <p className="mt-2 text-2xl font-light tracking-tight text-slate-950">
                    Covered repair, no upfront workshop payment.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e9f4ff] text-[#0b7dff]">
                    <Wrench className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Workshop
                  </p>
                  <p className="mt-2 text-2xl font-light tracking-tight text-slate-950">
                    Partner garage coordinated directly by Garanty.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Confidence
                  </p>
                  <p className="mt-2 text-2xl font-light tracking-tight text-slate-950">
                    Clear claim status and repair cost visibility.
                  </p>
                </div>
              </aside>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="grid gap-4 border-t border-slate-200 pt-6 lg:grid-cols-[1fr_auto]"
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {testimonials.map((testimonial, i) => (
                  <motion.button
                    key={testimonial.id}
                    type="button"
                    onClick={() => goTo(i)}
                    whileHover={shouldReduce ? undefined : { y: -2 }}
                    whileTap={shouldReduce ? undefined : { scale: 0.98 }}
                    aria-pressed={activeIdx === i}
                    className={`min-h-[92px] rounded-2xl border p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b7dff] ${
                      activeIdx === i
                        ? "border-[#0b7dff]/35 bg-[#f7fbff] shadow-[0_16px_38px_-28px_rgba(11,125,255,0.75)]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {testimonial.name}
                      </p>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {testimonial.claimAmount}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {testimonial.carModel}
                    </p>
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center justify-start gap-2 lg:justify-end">
                <motion.button
                  type="button"
                  onClick={() => goTo(activeIdx - 1)}
                  aria-label="Previous testimonial"
                  whileTap={shouldReduce ? undefined : { scale: 0.94 }}
                  transition={motionSpring.snappy}
                  className="flex h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b7dff]"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => goTo(activeIdx + 1)}
                  aria-label="Next testimonial"
                  whileTap={shouldReduce ? undefined : { scale: 0.94 }}
                  transition={motionSpring.snappy}
                  className="flex h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b7dff]"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
