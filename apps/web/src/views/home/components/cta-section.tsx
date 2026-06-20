"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Phone,
  Mail,
  MapPin,
  ArrowUp,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      {/* ── Footer ── */}
      <footer>
        {/* Top Band: Newsletter Signup */}
        <div className="w-full relative overflow-hidden bg-[#181818] py-12 lg:py-20 border-b border-white/10">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left side (car image with faint outline) */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-start items-end">
              <svg
                className="absolute -left-12 top-1/2 -translate-y-1/2 h-[350px] w-full text-white/[0.02] select-none pointer-events-none hidden sm:block"
                viewBox="0 0 800 400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M50 280 L180 280 Q220 280 240 250 L280 180 Q320 120 400 120 L550 120 Q620 120 660 170 L720 220 Q760 250 780 280 L790 280" />
                <path d="M120 280 A 45 45 0 0 1 210 280" />
                <path d="M580 280 A 45 45 0 0 1 670 280" />
                <path d="M180 280 L580 280" />
                <path d="M280 180 L520 180 Q560 180 580 200 L610 240" />
                <path d="M400 120 L400 180" />
                <circle cx="165" cy="280" r="30" strokeDasharray="5,5" />
                <circle cx="625" cy="280" r="30" strokeDasharray="5,5" />
              </svg>
              <div className="relative z-10 w-full max-w-[640px] lg:max-w-[760px] aspect-[16/9] lg:-ml-12 xl:-ml-24 -mb-14 lg:-mb-24">
                <Image
                  src="/supercar_hero-removebg-preview.png"
                  alt="Premium sports car"
                  fill
                  className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] scale-110 lg:scale-125 transform-gpu transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right side (newsletter form) */}
            <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6 text-left">
              <div className="flex">
                <span className="inline-flex items-center gap-1.5 text-sm font-condensed font-bold uppercase tracking-wider text-[#f97316]">
                  Subscribe Now!
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-condensed font-bold uppercase tracking-wider text-white leading-[1.1]">
                <span className="lg:whitespace-nowrap block">
                  Subscribe Our Newsletter
                </span>
                <span className="block mt-1">For Latest Updates</span>
              </h3>
              <form
                className="mt-2 flex flex-col gap-2 w-full max-w-md"
                onSubmit={(e) => e.preventDefault()}
              >
                <label className="text-xs font-condensed font-bold uppercase tracking-wider text-white/60">
                  Email
                </label>
                <div className="relative flex items-center w-full">
                  <input
                    type="email"
                    required
                    placeholder="ENTER EMAIL"
                    className="w-full rounded-full border border-white/10 bg-white/5 py-4 pl-6 pr-36 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:bg-white/10 focus:outline-hidden transition-all"
                  />
                  <button
                    type="submit"
                    className="group absolute right-1.5 overflow-hidden rounded-full bg-white px-6 py-2.5 text-xs font-condensed font-bold uppercase tracking-wider text-charcoal transition-all duration-[330ms] cursor-pointer"
                  >
                    {/* Skewed sweep overlay */}
                    <span className="absolute inset-y-0 -left-[10%] w-[120%] bg-brand-blue -skew-x-12 translate-x-full transition-transform duration-[400ms] ease-out group-hover:translate-x-0 z-0" />
                    <span className="relative z-10 transition-colors duration-[330ms] group-hover:text-white">
                      SUBSCRIBE
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Band: Brand Info & Contact Links */}
        <div className="w-full pt-16 pb-8 bg-brand-blue text-white relative overflow-hidden">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Brand Bio */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-blue shadow-md">
                  <Wrench className="h-5 w-5 stroke-[2.5]" />
                </div>
                <span className="text-2xl font-black tracking-wider uppercase text-white font-sans">
                  Garanty
                </span>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/80 font-sans">
                At Garanty, we provide top tier mechanical warranty services
                that protect the parts that matter most. Ensure your driving
                confidence with our certified partner network.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Facebook, href: "#" },
                  { icon: XIcon, href: "#" },
                  { icon: Instagram, href: "#" },
                  { icon: Linkedin, href: "#" },
                ].map((soc, i) => (
                  <a
                    key={i}
                    href={soc.href}
                    className="group relative overflow-hidden flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-[330ms]"
                  >
                    {/* Skewed sweep overlay */}
                    <span className="absolute inset-y-0 -left-[10%] w-[120%] bg-white -skew-x-12 translate-x-full transition-transform duration-[400ms] ease-out group-hover:translate-x-0 z-0" />
                    <soc.icon className="relative z-10 h-4.5 w-4.5 transition-colors duration-[330ms] group-hover:text-brand-blue" />
                  </a>
                ))}
              </div>
            </div>

            {/* Right Column: Contact Cards Grid */}
            <div className="lg:col-span-7 flex flex-col gap-4 w-full">
              <span className="text-xs font-condensed font-bold uppercase tracking-wider text-white/70">
                Connect With Us!
              </span>
              <div className="rounded-[24px] bg-white/10 border border-white/20 p-5 sm:p-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
                {/* Call us */}
                <div className="group relative overflow-hidden flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-[330ms] cursor-pointer">
                  {/* Skewed sweep overlay */}
                  <span className="absolute inset-y-0 -left-[10%] w-[120%] bg-white -skew-x-12 translate-x-full transition-transform duration-[450ms] ease-out group-hover:translate-x-0 z-0" />

                  <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-all duration-[330ms] group-hover:bg-brand-blue/10 group-hover:text-brand-blue">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="relative z-10 flex flex-col transition-colors duration-[330ms]">
                    <span className="text-xs font-condensed font-bold uppercase tracking-wider text-white/60 transition-colors duration-[330ms] group-hover:text-brand-blue/60 mt-0.5">
                      Call us 24/7
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white transition-colors duration-[330ms] group-hover:text-brand-blue font-sans mt-0.5">
                      +1 (234) 567-8910
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="group relative overflow-hidden flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-[330ms] cursor-pointer">
                  {/* Skewed sweep overlay */}
                  <span className="absolute inset-y-0 -left-[10%] w-[120%] bg-white -skew-x-12 translate-x-full transition-transform duration-[450ms] ease-out group-hover:translate-x-0 z-0" />

                  <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-all duration-[330ms] group-hover:bg-brand-blue/10 group-hover:text-brand-blue">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="relative z-10 flex flex-col transition-colors duration-[330ms]">
                    <span className="text-xs font-condensed font-bold uppercase tracking-wider text-white/60 transition-colors duration-[330ms] group-hover:text-brand-blue/60 mt-0.5">
                      Make an Email
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white transition-colors duration-[330ms] group-hover:text-brand-blue font-sans mt-0.5">
                      info@example.com
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="group relative overflow-hidden flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 transition-all duration-[330ms] cursor-pointer sm:col-span-2">
                  {/* Skewed sweep overlay */}
                  <span className="absolute inset-y-0 -left-[10%] w-[120%] bg-white -skew-x-12 translate-x-full transition-transform duration-[450ms] ease-out group-hover:translate-x-0 z-0" />

                  <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-all duration-[330ms] group-hover:bg-brand-blue/10 group-hover:text-brand-blue">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="relative z-10 flex flex-col transition-colors duration-[330ms]">
                    <span className="text-xs font-condensed font-bold uppercase tracking-wider text-white/60 transition-colors duration-[330ms] group-hover:text-brand-blue/60 mt-0.5">
                      Address
                    </span>
                    <span className="text-sm font-bold text-white transition-colors duration-[330ms] group-hover:text-brand-blue font-sans mt-0.5 leading-snug">
                      21521 Pouros Ridges, West Loria, MA 83781-0417
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider & Copyright Bottom Bar */}
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 border-t border-white/10 mt-16 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-white/60 font-sans">
            <div>
              &copy; {new Date().getFullYear()} GARANTY. ALL RIGHTS RESERVED.
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#terms"
                className="hover:text-white transition-colors duration-200 uppercase tracking-wider font-semibold"
              >
                Terms & Conditions
              </a>
              <a
                href="#privacy"
                className="hover:text-white transition-colors duration-200 uppercase tracking-wider font-semibold"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group fixed bottom-6 right-6 z-50 overflow-hidden flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-white shadow-xl border border-white/20 transition-all duration-[330ms] cursor-pointer"
            aria-label="Scroll to top"
          >
            {/* Skewed sweep overlay */}
            <span className="absolute inset-y-0 -left-[10%] w-[120%] bg-white -skew-x-12 translate-x-full transition-transform duration-[400ms] ease-out group-hover:translate-x-0 z-0" />
            <ArrowUp className="relative z-10 h-5 w-5 transition-colors duration-[330ms] group-hover:text-brand-blue" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
