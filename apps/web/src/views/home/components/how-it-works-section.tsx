"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Layers, Search, Shield } from "lucide-react";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";
import { howItWorksSteps } from "../home.constants";

const iconMap: Record<string, React.ReactNode> = {
  search: <Search className="h-6 w-6" aria-hidden="true" />,
  layers: <Layers className="h-6 w-6" aria-hidden="true" />,
  shield: <Shield className="h-6 w-6" aria-hidden="true" />,
  check: <CheckCircle2 className="h-6 w-6" aria-hidden="true" />,
};

const processTrustItems = [
  "No hidden fees",
  "Cancel anytime",
  "24-hour claims response",
  "350+ partner workshops",
];

export function HowItWorksSection() {
  const { container, fadeUp } = useScrollReveal();

  return (
    <section
      id="how-it-works"
      className="mx-auto flex w-full max-w-[1440px] flex-col justify-center px-5 py-12 sm:px-8 lg:px-12"
      aria-label="How it works"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="min-h-[72vh] overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#f8fafc] shadow-[0_28px_85px_-45px_rgba(15,23,42,0.4)]"
      >
        <div className="grid min-h-[72vh] gap-0 lg:grid-cols-[0.82fr_1.18fr]">
          <motion.div
            variants={fadeUp}
            className="flex flex-col justify-center border-b border-slate-200 bg-white p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-12"
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0b7dff]">
              Simple process
            </p>
            <h2 className="mt-5 text-4xl font-light leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-[4.25rem]">
              From quote to claim, handled in four clear steps.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              We keep the warranty flow predictable: check eligibility, choose a
              term, activate cover, then let us coordinate approved repairs with
              the workshop.
            </p>

            <div className="mt-10 grid gap-3">
              {processTrustItems.map((item) => (
                <div
                  key={item}
                  className="flex min-h-[48px] items-center gap-3 rounded-2xl bg-slate-50 px-4 text-base text-slate-700"
                >
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={container}
            className="grid min-h-[72vh] gap-px bg-slate-200 sm:grid-cols-2"
          >
            {howItWorksSteps.map((step, index) => (
              <motion.article
                key={step.step}
                variants={fadeUp}
                transition={{ delay: index * 0.08 }}
                className="group relative flex min-h-[300px] flex-col justify-between bg-white p-7 transition-colors duration-300 hover:bg-[#f9fbff] sm:p-9 lg:min-h-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_14px_30px_-18px_rgba(15,23,42,0.75)] transition-colors duration-300 group-hover:bg-[#0b7dff]">
                    {iconMap[step.icon]}
                  </div>
                  <span className="font-mono text-5xl font-light text-slate-100 transition-colors duration-300 group-hover:text-[#0b7dff]/20">
                    0{step.step}
                  </span>
                </div>

                <div className="mt-10">
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#0b7dff] transition-all duration-300 group-hover:w-full" />
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
