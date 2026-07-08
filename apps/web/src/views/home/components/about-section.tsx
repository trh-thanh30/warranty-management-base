"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, PhoneCall } from "lucide-react";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";
import { BrandsSection } from "./brands-section";

interface AboutSectionProps {
  onOpenHub?: (tab: "lookup" | "activate" | "claim") => void;
}

export function AboutSection({ onOpenHub }: AboutSectionProps) {
  const { container, fadeUp } = useScrollReveal();

  return (
    <section
      id="about-us"
      className="w-full bg-white pt-24 pb-0 lg:pt-32 lg:pb-0 border-b border-cloud relative overflow-hidden min-h-[90vh] lg:min-h-screen flex flex-col justify-between items-center"
    >
      {/* Decorative Background Blob */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 w-full">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-12 lg:grid-cols-12 lg:items-center"
        >
          {/* Left Column: Premium Image Collage with Stats Overlay */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-6 relative flex justify-center items-center"
          >
            <div className="relative w-full max-w-[540px] aspect-[4/3] sm:aspect-square md:aspect-[4/3] rounded-[24px] overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/workshop_1.jpg"
                alt="Professional automotive workshop"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover transition-transform duration-[600ms] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Experience Badge */}
            <div className="absolute -top-6 -right-2 sm:right-6 bg-brand-blue text-white rounded-[20px] p-6 shadow-xl max-w-[180px] border border-white/20 hover:scale-105 transition-transform duration-300">
              <span className="block text-4xl font-sans font-bold leading-none tracking-tight">
                10+
              </span>
              <span className="block text-xs font-sans font-bold uppercase tracking-wider mt-2 opacity-90 leading-tight">
                Years of Automotive Warranty Excellence
              </span>
            </div>

            {/* Floating Trust Card */}
            <div className="absolute -bottom-6 -left-2 sm:left-6 bg-white/90 backdrop-blur-md text-charcoal rounded-[20px] p-5 shadow-xl border border-cloud max-w-[220px] hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-blue">
                    TRUSTED PARTNER
                  </span>
                  <span className="block text-sm font-sans font-bold text-charcoal mt-0.5">
                    100% Direct Payout
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Content Block */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            {/* Tagline */}
            <div className="inline-flex items-center gap-2.5 text-sm sm:text-base font-sans font-bold uppercase tracking-[0.25em] text-brand-blue">
              <span>ABOUT</span>
              <span className="text-charcoal/40 text-sm sm:text-base font-sans">
                •
              </span>
              <span>OUR COMPANY</span>
            </div>

            {/* Heading */}
            <h2 className="mt-4 text-3xl font-condensed font-bold uppercase tracking-wider text-charcoal sm:text-5xl lg:text-6xl max-w-none leading-none">
              YOUR TRUSTED VEHICLE WARRANTY PARTNER
            </h2>
            <div className="mt-6 h-[3px] w-16 bg-brand-blue" />

            {/* Description */}
            <p className="mt-6 text-base leading-relaxed text-graphite font-sans">
              We are committed to delivering the ultimate peace of mind for
              vehicle owners nationwide. With over a decade of experience and a
              certified partner network, we make warranty coverage simple,
              transparent, and direct—taking care of the costs so you can focus
              on the drive.
            </p>

            {/* CTA Buttons & Phone Row */}
            <div className="mt-10 flex flex-wrap items-center gap-6">
              {/* Get Covered Button */}
              <button
                type="button"
                onClick={() => onOpenHub?.("claim")}
                className="group/btn relative inline-flex overflow-hidden rounded-full border border-brand-blue px-[32px] py-[14px] text-[16px] font-condensed font-bold uppercase tracking-wider text-white bg-brand-blue transition-all duration-300 hover:scale-105 active:scale-95 hover:border-brand-blue-hover shadow-md cursor-pointer w-fit"
              >
                {/* Rotated square diagonal sweep fill effect - sweeps to dark blue */}
                <span className="absolute w-[200%] aspect-square -top-[50%] -left-[50%] bg-brand-blue-hover rotate-45 translate-y-[120%] translate-x-[120%] transition-transform duration-[400ms] ease-out group-hover/btn:translate-y-0 group-hover/btn:translate-x-0 z-0" />
                <span className="relative z-10 text-white">SUBMIT A CLAIM</span>
              </button>

              {/* Call Us Link */}
              <a
                href="tel:1800123456"
                className="flex items-center gap-3 text-charcoal hover:text-brand-blue transition-colors duration-300 group/phone"
              >
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-cloud text-brand-blue overflow-hidden transition-all duration-300 group-hover/phone:border-brand-blue z-10">
                  <span className="absolute w-[200%] aspect-square -top-[50%] -left-[50%] bg-brand-blue rotate-45 translate-y-[120%] translate-x-[120%] transition-transform duration-[400ms] ease-out group-hover/phone:translate-y-0 group-hover/phone:translate-x-0 z-0" />
                  <PhoneCall className="relative h-5 w-5 z-10 transition-colors duration-300 group-hover/phone:text-white" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-pewter uppercase tracking-wider leading-none">
                    CALL US ANYTIME
                  </span>
                  <span className="block text-lg font-condensed font-bold text-charcoal group-hover/phone:text-brand-blue transition-colors mt-1 leading-none">
                    1800 123 456
                  </span>
                </div>
              </a>

              {/* Learn More Button */}
              <a
                href="#how-it-works"
                className="group/btn relative inline-flex overflow-hidden rounded-full border border-brand-blue px-[32px] py-[14px] text-[16px] font-condensed font-bold uppercase tracking-wider text-brand-blue bg-transparent transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs cursor-pointer w-fit"
              >
                {/* Rotated square diagonal sweep fill effect - sweeps to brand-blue */}
                <span className="absolute w-[200%] aspect-square -top-[50%] -left-[50%] bg-brand-blue rotate-45 translate-y-[120%] translate-x-[120%] transition-transform duration-[400ms] ease-out group-hover/btn:translate-y-0 group-hover/btn:translate-x-0 z-0" />
                <span className="relative z-10 transition-colors duration-[330ms] group-hover/btn:text-white">
                  Learn More About Us
                </span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Brand Logo Marquee Slider (Full-width edge-to-edge) */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-16 w-full"
      >
        <BrandsSection />
      </motion.div>
    </section>
  );
}
