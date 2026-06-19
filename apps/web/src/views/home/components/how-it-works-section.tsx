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
        className="min-h-[72vh] overflow-hidden rounded-xl border border-cloud bg-ash"
      >
        <div className="grid min-h-[72vh] gap-0 lg:grid-cols-[0.82fr_1.18fr]">
          <motion.div
            variants={fadeUp}
            className="flex flex-col justify-center border-b border-cloud bg-white p-7 sm:p-10 lg:border-b-0 lg:border-r lg:p-12"
          >
            <p className="text-sm font-medium uppercase tracking-wider text-brand-blue">
              Simple process
            </p>
            <h2 className="mt-5 text-4xl font-medium leading-tight tracking-normal text-charcoal sm:text-5xl lg:text-[3.5rem]">
              From quote to claim, handled in four clear steps.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-graphite">
              We keep the warranty flow predictable: check eligibility, choose a
              term, activate cover, then let us coordinate approved repairs with
              the workshop.
            </p>

            <div className="mt-10 grid gap-3">
              {processTrustItems.map((item) => (
                <div
                  key={item}
                  className="flex min-h-[48px] items-center gap-3 rounded-[4px] bg-ash px-4 text-base text-graphite"
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
            className="grid min-h-[72vh] gap-px bg-cloud sm:grid-cols-2"
          >
            {howItWorksSteps.map((step, index) => (
              <motion.article
                key={step.step}
                variants={fadeUp}
                transition={{ delay: index * 0.08 }}
                className="group relative flex min-h-[300px] flex-col justify-between bg-white p-7 transition-colors duration-[330ms] hover:bg-brand-blue/5 sm:p-9 lg:min-h-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-charcoal text-white transition-colors duration-[330ms] group-hover:bg-brand-blue">
                    {iconMap[step.icon]}
                  </div>
                  <span className="font-mono text-5xl font-medium text-ash transition-colors duration-[330ms] group-hover:text-brand-blue/20">
                    0{step.step}
                  </span>
                </div>

                <div className="mt-10">
                  <h3 className="text-2xl font-medium tracking-tight text-charcoal">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-graphite">
                    {step.description}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 h-1 w-0 bg-brand-blue transition-all duration-[330ms] group-hover:w-full" />
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
