"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@repo/ui/button";
import { pricingPlans, servicePlans, carHeroImage } from "../home.constants";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";
import {
  motionDuration,
  motionEase,
  motionSpring,
} from "@/src/constants/motion.constants";

export function PricingSection({
  onOpenQuote,
}: {
  onOpenQuote: (
    plan: { type: "warranty" | "service"; term: string; price: string } | null,
  ) => void;
}) {
  const { container, fadeUp, scaleIn } = useScrollReveal();
  const shouldReduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"warranty" | "service">("service");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#warranty") {
        setActiveTab("warranty");
      } else if (hash === "#pricing") {
        setActiveTab("service");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
  const plans = activeTab === "warranty" ? pricingPlans : servicePlans;

  const defaultPlanIndex = Math.max(
    plans.findIndex((plan) => plan.featured),
    0,
  );
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(defaultPlanIndex);
  const selectedPlan =
    plans[selectedPlanIndex] ?? plans[defaultPlanIndex] ?? plans[0];

  const handleTabChange = (tab: "warranty" | "service") => {
    setActiveTab(tab);
    const plansList = tab === "warranty" ? pricingPlans : servicePlans;
    const defaultIdx = Math.max(
      plansList.findIndex((p) => p.featured),
      0,
    );
    setSelectedPlanIndex(defaultIdx);
  };

  const selectedPlanSummary = selectedPlan
    ? `Selected: ${selectedPlan.term} (${activeTab === "warranty" ? "Warranty" : "Maintenance"}) at ${selectedPlan.price}/month.`
    : "Select a plan to continue.";

  return (
    <section
      id="pricing"
      className="relative mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16"
      aria-label="Pricing plans"
    >
      {/* Invisible anchor to support browser scrolling matching the navbar */}
      <div id="warranty" className="absolute top-0" />
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0a1628] p-5 text-white border border-slate-800 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)] sm:p-8 lg:p-12">
        <Image
          src={carHeroImage.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 1440px, 100vw"
          className="object-cover object-center opacity-10"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(11,125,255,0.35),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative"
        >
          {/* Header */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#9ed5ff]">
                One price, complete cover
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Guarantee your vehicle for years at a small cost
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Every plan includes mechanical claim review, partner workshops and
              clear repair limits before you commit.
            </p>
          </motion.div>

          {/* Cards */}
          {/* Tab Switcher */}
          <motion.div variants={fadeUp} className="mt-8 flex justify-center">
            <div className="relative flex rounded-full bg-slate-950/80 p-1 border border-white/5 shadow-2xl">
              <button
                type="button"
                onClick={() => handleTabChange("service")}
                className={`relative rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === "service"
                    ? "bg-[#0b7dff] text-white shadow-lg shadow-[#0b7dff]/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Scheduled Servicing
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("warranty")}
                className={`relative rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === "warranty"
                    ? "bg-[#0b7dff] text-white shadow-lg shadow-[#0b7dff]/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Warranty Cover
              </button>
            </div>
          </motion.div>

          <motion.div
            key={activeTab}
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-10 grid gap-5 md:grid-cols-3"
          >
            {plans.map((plan, i) => {
              const isSelected = selectedPlanIndex === i;
              return (
                <motion.article
                  style={{ height: 480 }}
                  key={plan.term}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`Select ${plan.term} warranty plan`}
                  onClick={() => setSelectedPlanIndex(i)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedPlanIndex(i);
                    }
                  }}
                  variants={scaleIn}
                  transition={
                    shouldReduce
                      ? { duration: 0 }
                      : { ...motionSpring.soft, delay: i * 0.08 }
                  }
                  animate={
                    isSelected && !shouldReduce
                      ? { y: -6, scale: 1.015 }
                      : { y: 0, scale: 1 }
                  }
                  whileHover={
                    shouldReduce ? undefined : { y: isSelected ? -6 : -4 }
                  }
                  whileTap={shouldReduce ? undefined : { scale: 0.99 }}
                  className={`relative flex flex-col cursor-pointer overflow-hidden rounded-[1.75rem] border p-6 text-left backdrop-blur-sm outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#9ed5ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628] ${
                    isSelected
                      ? "border-[#9ed5ff] bg-[#0b7dff]/24 shadow-[0_0_44px_rgba(11,125,255,0.28)]"
                      : plan.featured
                        ? "border-[#69b7ff]/70 bg-[#0b7dff]/16 shadow-[0_0_32px_rgba(11,125,255,0.16)]"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  {(plan.featured || isSelected) && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-[#0b7dff]/16 to-transparent"
                      initial={false}
                      animate={{ opacity: isSelected ? 1 : 0.65 }}
                      transition={{
                        duration: motionDuration.normal,
                        ease: motionEase.out,
                      }}
                    />
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold">{plan.term}</h3>
                    {(plan.featured || isSelected) && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${isSelected ? "bg-[#9ed5ff] text-slate-950" : "bg-white text-slate-950"}`}
                      >
                        {isSelected ? "Selected" : "Recommended"}
                      </span>
                    )}
                  </div>

                  <p className="mt-7 text-5xl font-semibold tracking-tight">
                    {plan.price}
                    <span className="text-base font-medium text-slate-400">
                      /month
                    </span>
                  </p>

                  <p className="mt-3 min-h-10 text-sm leading-6 text-slate-400">
                    {plan.note}
                  </p>

                  <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>
                        {activeTab === "warranty"
                          ? "Max claim limit"
                          : "Included scope"}
                      </span>
                      <span className="font-semibold text-white">
                        {activeTab === "warranty"
                          ? i === 0
                            ? "$3,000"
                            : i === 1
                              ? "$4,500"
                              : "$5,000"
                          : i === 0
                            ? "Oil & Filters"
                            : i === 1
                              ? "Full Diagnostics"
                              : "Major Tune-up"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {activeTab === "warranty"
                          ? "Diagnostic cover"
                          : "Interval scope"}
                      </span>
                      <span className="font-semibold text-white">
                        {activeTab === "warranty"
                          ? "Full Cover"
                          : i === 0
                            ? "10k km"
                            : i === 1
                              ? "20k km"
                              : "40k km"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant={isSelected ? "secondary" : "primary"}
                    className="mt-auto h-12 min-h-[44px] w-full rounded-full cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedPlanIndex(i);
                      onOpenQuote({
                        type: activeTab,
                        term: plan.term,
                        price: plan.price,
                      });
                    }}
                  >
                    {isSelected ? "Get this quote" : "Select plan"}
                  </Button>
                </motion.article>
              );
            })}
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-center text-xs text-slate-500"
          >
            {selectedPlanSummary} Final price may vary depending on vehicle
            model, age and mileage.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
