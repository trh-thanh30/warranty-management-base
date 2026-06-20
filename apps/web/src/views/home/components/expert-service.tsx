"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";

interface TabContent {
  id: string;
  tabTitle: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  imageUrl: string;
  videoUrl?: string;
}

const tabData: TabContent[] = [
  {
    id: "services",
    tabTitle: "Additional Services",
    title: "Additional Car Repair Services",
    subtitle: "We Provide Expert Service",
    description:
      "We use the latest diagnostic equipment to guarantee your vehicle is serviced or repaired properly. As a member of our premium network, we share a commitment to world-class automotive care.",
    bullets: [
      "FREE Loaner Cars on major repairs",
      "FREE Shuttle Service to your home or office",
      "General Auto Repair & Routine Maintenance",
      "Transmission Diagnostics & Restoration",
      "Fuel & Exhaust System Calibration",
    ],
    imageUrl: "/service_3.jpg",
  },
  {
    id: "about",
    tabTitle: "About Company",
    title: "Your Trusted Warranty Partner",
    subtitle: "About Our Company",
    description:
      "We are committed to delivering the ultimate peace of mind for vehicle owners nationwide. With over a decade of experience and a certified partner network, we make warranty coverage simple, transparent, and direct.",
    bullets: [
      "Direct Workshop Settlements (No cash advance)",
      "24/7 Roadside & Towing Assistance",
      "Certified OEM Parts & Professional Technicians",
      "Hassle-Free Online Claims Processing",
      "Dedicated Technical Support Team",
    ],
    imageUrl: "/workshop_1.jpg",
  },
];

export function ExpertServiceSection() {
  const { container } = useScrollReveal();
  const [activeTab, setActiveTab] = useState<string>("services");

  const activeContent = (tabData.find((tab) => tab.id === activeTab) ||
    tabData[0]) as TabContent;

  return (
    <section
      id="expert-service"
      className="mx-auto flex w-full max-w-[1440px] flex-col justify-center px-5 py-16 sm:px-8 lg:px-12"
      aria-label="Expert service details"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="flex flex-col items-center"
      >
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-medium uppercase tracking-wider text-brand-blue">
            {activeContent.subtitle}
          </p>
          <h2 className="mt-4 text-3xl font-medium leading-tight tracking-normal text-charcoal sm:text-5xl">
            We Provide Expert Service
          </h2>
          <div className="mt-4 mx-auto h-[2px] w-12 bg-brand-blue" />
        </div>

        {/* Tab Headers - Clean and Pure Typography */}
        <div className="flex border-b border-cloud w-full max-w-xl justify-center mb-10 gap-3 pb-px">
          {tabData.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-[300ms] cursor-pointer ${
                  isActive
                    ? "text-brand-blue"
                    : "text-pewter hover:text-charcoal"
                }`}
              >
                {tab.tabTitle}
                {isActive && (
                  <motion.div
                    layoutId="activeServiceTabLine"
                    className="absolute -bottom-[2px] left-2 right-2 h-[2px] bg-brand-blue"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Split Content Box */}
        <div className="w-full overflow-hidden rounded-xl border border-cloud bg-ash shadow-xs">
          <div className="grid gap-0 lg:grid-cols-12">
            {/* Left Box: Text Content (Light theme matching screen) */}
            <div className="lg:col-span-5 flex flex-col justify-center bg-white p-8 sm:p-12 text-charcoal border-r border-cloud/40">
              <h3 className="text-2xl font-medium tracking-tight text-charcoal sm:text-3xl">
                {activeContent.title}
              </h3>
              <div className="mt-3 h-[1px] w-10 bg-brand-blue" />

              <p className="mt-6 text-xs text-graphite leading-relaxed">
                {activeContent.description}
              </p>

              {/* Bullet Points with Wrench/Check icon style SVG */}
              <div className="mt-8 space-y-3.5">
                {activeContent.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3">
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center text-brand-blue">
                      {/* Simple custom inline wrench SVG */}
                      <svg
                        className="h-3.5 w-3.5 fill-current"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M19.1 12.9c-.3-.3-.8-.3-1.1 0l-3 3c-.3.3-.3.8 0 1.1s.8.3 1.1 0l3-3c.3-.3.3-.8 0-1.1zm-8.8-7c-2.3 0-4.2 1.9-4.2 4.2 0 1.2.5 2.3 1.3 3.1l-5.6 5.6c-.6.6-.6 1.5 0 2.1s1.5.6 2.1 0l5.6-5.6c.8.8 1.9 1.3 3.1 1.3 2.3 0 4.2-1.9 4.2-4.2 0-.3 0-.7-.1-1l-2.9 2.9c-.3.3-.8.3-1.1 0s-.3-.8 0-1.1l2.9-2.9c-.3-.1-.7-.1-1-.1z" />
                      </svg>
                    </span>
                    <span className="text-xs text-graphite font-medium">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Box: Image without Play Button */}
            <div className="lg:col-span-7 relative min-h-[350px] sm:min-h-[400px] bg-charcoal flex items-center justify-center overflow-hidden">
              <Image
                src={activeContent.imageUrl}
                alt={activeContent.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover transition-transform duration-[600ms] hover:scale-105"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
