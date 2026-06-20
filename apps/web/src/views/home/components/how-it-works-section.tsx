"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb, Cog, CheckCircle2 } from "lucide-react";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";

const stepsData = [
  {
    step: "STEP 1",
    title: "IDENTIFY ISSUES",
    description:
      "Conduct a detailed inspection to accurately diagnose the vehicle's problems, ensuring no issue goes unnoticed.",
    icon: <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.2]" />,
  },
  {
    step: "STEP 2",
    title: "PREPARE SOLUTION",
    description:
      "Develop a comprehensive, customized repair plan to address the identified issues efficiently.",
    icon: <Lightbulb className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.2]" />,
  },
  {
    step: "STEP 3",
    title: "START WORKING",
    description:
      "Begin the repair process with expert craftsmanship, focusing on precision and quality at every step.",
    icon: <Cog className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.2]" />,
  },
  {
    step: "STEP 4",
    title: "DELIVER ON HAND",
    description:
      "Complete the repairs and hand over your vehicle in optimal condition, ready for the road.",
    icon: <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.2]" />,
  },
];

export function HowItWorksSection() {
  const { fadeUp } = useScrollReveal();

  return (
    <section
      id="how-it-works"
      className="mx-auto flex w-full max-w-[1440px] flex-col justify-center px-5 py-24 sm:px-8 lg:px-12 bg-ash"
      aria-label="How it works"
    >
      <div className="flex flex-col items-center">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-sm lg:text-base font-sans font-bold uppercase tracking-[0.18em] sm:tracking-[0.25em] text-brand-blue whitespace-nowrap">
            <span>OUR WORK PROCESS</span>
            <span className="text-charcoal/40 font-sans">•</span>
            <span>STEP</span>
          </div>
          <h2 className="mt-4 text-3xl font-condensed font-bold uppercase tracking-wider text-charcoal sm:text-5xl lg:text-6xl max-w-none">
            HOW WE WORKS FOR YOU!
          </h2>
          <div className="mt-6 mx-auto h-[3px] w-16 bg-brand-blue" />
        </motion.div>

        {/* Wider Staggered Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-7xl mx-auto px-4 mt-4">
          {stepsData.map((item, index) => {
            // Apply staggered translation on desktop for up-down-up-down effect
            const desktopStaggerClass =
              index % 2 === 1 ? "lg:translate-y-8" : "lg:-translate-y-2";

            return (
              <motion.article
                key={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className={`flex flex-col items-center text-center p-8 sm:p-10 rounded-[24px] bg-white border border-cloud shadow-xs hover:bg-brand-blue hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/20 transition-all duration-[330ms] group ${desktopStaggerClass}`}
              >
                {/* Icon Circular Badge */}
                <div className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-brand-blue text-white shadow-md transition-all duration-300 group-hover:bg-white group-hover:text-brand-blue group-hover:scale-110 mb-6">
                  {item.icon}
                </div>

                {/* Step Label (Montserrat/Sans-serif font) */}
                <span className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-brand-blue group-hover:text-white/80 transition-colors duration-300 mb-3">
                  {item.step}
                </span>

                {/* Title (Condensed font, changes to white on hover) */}
                <h3 className="text-xl sm:text-2xl font-condensed font-bold uppercase tracking-wide text-charcoal group-hover:text-white transition-colors duration-300 mb-4">
                  {item.title}
                </h3>

                {/* Description (Montserrat/Sans-serif font, changes to white/90 on hover) */}
                <p className="text-sm sm:text-base leading-relaxed text-pewter group-hover:text-white/90 transition-colors duration-300 font-sans">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
