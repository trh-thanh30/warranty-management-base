"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Car,
  CheckCircle2,
  Clock,
  FileCheck2,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { motionSpring } from "@/src/constants/motion.constants";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";
import { statsItems } from "../home.constants";

const coveredParts = [
  "Engine",
  "Gearbox",
  "Diagnostics",
  "Approved labor",
  "Starter",
  "Steering rack",
];

function AnimatedCounter({
  target,
  suffix,
  duration = 1800,
}: {
  target: number;
  suffix: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = elapsed === 1 ? 1 : 1 - Math.pow(2, -10 * elapsed);
      setCount(Math.floor(eased * target));
      if (elapsed < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return (
    <motion.span
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true, margin: "-60px" }}
    >
      {count.toLocaleString("en-US")}
      {suffix}
    </motion.span>
  );
}

function StatIcon({ label }: { label: string }) {
  const normalized = label.toLowerCase();
  if (normalized.includes("car"))
    return <Car className="h-5 w-5" aria-hidden="true" />;
  if (normalized.includes("claim") || normalized.includes("response"))
    return <Clock className="h-5 w-5" aria-hidden="true" />;
  return <Wrench className="h-5 w-5" aria-hidden="true" />;
}

export function StatsSection() {
  const { container, fadeUp, scaleIn } = useScrollReveal();
  const shouldReduce = useReducedMotion();

  return (
    <section
      className="mx-auto flex h-full w-full max-w-[1440px] flex-col justify-center px-5 py-12 sm:px-8 lg:px-12"
      aria-label="Why Garanty"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="space-y-7"
      >
        <div className="grid overflow-hidden rounded-xl border border-cloud bg-white lg:grid-cols-[1.35fr_0.9fr]">
          <motion.div variants={fadeUp} className="p-6 sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-[4px] border border-brand-blue/15 bg-brand-blue/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-blue">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Mechanical warranty
            </div>

            <h2 className="mt-5 max-w-3xl text-4xl font-medium leading-tight tracking-normal text-charcoal sm:text-5xl">
              Mechanical repair cover from{" "}
              <span className="font-medium text-brand-blue">$36/mo</span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-graphite">
              Protect the repairs that usually hurt ownership costs: engine,
              gearbox, diagnostics, and approved labor through a certified
              workshop network.
            </p>

            <div className="mt-7 grid gap-2.5 sm:grid-cols-2 lg:max-w-2xl">
              {coveredParts.map((label) => (
                <div
                  key={label}
                  className="flex min-h-[44px] items-center gap-3 rounded-[4px] border border-cloud bg-ash px-3.5 text-sm text-graphite"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={scaleIn}
            className="relative flex items-center justify-center border-t border-cloud bg-ash p-6 text-charcoal lg:border-l lg:border-t-0 lg:p-8"
          >
            <motion.div
              whileHover={shouldReduce ? undefined : { y: -2, scale: 1.005 }}
              transition={motionSpring.snappy}
              className="relative w-full max-w-[410px] overflow-hidden rounded-xl border border-cloud bg-white p-6"
            >
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-brand-blue/15 bg-brand-blue/5 text-brand-blue">
                  <FileCheck2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-1.5 rounded-[4px] border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-[4px] bg-emerald-500 animate-pulse" />
                  Quote ready
                </div>
              </div>

              <div className="relative mt-7">
                <p className="text-xs font-medium uppercase tracking-wider text-pewter">
                  Coverage summary
                </p>
                <h3 className="mt-2 text-3xl font-medium tracking-tight text-charcoal">
                  Comprehensive Cover
                </h3>
                <p className="mt-3 text-sm leading-6 text-graphite">
                  Claim review, certified workshop routing, diagnostics, and
                  approved labor are handled in one place.
                </p>
              </div>

              <div className="relative mt-6 grid grid-cols-2 gap-3">
                {[
                  ["Max claim", "$5,000"],
                  ["Response", "24h"],
                  ["Workshops", "350+"],
                  ["Labor", "Approved"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-cloud bg-ash p-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-pewter">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-charcoal">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div variants={scaleIn} className="grid gap-4 md:grid-cols-3">
          {statsItems.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-xl border border-cloud bg-white p-6 transition-all duration-[330ms] hover:border-brand-blue/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cloud bg-ash text-pewter transition-colors duration-[330ms] group-hover:border-brand-blue/30 group-hover:bg-brand-blue/5 group-hover:text-brand-blue">
                  <StatIcon label={stat.label} />
                </div>
                <p className="text-right text-4xl font-medium tracking-tight text-charcoal">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
              </div>
              <p className="mt-5 text-sm font-medium text-charcoal">
                {stat.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-pewter">
                {stat.description}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
