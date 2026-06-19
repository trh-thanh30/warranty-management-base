"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { footerLinks } from "../home.constants";
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
          className="relative overflow-hidden rounded-xl bg-charcoal p-8 text-center text-white border border-cloud sm:p-14"
        >
          <motion.div
            variants={fadeUp}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-2 rounded-[4px] border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/90">
              <span
                className="h-2 w-2 rounded-full bg-emerald-400"
                aria-hidden="true"
              />
              Start your coverage today
            </div>

            <h2 className="max-w-2xl text-3xl font-medium leading-tight tracking-normal text-white sm:text-5xl">
              Don&apos;t let your next repair bill catch you off guard
            </h2>

            <p className="max-w-lg text-base leading-7 text-white/70">
              Join thousands of drivers who chose peace of mind over expensive
              surprises. Get covered in minutes.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                onClick={onOpenQuote}
                className="h-13 min-h-[44px] rounded-[4px] bg-brand-blue text-white hover:bg-brand-blue/90 px-8 text-base font-medium cursor-pointer transition-colors duration-[330ms]"
              >
                Get a free quote
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                className="h-13 min-h-[44px] rounded-[4px] bg-white/10 text-white hover:bg-white/15 px-8 text-base font-medium cursor-pointer transition-colors duration-[330ms] border border-white/10"
              >
                View coverage details
              </Button>
            </div>

            <p className="text-xs text-white/50">
              No upfront commitment. Instant eligibility check.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-cloud bg-white text-charcoal">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-12 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div>
            <div className="text-sm font-medium tracking-widest uppercase text-charcoal">
              LOGO
            </div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-graphite">
              A total guarantee for your vehicle. Protect the parts that matter
              most.
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-5 text-sm text-pewter"
            aria-label="Footer navigation"
          >
            {footerLinks.map((link) => (
              <a
                key={link}
                href="#how-it-works"
                className="min-h-[44px] flex items-center transition-colors hover:text-charcoal hover:underline decoration-brand-blue underline-offset-4"
              >
                {link}
              </a>
            ))}
          </nav>

          <Button
            type="button"
            className="h-12 min-h-[44px] rounded-[4px] border border-cloud bg-ash text-graphite hover:bg-cloud hover:text-charcoal px-7 cursor-pointer transition-colors duration-[330ms]"
            onClick={onOpenQuote}
          >
            Get a free quote
          </Button>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cloud bg-ash py-6 text-xs text-pewter">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 sm:px-8 sm:flex-row sm:items-center sm:justify-between lg:px-12">
            <div>
              &copy; {new Date().getFullYear()} LOGO. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a
                href="#privacy"
                className="hover:text-charcoal transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="hover:text-charcoal transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#cookie-settings"
                className="hover:text-charcoal transition-colors"
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
