"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { carHeroImage, footerLinks } from "../home.constants";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";

export function CtaSection({ onOpenQuote }: { onOpenQuote: () => void }) {
  const { container, fadeUp } = useScrollReveal();

  return (
    <>
      {/* ── Final CTA ── */}
      <section
        className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16"
        aria-label="Get started"
      >
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 text-center text-white border border-slate-800 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)] sm:p-14"
        >
          {/* Background car image */}
          <div className="pointer-events-none absolute inset-0">
            <Image
              src={carHeroImage.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 1440px, 100vw"
              className="object-cover object-center opacity-[0.07]"
              aria-hidden="true"
            />
          </div>
          {/* Radial blue glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(11,125,255,0.25),transparent_60%)]" />

          <motion.div
            variants={fadeUp}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-slate-300 backdrop-blur-md">
              <span
                className="h-2 w-2 rounded-full bg-emerald-400"
                aria-hidden="true"
              />
              Start your coverage today
            </div>

            <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Don&apos;t let your next repair bill catch you off guard
            </h2>

            <p className="max-w-lg text-base leading-7 text-slate-400">
              Join thousands of drivers who chose peace of mind over expensive
              surprises. Get covered in minutes.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={onOpenQuote}
                className="h-13 min-h-[44px] rounded-full px-8 text-base cursor-pointer shadow-[0_0_30px_rgba(11,125,255,0.4)] transition-all duration-200 hover:shadow-[0_0_40px_rgba(11,125,255,0.6)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Get a free quote
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                variant="secondary"
                className="h-13 min-h-[44px] rounded-full px-8 text-base cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                View coverage details
              </Button>
            </div>

            <p className="text-xs text-slate-500">
              No upfront commitment. Instant eligibility check.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-900 bg-[#060b12] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-12 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div>
            <div className="text-sm font-bold tracking-widest uppercase">
              LOGO
            </div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
              A total guarantee for your vehicle. Protect the parts that matter
              most.
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-5 text-sm text-slate-400"
            aria-label="Footer navigation"
          >
            {footerLinks.map((link) => (
              <a
                key={link}
                href="#how-it-works"
                className="min-h-[44px] flex items-center transition-colors hover:text-white hover:underline decoration-[#0b7dff] underline-offset-4"
              >
                {link}
              </a>
            ))}
          </nav>

          <Button
            variant="secondary"
            className="h-12 min-h-[44px] rounded-full px-7 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
            onClick={onOpenQuote}
          >
            Get a free quote
          </Button>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900/60 bg-[#04080d] py-6 text-xs text-slate-500">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 sm:px-8 sm:flex-row sm:items-center sm:justify-between lg:px-12">
            <div>
              &copy; {new Date().getFullYear()} LOGO. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a
                href="#privacy"
                className="hover:text-slate-350 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="hover:text-slate-350 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#cookie-settings"
                className="hover:text-slate-350 transition-colors"
              >
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
