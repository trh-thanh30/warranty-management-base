"use client";

import { useState } from "react";
import { HeroSection } from "./components/hero-section";
// import { StatsSection } from "./components/stats-section";
import { HowItWorksSection } from "./components/how-it-works-section";
// import { PricingSection } from "./components/pricing-section";
// import { TestimonialsSection } from "./components/testimonials-section";
import { FaqSection } from "./components/faq-section";
import { CtaSection } from "./components/cta-section";
// import { QuoteModal } from "./components/quote-modal";
import { LookupSection } from "./components/lookup-section";
// import { CalculatorDrawer } from "./components/calculator-drawer";
import { AboutSection } from "./components/about-section";
// import { SolutionsSection } from "./components/solutions-section";
// import { ServiceBanner } from "./components/service-banner";
// import { RequestSection } from "./components/request-section";

export function HomeView() {
  // Unused state variables due to warranty calculator & pricing removal
  // const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  // const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  // const [selectedBrand, setSelectedBrand] = useState("");
  // const [selectedYear, setSelectedYear] = useState("");
  // const [selectedMileage, setSelectedMileage] = useState("");
  // const [activeTab, setActiveTab] = useState<"warranty" | "service">("warranty");
  // const [selectedPlan, setSelectedPlan] = useState<{
  //   type: "warranty" | "service";
  //   term: string;
  //   price: string;
  // } | null>(null);

  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [activeHubTab, setActiveHubTab] = useState<
    "lookup" | "activate" | "claim"
  >("lookup");

  // const handleOpenQuote = (
  //   plan: { type: "warranty" | "service"; term: string; price: string } | null,
  // ) => {
  //   setSelectedPlan(plan);
  //   setIsQuoteModalOpen(true);
  // };

  const handleOpenHub = (tab: "lookup" | "activate" | "claim") => {
    const el = document.getElementById("lookup");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(() => {
      setActiveHubTab(tab);
      setIsHubModalOpen(true);
    }, 850);
  };

  return (
    <main className="overflow-x-hidden bg-white text-charcoal">
      {/* Floating Calculator Tag */}
      {/* <button
        onClick={() => setIsCalculatorOpen(true)}
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 hidden md:flex items-center rounded-l-[16px] bg-brand-blue py-6 px-3.5 text-white shadow-[0_4px_20px_rgba(62,106,225,0.35)] transition-all hover:pl-5 duration-300 cursor-pointer"
        aria-label="Open Price Calculator"
      >
        <span className="text-[12px] font-bold uppercase tracking-[0.18em] [writing-mode:vertical-lr] rotate-180">
          CALCULATE PRICE
        </span>
      </button> */}

      <HeroSection onOpenHub={handleOpenHub} />
      {/* <StatsSection /> */}
      <AboutSection onOpenHub={handleOpenHub} />
      {/* <SolutionsSection /> */}

      <div className="flex min-h-screen flex-col justify-center bg-ash">
        <HowItWorksSection />
      </div>

      {/* <ServiceBanner /> */}

      {/* <div className="flex min-h-screen flex-col justify-center bg-white border-b border-cloud">
        <PricingSection
          onOpenQuote={handleOpenQuote}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMileage={selectedMileage}
          setSelectedMileage={setSelectedMileage}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div> */}

      {/* <div className="flex min-h-screen flex-col justify-center bg-ash border-b border-cloud">
        <RequestSection />
      </div> */}

      <LookupSection
        isModalOpen={isHubModalOpen}
        setIsModalOpen={setIsHubModalOpen}
        activeTab={activeHubTab}
        setActiveTab={setActiveHubTab}
      />

      {/* <div className="flex min-h-screen flex-col justify-center bg-slate-50">
        <TestimonialsSection />
      </div> */}

      <div className="flex min-h-screen flex-col justify-center bg-ash">
        <FaqSection />
      </div>

      <CtaSection />

      {/* <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        selectedPlan={selectedPlan}
        defaultBrand={selectedBrand}
        defaultYear={selectedYear}
        defaultMileage={selectedMileage}
      /> */}

      {/* <CalculatorDrawer
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMileage={selectedMileage}
        setSelectedMileage={setSelectedMileage}
        onOpenQuote={handleOpenQuote}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      /> */}
    </main>
  );
}
