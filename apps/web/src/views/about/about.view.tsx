"use client";

import { Container } from "@/src/components/common/container";
import { AboutHeroCorporate } from "./components/about-hero-corporate";
import { AboutBrandHeritage } from "./components/about-brand-heritage";
import { AboutCoreTech } from "./components/about-core-tech";
import { AboutTimeline } from "./components/about-timeline";
import { AboutVisionValues } from "./components/about-vision-values";
import { AboutNetworkBanner } from "./components/about-network-banner";
import { AboutTestimonials } from "./components/about-testimonials";
import { AboutB2BCta } from "./components/about-b2b-cta";

export function AboutView() {
  return (
    <main className="w-full overflow-x-hidden bg-white text-deep-black">
      {/* 1. Hero Corporate Section (bg-surface-muted, 1 viewport height) */}
      <AboutHeroCorporate />

      {/* 2. Brand Heritage & Storytelling Rows (bg-white, 2-Column Rows) */}
      <AboutBrandHeritage />

      {/* 3. Core Technology Hub & Spec Comparison (bg-white, 3-Column Layout) */}
      <section className="w-full bg-white py-20 lg:py-28">
        <Container>
          <AboutCoreTech />
        </Container>
      </section>

      {/* 4. Milestones Centered Timeline (bg-surface-muted) */}
      <AboutTimeline />

      {/* 5. Vision & 3 Core Brand Pillars (bg-white, Minimalist Unboxed) */}
      <AboutVisionValues />

      {/* 6. Dealer Network & E-Warranty Banner (bg-white) */}
      <AboutNetworkBanner />

      {/* 7. Showroom Partner & Customer Testimonials (bg-surface-muted) */}
      <AboutTestimonials />

      {/* 8. B2B Partner Application CTA (bg-white) */}
      <AboutB2BCta />
    </main>
  );
}
