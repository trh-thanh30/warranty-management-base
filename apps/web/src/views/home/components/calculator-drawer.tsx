"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { pricingPlans, servicePlans, carBrands } from "../home.constants";
import { Button } from "@repo/ui/button";

interface CalculatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedMileage: string;
  setSelectedMileage: (mileage: string) => void;
  onOpenQuote: (plan: {
    type: "warranty" | "service";
    term: string;
    price: string;
  }) => void;
  activeTab: "warranty" | "service";
  setActiveTab: (tab: "warranty" | "service") => void;
}

export function CalculatorDrawer({
  isOpen,
  onClose,
  selectedBrand,
  setSelectedBrand,
  selectedYear,
  setSelectedYear,
  selectedMileage,
  setSelectedMileage,
  onOpenQuote,
  activeTab,
  setActiveTab,
}: CalculatorDrawerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const plans = activeTab === "warranty" ? pricingPlans : servicePlans;

  const panelVariants = {
    hidden: isMobile ? { y: "100%", x: 0 } : { x: "100%", y: 0 },
    visible: { x: 0, y: 0 },
    exit: isMobile ? { y: "100%", x: 0 } : { x: "100%", y: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-blue/20 backdrop-blur-sm"
          />

          {/* Sliding Panel */}
          <div className="fixed md:absolute inset-0 md:inset-y-0 md:right-0 md:left-auto flex md:max-w-full pointer-events-none justify-end items-end md:items-stretch">
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="pointer-events-auto w-full md:w-screen md:max-w-md bg-white shadow-2xl flex flex-col h-[85vh] md:h-full rounded-t-3xl md:rounded-t-none border-t md:border-t-0 md:border-l border-cloud overflow-hidden"
            >
              {/* Mobile Swipe Handle */}
              {isMobile && (
                <div className="w-full flex justify-center pt-3 pb-1">
                  <div className="w-12 h-1.5 rounded-full bg-cloud/80" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between border-b border-cloud px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold font-condensed uppercase tracking-wider text-charcoal flex items-center gap-2">
                    Price Calculator
                  </h2>
                  <p className="text-xs text-pewter mt-0.5 font-medium">
                    Estimate premium based on your vehicle details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close calculator drawer"
                  className="rounded-full p-2.5 text-pewter hover:bg-ash hover:text-charcoal transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Inputs Card */}
                <div className="rounded-2xl border border-cloud bg-ash/30 p-5 space-y-5">
                  {/* Brand Select */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-sans font-medium uppercase tracking-wider text-pewter">
                      Select Brand
                    </label>
                    <div className="relative">
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="h-13 w-full appearance-none rounded-full border border-cloud bg-white px-6 text-sm font-medium text-charcoal outline-none transition-all hover:border-brand-blue/40 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 cursor-pointer"
                      >
                        <option value="">SELECT BRAND</option>
                        {carBrands.map((b) => (
                          <option key={b.name} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-pewter">
                        <svg
                          className="h-4 w-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Year Select */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-sans font-medium uppercase tracking-wider text-pewter">
                      Production Year
                    </label>
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="h-13 w-full appearance-none rounded-full border border-cloud bg-white px-6 text-sm font-medium text-charcoal outline-none transition-all hover:border-brand-blue/40 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 cursor-pointer"
                      >
                        <option value="">SELECT YEAR</option>
                        <option value="2025">2024 - 2026 (New Vehicle)</option>
                        <option value="2021">2020 - 2023 (Mid-Age)</option>
                        <option value="2017">
                          2016 - 2019 (Older Vehicle)
                        </option>
                      </select>
                      <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-pewter">
                        <svg
                          className="h-4 w-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Mileage Select */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-sans font-medium uppercase tracking-wider text-pewter">
                      Current Mileage
                    </label>
                    <div className="relative">
                      <select
                        value={selectedMileage}
                        onChange={(e) => setSelectedMileage(e.target.value)}
                        className="h-13 w-full appearance-none rounded-full border border-cloud bg-white px-6 text-sm font-medium text-charcoal outline-none transition-all hover:border-brand-blue/40 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 cursor-pointer"
                      >
                        <option value="">SELECT MILEAGE</option>
                        <option value="low">&lt; 50,000 km</option>
                        <option value="medium">50,000 - 100,000 km</option>
                        <option value="high">&gt; 100,000 km</option>
                      </select>
                      <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-pewter">
                        <svg
                          className="h-4 w-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {hasCalculated && (
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-emerald-700 font-medium font-sans">
                        Calculations applied
                      </span>
                      <button
                        type="button"
                        onClick={handleClearCalculator}
                        className="text-[10px] font-semibold text-brand-blue hover:underline cursor-pointer"
                      >
                        Reset Options
                      </button>
                    </div>
                  )}
                </div>

                {/* Estimate feedback banner */}
                {hasCalculated && (
                  <div className="rounded-[4px] bg-emerald-500/10 border border-emerald-500/20 p-3 text-[11px] text-emerald-800 leading-relaxed">
                    Estimates configured for your{" "}
                    <strong>
                      {selectedBrand} (
                      {selectedYear === "2025"
                        ? "2024-2026"
                        : selectedYear === "2021"
                          ? "2020-2023"
                          : "2016-2019"}
                      )
                    </strong>{" "}
                    at{" "}
                    <strong>
                      {selectedMileage === "low"
                        ? "< 50k"
                        : selectedMileage === "medium"
                          ? "50k-100k"
                          : "> 100k"}{" "}
                      km
                    </strong>
                    .
                  </div>
                )}

                {/* Tab Switcher inside Drawer */}
                <div className="space-y-4">
                  <div className="flex border-b border-cloud">
                    <button
                      type="button"
                      onClick={() => setActiveTab("warranty")}
                      className={`flex-1 pb-3 text-xs font-bold font-condensed uppercase tracking-[0.15em] border-b-2 transition-all cursor-pointer ${
                        activeTab === "warranty"
                          ? "border-brand-blue text-brand-blue"
                          : "border-transparent text-pewter hover:text-charcoal"
                      }`}
                    >
                      Warranty plans
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("service")}
                      className={`flex-1 pb-3 text-xs font-bold font-condensed uppercase tracking-[0.15em] border-b-2 transition-all cursor-pointer ${
                        activeTab === "service"
                          ? "border-brand-blue text-brand-blue"
                          : "border-transparent text-pewter hover:text-charcoal"
                      }`}
                    >
                      Servicing plans
                    </button>
                  </div>

                  {/* Calculated Plan List */}
                  <div className="space-y-3">
                    {plans.map((plan) => {
                      const basePrice = parseInt(
                        plan.price.replace("$", ""),
                        10,
                      );
                      const displayPrice = hasCalculated
                        ? `$${Math.round(basePrice * multiplier)}`
                        : plan.price;

                      return (
                        <div
                          key={plan.term}
                          className="rounded-xl border border-cloud bg-white p-5 hover:border-brand-blue/30 hover:shadow-md transition-all flex flex-col justify-between gap-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-base font-bold font-condensed uppercase tracking-wider text-charcoal">
                                {plan.term}
                              </h4>
                              <p className="text-xs text-pewter mt-1 font-medium">
                                {plan.note}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold text-charcoal font-condensed tracking-wide">
                                {displayPrice}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-pewter block">
                                /month
                              </span>
                            </div>
                          </div>

                          <Button
                            type="button"
                            className="w-full bg-brand-blue hover:bg-brand-blue/90 active:scale-95 text-white text-xs font-bold font-condensed uppercase tracking-wider h-11 min-h-[44px] rounded-full cursor-pointer transition-all duration-200 shadow-sm"
                            onClick={() => {
                              onClose();
                              onOpenQuote({
                                type: activeTab,
                                term: plan.term,
                                price: displayPrice,
                              });
                            }}
                          >
                            Get this quote
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
