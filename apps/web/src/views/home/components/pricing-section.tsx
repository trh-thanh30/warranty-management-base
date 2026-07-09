"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { pricingPlans, servicePlans } from "../home.constants";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";
import { motionSpring } from "@/src/constants/motion.constants";

export function PricingSection({
  onOpenQuote,
  selectedBrand,
  setSelectedBrand,
  selectedYear,
  setSelectedYear,
  selectedMileage,
  setSelectedMileage,
  onOpenCalculator,
  activeTab,
  setActiveTab,
}: {
  onOpenQuote: (
    plan: { type: "warranty" | "service"; term: string; price: string } | null,
  ) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedMileage: string;
  setSelectedMileage: (mileage: string) => void;
  onOpenCalculator: () => void;
  activeTab: "warranty" | "service";
  setActiveTab: (tab: "warranty" | "service") => void;
}) {
  const { container, fadeUp, scaleIn } = useScrollReveal();
  const shouldReduce = useReducedMotion();

  const enableServiceTab = false;

  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  useEffect(() => {
    if (isComparisonOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isComparisonOpen]);

  const luxuryBrands = [
    "Audi",
    "BMW",
    "Mercedes-Benz",
    "Porsche",
    "Tesla",
    "Jaguar",
    "Lexus",
    "Land Rover",
  ];

  const getBrandMultiplier = (brand: string) => {
    if (!brand) return 1.0;
    return luxuryBrands.includes(brand) ? 1.4 : 1.0;
  };

  const getYearMultiplier = (year: string) => {
    if (!year) return 1.0;
    const yearNum = parseInt(year, 10);
    if (yearNum >= 2023) return 0.9;
    if (yearNum >= 2019) return 1.1;
    return 1.3;
  };

  const getMileageMultiplier = (mileage: string) => {
    if (mileage === "low") return 1.0;
    if (mileage === "medium") return 1.2;
    if (mileage === "high") return 1.4;
    return 1.0;
  };

  const multiplier =
    getBrandMultiplier(selectedBrand) *
    getYearMultiplier(selectedYear) *
    getMileageMultiplier(selectedMileage);
  const hasCalculated = !!(selectedBrand && selectedYear && selectedMileage);

  const handleClearCalculator = () => {
    setSelectedBrand("");
    setSelectedYear("");
    setSelectedMileage("");
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#warranty") {
        setActiveTab("warranty");
      } else if (hash === "#pricing") {
        setActiveTab(enableServiceTab ? "service" : "warranty");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setActiveTab, enableServiceTab]);
  const plans = activeTab === "warranty" ? pricingPlans : servicePlans;

  const defaultPlanIndex = Math.max(
    plans.findIndex((plan) => plan.featured),
    0,
  );
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(defaultPlanIndex);
  const [hoveredPlanIndex, setHoveredPlanIndex] = useState<number | null>(null);

  useEffect(() => {
    const plansList = activeTab === "warranty" ? pricingPlans : servicePlans;
    const defaultIdx = Math.max(
      plansList.findIndex((p) => p.featured),
      0,
    );
    setSelectedPlanIndex(defaultIdx);
  }, [activeTab]);

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

  const selectedBasePrice = selectedPlan
    ? parseInt(selectedPlan.price.replace("$", ""), 10)
    : 0;
  const selectedDisplayPrice =
    hasCalculated && selectedPlan
      ? `$${Math.round(selectedBasePrice * multiplier)}`
      : selectedPlan?.price || "";

  const selectedPlanSummary = selectedPlan
    ? `Selected: ${selectedPlan.term} (${activeTab === "warranty" ? "Warranty" : "Maintenance"}) at ${selectedDisplayPrice}/month.`
    : "Select a plan to continue.";

  const getPlanFeatures = (tab: "warranty" | "service", index: number) => {
    if (tab === "warranty") {
      if (index === 0) {
        return [
          "Engine & gearbox protection",
          "Max claim limit of $3,000",
          "Full diagnostic cover included",
        ];
      }
      if (index === 1) {
        return [
          "Engine, gearbox & electricals",
          "Max claim limit of $4,500",
          "24/7 roadside assistance",
        ];
      }
      return [
        "Full bumper-to-bumper cover",
        "Max claim limit of $5,000",
        "Certified partner network payout",
      ];
    } else {
      if (index === 0) {
        return [
          "Standard oil & filter change",
          "Fluid top-off & inspection",
          "10,000 km service interval",
        ];
      }
      if (index === 1) {
        return [
          "Full diagnostics & scanning",
          "Spark plugs & filter replacement",
          "20,000 km service interval",
        ];
      }
      return [
        "Major tune-up & brake service",
        "AC recharge & safety check",
        "40,000 km service interval",
      ];
    }
  };

  return (
    <section
      id="pricing"
      className="relative mx-auto max-w-[1520px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16"
      aria-label="Pricing plans"
    >
      {/* Invisible anchor to support browser scrolling matching the navbar */}
      <div id="warranty" className="absolute top-0" />
      <div className="relative overflow-hidden text-charcoal">
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
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <p className="text-xs sm:text-sm font-sans font-bold uppercase tracking-[0.25em] text-brand-blue">
              ONE PRICE, COMPLETE COVER
            </p>
            <h2 className="mt-4 text-3xl sm:text-5xl font-condensed font-bold uppercase tracking-wider text-charcoal leading-tight">
              GUARANTEE YOUR VEHICLE AT A LOW COST
            </h2>
            <div className="mt-6 mx-auto h-[3px] w-16 bg-brand-blue" />
            <p className="mt-6 text-sm sm:text-base leading-7 text-graphite max-w-2xl mx-auto font-sans font-medium">
              Every plan includes mechanical claim review, partner workshops and
              clear repair limits before you commit.
            </p>
          </motion.div>

          {hasCalculated && (
            <motion.div
              variants={fadeUp}
              className="mt-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-800 flex justify-between items-center"
            >
              <span>
                Showing estimated prices for your{" "}
                <strong>
                  {selectedBrand} (
                  {selectedYear === "2025"
                    ? "2024-2026"
                    : selectedYear === "2021"
                      ? "2020-2023"
                      : "2016-2019"}
                  )
                </strong>{" "}
                with{" "}
                <strong>
                  {selectedMileage === "low"
                    ? "< 50k"
                    : selectedMileage === "medium"
                      ? "50k-100k"
                      : "> 100k"}{" "}
                  km
                </strong>{" "}
                mileage.
              </span>
              <button
                type="button"
                onClick={handleClearCalculator}
                className="text-xs font-semibold text-brand-blue hover:underline cursor-pointer ml-4 shrink-0"
              >
                Reset
              </button>
            </motion.div>
          )}

          {/* Cards */}
          {/* Tab Switcher */}
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {enableServiceTab && (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTabChange("service")}
                  className={`rounded-full px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-bold font-sans uppercase tracking-wider transition-all duration-300 cursor-pointer border whitespace-nowrap ${
                    activeTab === "service"
                      ? "bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/15"
                      : "bg-white border-cloud text-pewter hover:border-brand-blue/30 hover:text-charcoal"
                  }`}
                >
                  Scheduled Servicing
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("warranty")}
                  className={`rounded-full px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-bold font-sans uppercase tracking-wider transition-all duration-300 cursor-pointer border whitespace-nowrap ${
                    activeTab === "warranty"
                      ? "bg-brand-blue border-brand-blue text-white shadow-md shadow-brand-blue/15"
                      : "bg-white border-cloud text-pewter hover:border-brand-blue/30 hover:text-charcoal"
                  }`}
                >
                  Warranty Cover
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onOpenCalculator}
              className="rounded-full px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-bold font-sans uppercase tracking-wider transition-all duration-300 cursor-pointer border bg-white border-cloud text-pewter hover:border-brand-blue/30 hover:text-brand-blue hover:bg-brand-blue/5 whitespace-nowrap"
            >
              Personalize Rates
            </button>
          </motion.div>

          <motion.div
            key={activeTab}
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-10 grid gap-5 md:grid-cols-3"
          >
            {plans.map((plan, i) => {
              const isVisualActive = hoveredPlanIndex === i;
              const basePrice = parseInt(plan.price.replace("$", ""), 10);
              const displayPrice = hasCalculated
                ? `$${Math.round(basePrice * multiplier)}`
                : plan.price;
              return (
                <motion.article
                  style={{ height: 520 }}
                  key={plan.term}
                  onMouseEnter={() => {
                    setHoveredPlanIndex(i);
                    setSelectedPlanIndex(i);
                  }}
                  onMouseLeave={() => setHoveredPlanIndex(null)}
                  variants={scaleIn}
                  transition={
                    shouldReduce
                      ? { duration: 0 }
                      : { ...motionSpring.soft, delay: i * 0.08 }
                  }
                  animate={
                    isVisualActive && !shouldReduce ? { y: -2 } : { y: 0 }
                  }
                  whileHover={shouldReduce ? undefined : { y: -2 }}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-[24px] border p-6 lg:p-7 text-left outline-none transition-all duration-[330ms] ${
                    isVisualActive
                      ? "border-brand-blue bg-white shadow-xl"
                      : "border-cloud bg-white"
                  }`}
                >
                  {/* Top Colored Header Box */}
                  <div
                    className={`rounded-[16px] p-6 transition-colors duration-[330ms] select-none ${
                      isVisualActive
                        ? "bg-brand-blue text-white"
                        : "bg-brand-blue/10 text-brand-blue"
                    }`}
                  >
                    <h3
                      className={`text-2xl font-condensed font-bold uppercase tracking-wider ${isVisualActive ? "text-white" : "text-brand-blue"}`}
                    >
                      {plan.term}
                    </h3>
                    <p
                      className={`mt-1 text-[11px] font-condensed font-medium uppercase tracking-widest ${isVisualActive ? "text-white/80" : "text-brand-blue/75"}`}
                    >
                      {plan.note}
                    </p>
                    <p
                      className={`mt-6 text-4xl font-condensed font-bold ${isVisualActive ? "text-white" : "text-brand-blue"}`}
                    >
                      {displayPrice}
                      <span
                        className={`text-base font-medium ${isVisualActive ? "text-white/80" : "text-brand-blue/80"}`}
                      >
                        /mo
                      </span>
                    </p>
                  </div>

                  {/* Features List */}
                  <ul className="my-8 space-y-5 px-3 flex-grow">
                    {getPlanFeatures(activeTab, i).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start text-sm text-graphite font-sans font-normal"
                      >
                        <span className="text-charcoal text-base shrink-0 mr-3 select-none leading-none">
                          ✓
                        </span>
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Purchase/Select Button */}
                  <button
                    type="button"
                    className="relative inline-flex items-center justify-center overflow-hidden rounded-full border border-brand-blue h-12 min-h-[44px] w-full text-[16px] font-condensed font-bold uppercase tracking-wider text-brand-blue bg-transparent transition-all duration-[500ms] group-hover:text-white hover:scale-105 active:scale-95 shadow-xs cursor-pointer z-10"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedPlanIndex(i);
                      onOpenQuote({
                        type: activeTab,
                        term: plan.term,
                        price: displayPrice,
                      });
                    }}
                  >
                    {/* Rotated square diagonal sweep fill effect - triggered instantly on card hover via CSS */}
                    <span className="absolute w-[200%] aspect-square -top-[50%] -left-[50%] bg-brand-blue rotate-45 translate-y-[120%] translate-x-[120%] transition-transform duration-[700ms] ease-out group-hover:translate-y-0 group-hover:translate-x-0 z-0" />
                    <span className="relative z-10">Get this quote</span>
                  </button>
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

          {/* Coverage Comparison Table */}
          <div className="mt-12 border-t border-cloud/60 pt-8 text-center">
            <button
              type="button"
              onClick={() => setIsComparisonOpen(true)}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-charcoal/20 bg-transparent px-8 py-3.5 text-xs font-condensed font-bold uppercase tracking-wider text-charcoal transition-all duration-[330ms] cursor-pointer shadow-xs"
            >
              {/* Rotated sweep overlay */}
              <span className="absolute w-[200%] aspect-square -top-[50%] -left-[50%] bg-brand-blue rotate-45 translate-y-[120%] translate-x-[120%] transition-transform duration-[500ms] ease-out group-hover:translate-y-0 group-hover:translate-x-0 z-0" />
              <span className="relative z-10 transition-colors duration-[330ms] group-hover:text-white">
                View Detailed Coverage Comparison
              </span>
            </button>

            <AnimatePresence>
              {isComparisonOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                  {/* Backdrop Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsComparisonOpen(false)}
                    className="absolute inset-0 bg-brand-blue/20 backdrop-blur-sm"
                  />

                  {/* Modal Panel */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={motionSpring.snappy}
                    className="relative w-full max-w-4xl bg-white rounded-[24px] border border-cloud shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-cloud px-6 py-5 shrink-0 bg-ash/50 text-left">
                      <div>
                        <h2 className="text-xl font-sans font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                          Detailed Coverage Comparison
                        </h2>
                        <p className="text-xs text-pewter mt-1">
                          Compare component coverage, claim limits, and benefits
                          across plans.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsComparisonOpen(false)}
                        aria-label="Close coverage details"
                        className="rounded-full p-2 text-pewter hover:bg-ash hover:text-charcoal transition-colors cursor-pointer border border-cloud bg-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Scrollable Table Container */}
                    <div className="flex-1 overflow-auto p-6">
                      <div className="overflow-x-auto rounded-2xl border border-cloud/60 bg-white shadow-md">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="bg-brand-blue text-white">
                              <th className="p-4 font-sans font-bold uppercase tracking-wider text-xs text-white">
                                Covered Component
                              </th>
                              <th className="p-4 font-sans font-bold uppercase tracking-wider text-xs text-white">
                                Basic Care
                              </th>
                              <th className="p-4 font-sans font-bold uppercase tracking-wider text-xs text-white">
                                Standard Care
                              </th>
                              <th className="p-4 font-sans font-bold uppercase tracking-wider text-xs text-white">
                                Premium Care
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-cloud/40">
                            <tr className="hover:bg-ash/10 transition-colors">
                              <td className="p-4 font-sans font-semibold text-charcoal">
                                Engine Block & Internal Parts
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Full
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Full
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Full
                                </span>
                              </td>
                            </tr>
                            <tr className="hover:bg-ash/10 transition-colors">
                              <td className="p-4 font-sans font-semibold text-charcoal">
                                Gearbox & Transmission System
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Full
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Full
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Full
                                </span>
                              </td>
                            </tr>
                            <tr className="hover:bg-ash/10 transition-colors">
                              <td className="p-4 font-sans font-semibold text-charcoal">
                                Air Conditioning & HVAC
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-400 border border-slate-100">
                                  — Not covered
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Full
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Full
                                </span>
                              </td>
                            </tr>
                            <tr className="hover:bg-ash/10 transition-colors">
                              <td className="p-4 font-sans font-semibold text-charcoal">
                                Advanced Electrical & ECU
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-400 border border-slate-100">
                                  — Not covered
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-brand-blue border border-blue-100">
                                  Limit $1,500
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Full
                                </span>
                              </td>
                            </tr>
                            <tr className="hover:bg-ash/10 transition-colors">
                              <td className="p-4 font-sans font-semibold text-charcoal">
                                Steering & Suspension Parts
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-400 border border-slate-100">
                                  — Not covered
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-400 border border-slate-100">
                                  — Not covered
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Full
                                </span>
                              </td>
                            </tr>
                            <tr className="hover:bg-ash/10 transition-colors">
                              <td className="p-4 font-sans font-semibold text-charcoal">
                                Wear & Tear (Brakes, Spark Plugs)
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-400 border border-slate-100">
                                  — Not covered
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-400 border border-slate-100">
                                  — Not covered
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Full (Service Pack)
                                </span>
                              </td>
                            </tr>
                            <tr className="hover:bg-ash/10 transition-colors">
                              <td className="p-4 font-sans font-semibold text-charcoal">
                                Roadside Assistance & Towing
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Included
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Included
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                  ✓ Included
                                </span>
                              </td>
                            </tr>
                            <tr className="bg-brand-blue/[0.02]">
                              <td className="p-4 font-sans font-bold text-charcoal">
                                Annual Claim Limit Cap
                              </td>
                              <td className="p-4 font-sans font-bold text-charcoal">
                                $3,000
                              </td>
                              <td className="p-4 font-sans font-bold text-charcoal">
                                $4,500
                              </td>
                              <td className="p-4 font-sans font-bold text-charcoal">
                                $5,000
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
