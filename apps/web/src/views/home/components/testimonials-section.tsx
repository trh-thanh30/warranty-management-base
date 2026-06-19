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
        className="overflow-hidden rounded-xl border border-cloud bg-white lg:min-h-[72vh]"
      >
        <div className="grid min-h-[inherit] lg:grid-cols-[0.9fr_1.35fr]">
          <motion.div
            variants={fadeUp}
            className="flex flex-col justify-between gap-10 border-b border-cloud bg-ash p-7 sm:p-9 lg:border-b-0 lg:border-r lg:p-12"
          >
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-brand-blue">
                Real stories
              </p>
              <h2 className="mt-4 text-4xl font-medium leading-tight tracking-normal text-charcoal sm:text-5xl lg:text-[3.5rem]">
                Drivers who avoided surprise repair bills.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-graphite lg:text-lg">
                Real claims from everyday drivers, with the repair amount,
                workshop handoff, and cover outcome made easy to compare.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {proofPoints.map((point) => (
                <div
                  key={point.label}
                  className="rounded-lg border border-cloud bg-white p-4"
                >
                  <p className="text-[0.7rem] font-medium uppercase tracking-wider text-pewter">
                    {point.label}
                  </p>
                  <p className="mt-2 text-2xl font-medium tracking-tight text-charcoal">
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
              <article className="flex min-h-[380px] flex-col justify-between rounded-xl border border-brand-blue/25 bg-brand-blue/5 p-6 sm:p-8">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-blue text-white">
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

                  <blockquote className="mt-8 text-2xl font-medium leading-[1.45] tracking-tight text-charcoal sm:text-3xl">
                    &ldquo;{active.quote}&rdquo;
                  </blockquote>
                </div>

                <div className="mt-8 flex flex-col gap-5 border-t border-brand-blue/15 pt-6 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      aria-hidden="true"
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[4px] bg-white text-sm font-semibold text-brand-blue border border-cloud"
                    >
                      {active.avatar}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-charcoal">
                        {active.name}
                      </p>
                      <p className="mt-1 text-sm text-pewter">
                        {active.role} - {active.location}
                      </p>
                      <p className="mt-1 text-sm text-pewter">
                        {active.carModel}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    Claim covered: {active.claimAmount}
                  </div>
                </div>
              </article>

              <aside className="grid gap-4">
                <div className="rounded-lg border border-cloud bg-white p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-sm font-medium uppercase tracking-wider text-pewter">
                    Outcome
                  </p>
                  <p className="mt-2 text-2xl font-medium tracking-tight text-charcoal">
                    Covered repair, no upfront workshop payment.
                  </p>
                </div>

                <div className="rounded-lg border border-cloud bg-white p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-blue/5 text-brand-blue">
                    <Wrench className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-sm font-medium uppercase tracking-wider text-pewter">
                    Workshop
                  </p>
                  <p className="mt-2 text-2xl font-medium tracking-tight text-charcoal">
                    Partner garage coordinated directly by Garanty.
                  </p>
                </div>

                <div className="rounded-lg border border-cloud bg-white p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ash text-graphite">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-sm font-medium uppercase tracking-wider text-pewter">
                    Confidence
                  </p>
                  <p className="mt-2 text-2xl font-medium tracking-tight text-charcoal">
                    Clear claim status and repair cost visibility.
                  </p>
                </div>
              </aside>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="grid gap-4 border-t border-cloud pt-6 lg:grid-cols-[1fr_auto]"
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
                    className={`min-h-[92px] rounded-lg border p-4 text-left transition-all duration-[330ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 ${
                      activeIdx === i
                        ? "border-brand-blue bg-brand-blue/5"
                        : "border-cloud bg-white hover:border-pewter"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-charcoal">
                        {testimonial.name}
                      </p>
                      <span className="shrink-0 rounded-[4px] bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {testimonial.claimAmount}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-pewter">
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
                  className="flex h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-[4px] border border-cloud bg-white text-graphite transition-colors hover:bg-ash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => goTo(activeIdx + 1)}
                  aria-label="Next testimonial"
                  whileTap={shouldReduce ? undefined : { scale: 0.94 }}
                  transition={motionSpring.snappy}
                  className="flex h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-[4px] border border-cloud bg-white text-graphite transition-colors hover:bg-ash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
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
