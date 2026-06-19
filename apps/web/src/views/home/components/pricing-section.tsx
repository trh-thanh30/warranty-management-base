"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@repo/ui/button";
import { pricingPlans, servicePlans } from "../home.constants";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";
import { motionSpring } from "@/src/constants/motion.constants";

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
      <div className="relative overflow-hidden rounded-xl bg-white p-5 text-charcoal border border-cloud sm:p-8 lg:p-12">
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
              <p className="text-sm font-medium uppercase tracking-wider text-brand-blue">
                One price, complete cover
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-medium leading-tight tracking-normal text-charcoal sm:text-5xl">
                Guarantee your vehicle for years at a small cost
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-graphite">
              Every plan includes mechanical claim review, partner workshops and
              clear repair limits before you commit.
            </p>
          </motion.div>

          {/* Cards */}
          {/* Tab Switcher */}
          <motion.div variants={fadeUp} className="mt-8 flex justify-center">
            <div className="relative flex rounded-[4px] bg-ash p-1 border border-cloud">
              <button
                type="button"
                onClick={() => handleTabChange("service")}
                className={`relative rounded-[4px] px-6 py-2.5 text-xs font-medium uppercase tracking-wider transition-all duration-[330ms] cursor-pointer ${
                  activeTab === "service"
                    ? "bg-white text-charcoal border border-cloud shadow-sm"
                    : "text-pewter hover:text-charcoal"
                }`}
              >
                Scheduled Servicing
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("warranty")}
                className={`relative rounded-[4px] px-6 py-2.5 text-xs font-medium uppercase tracking-wider transition-all duration-[330ms] cursor-pointer ${
                  activeTab === "warranty"
                    ? "bg-white text-charcoal border border-cloud shadow-sm"
                    : "text-pewter hover:text-charcoal"
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
                      ? { y: -2, scale: 1.005 }
                      : { y: 0, scale: 1 }
                  }
                  whileHover={
                    shouldReduce ? undefined : { y: isSelected ? -2 : -1 }
                  }
                  whileTap={shouldReduce ? undefined : { scale: 0.995 }}
                  className={`relative flex flex-col cursor-pointer overflow-hidden rounded-xl border p-6 text-left outline-none transition-colors duration-[330ms] focus-visible:ring-2 focus-visible:ring-brand-blue/30 ${
                    isSelected
                      ? "border-brand-blue bg-brand-blue/5"
                      : plan.featured
                        ? "border-brand-blue/30 bg-ash/50"
                        : "border-cloud bg-white hover:border-pewter"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-medium text-charcoal">
                      {plan.term}
                    </h3>
                    {(plan.featured || isSelected) && (
                      <span
                        className={`rounded-[4px] px-3 py-1 text-xs font-medium ${isSelected ? "bg-brand-blue text-white" : "bg-ash text-graphite"}`}
                      >
                        {isSelected ? "Selected" : "Recommended"}
                      </span>
                    )}
                  </div>

                  <p className="mt-7 text-5xl font-medium tracking-tight text-charcoal">
                    {plan.price}
                    <span className="text-base font-medium text-pewter">
                      /mo
                    </span>
                  </p>

                  <p className="mt-3 min-h-10 text-sm leading-6 text-graphite">
                    {plan.note}
                  </p>

                  <div className="mt-5 space-y-2 border-t border-cloud pt-4 text-xs text-pewter">
                    <div className="flex justify-between">
                      <span>
                        {activeTab === "warranty"
                          ? "Max claim limit"
                          : "Included scope"}
                      </span>
                      <span className="font-medium text-charcoal">
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
                      <span className="font-medium text-charcoal">
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
                    type="button"
                    className={`mt-auto h-12 min-h-[44px] w-full rounded-[4px] cursor-pointer transition-colors duration-[330ms] text-xs font-medium uppercase tracking-wider ${
                      isSelected
                        ? "bg-brand-blue text-white hover:bg-brand-blue/90"
                        : "bg-cloud text-graphite hover:bg-cloud/85"
                    }`}
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
            className="mt-6 text-center text-xs text-pewter"
          >
            {selectedPlanSummary} Final price may vary depending on vehicle
            model, age and mileage.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
