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
        <div className="grid overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)] lg:grid-cols-[1.35fr_0.9fr]">
          <motion.div variants={fadeUp} className="p-6 sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0b7dff]/15 bg-[#e9f4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0b7dff]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Mechanical warranty
            </div>

            <h2 className="mt-5 max-w-3xl text-4xl font-light leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem]">
              Mechanical repair cover from{" "}
              <span className="font-normal text-[#0b7dff]">$36/mo</span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Protect the repairs that usually hurt ownership costs: engine,
              gearbox, diagnostics, and approved labor through a certified
              workshop network.
            </p>

            <div className="mt-7 grid gap-2.5 sm:grid-cols-2 lg:max-w-2xl">
              {coveredParts.map((label) => (
                <div
                  key={label}
                  className="flex min-h-[44px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-700"
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
            className="relative flex items-center justify-center border-t border-slate-200 bg-[#f8fafc] p-6 text-slate-950 lg:border-l lg:border-t-0 lg:p-8"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(11,125,255,0.1),transparent_58%)]" />

            <motion.div
              whileHover={shouldReduce ? undefined : { y: -4, scale: 1.01 }}
              transition={motionSpring.snappy}
              className="relative w-full max-w-[410px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.55)]"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#0b7dff]/10 blur-3xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#0b7dff]/15 bg-[#e9f4ff] text-[#0b7dff]">
                  <FileCheck2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Quote ready
                </div>
              </div>

              <div className="relative mt-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Coverage summary
                </p>
                <h3 className="mt-2 text-3xl font-light tracking-tight text-slate-950">
                  Comprehensive Cover
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
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
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
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
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.45)] transition-colors duration-300 hover:border-[#0b7dff]/25"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors duration-300 group-hover:border-[#0b7dff]/25 group-hover:bg-[#e9f4ff] group-hover:text-[#0b7dff]">
                  <StatIcon label={stat.label} />
                </div>
                <p className="text-right text-4xl font-light tracking-tight text-slate-950">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-950">
                {stat.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {stat.description}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
