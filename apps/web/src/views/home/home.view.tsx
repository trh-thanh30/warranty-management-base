"use client";

import { useState } from "react";
import { HeroSection } from "./components/hero-section";
import { BrandsSection } from "./components/brands-section";
import { StatsSection } from "./components/stats-section";
import { HowItWorksSection } from "./components/how-it-works-section";
import { PricingSection } from "./components/pricing-section";
import { TestimonialsSection } from "./components/testimonials-section";
import { FaqSection } from "./components/faq-section";
import { CtaSection } from "./components/cta-section";
import { QuoteModal } from "./components/quote-modal";
import { LookupSection } from "./components/lookup-section";
import { WorkshopsSection } from "./components/workshops-section";

export function HomeView() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    type: "warranty" | "service";
    term: string;
    price: string;
  } | null>(null);

  const handleOpenQuote = (
    plan: { type: "warranty" | "service"; term: string; price: string } | null,
  ) => {
    setSelectedPlan(plan);
    setIsQuoteModalOpen(true);
  };

  return (
    <main className="overflow-x-hidden bg-[#EEF3F5] text-slate-950">
      <HeroSection
        onOpenQuote={() =>
          handleOpenQuote({
            type: "warranty",
            term: "Custom Warranty",
            price: "Custom",
          })
        }
      />
      <BrandsSection />

      <div className="flex min-h-screen flex-col justify-center bg-[#EEF3F5]">
        <StatsSection />
      </div>

      <div className="flex min-h-screen flex-col justify-center bg-white">
        <HowItWorksSection />
      </div>

      <div className="flex min-h-screen flex-col justify-center bg-[#EEF3F5]">
        <PricingSection onOpenQuote={handleOpenQuote} />
      </div>

      <LookupSection />

      <div className="flex min-h-screen flex-col justify-center bg-white">
        <TestimonialsSection />
      </div>

      <WorkshopsSection />

      <div className="flex min-h-screen flex-col justify-center bg-[#EEF3F5]">
        <FaqSection />
      </div>

      <CtaSection onOpenQuote={() => handleOpenQuote(null)} />

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        selectedPlan={selectedPlan}
      />
    </main>
  );
}
