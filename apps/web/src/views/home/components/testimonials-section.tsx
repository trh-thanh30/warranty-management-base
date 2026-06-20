"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Quote,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { testimonials } from "../home.constants";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";
import { motionSpring } from "@/src/constants/motion.constants";

const proofPoints = [
  { label: "Claims covered", value: "EUR 8,850" },
  { label: "Average response", value: "24-48h" },
  { label: "Driver rating", value: "5.0/5" },
];

export function TestimonialsSection() {
  const { container, fadeUp } = useScrollReveal();
  const shouldReduce = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    duration: 35,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIdx(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      if (emblaApi) {
        emblaApi.off("select", onSelect);
        emblaApi.off("reInit", onSelect);
      }
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const goTo = useCallback(
    (idx: number) => {
      if (emblaApi) emblaApi.scrollTo(idx);
    },
    [emblaApi],
  );

  return (
    <section
      id="stories"
      className="w-full bg-slate-50 py-16 sm:py-24 text-slate-800 overflow-hidden"
      aria-label="Customer testimonials"
    >
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center"
        >
          {/* Cinematic Image with Overlaid Stats — Placed second on mobile, first on desktop */}
          <motion.div
            variants={fadeUp}
            className="relative h-[240px] sm:h-[400px] lg:h-[620px] w-full rounded-[32px] overflow-hidden shadow-2xl border border-slate-200/50 order-2 lg:order-1"
          >
            {/* Background Workshop Image */}
            <Image
              src="/workshop_1.jpg"
              alt="Professional car workshop"
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-cover object-center"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-0" />

            {/* Top Floating Badge */}
            <div className="absolute top-6 left-6 bg-brand-blue/90 text-white text-[10px] font-sans font-bold uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-sm z-10 shadow-lg">
              OUR HAPPY CUSTOMERS
            </div>

            {/* Bottom Frosted Glass Stats Row */}
            <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-1 sm:gap-4 backdrop-blur-md bg-white/80 border border-slate-200/50 rounded-2xl p-2 sm:p-4 z-10 shadow-lg">
              {proofPoints.map((point) => (
                <div key={point.label} className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-condensed font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                    {point.label}
                  </p>
                  <p className="mt-1 text-xs sm:text-lg font-condensed font-bold tracking-wider text-slate-900 whitespace-nowrap">
                    {point.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column — Testimonial Content & Overlay Slider — Placed first on mobile, second on desktop */}
          <div className="flex flex-col justify-between h-full order-1 lg:order-2 min-w-0 w-full">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
            >
              <p className="text-xs sm:text-sm font-sans font-bold uppercase tracking-[0.2em] text-brand-blue">
                Real stories
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-[2.6rem] font-condensed font-bold uppercase leading-tight tracking-wider text-slate-900">
                Drivers who avoided surprise repair bills.
              </h2>
              <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600 font-sans font-medium">
                Real claims from everyday drivers, with the repair amount,
                workshop handoff, and cover outcome made easy to compare.
              </p>
            </motion.div>

            {/* Main Testimonial Slider Viewport */}
            <motion.div
              ref={emblaRef}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="relative lg:-ml-24 lg:z-10 mt-8 overflow-hidden rounded-[24px] cursor-grab active:cursor-grabbing w-full"
            >
              <div className="flex">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="flex-[0_0_100%] min-w-0 px-1"
                  >
                    <article className="h-full bg-white border border-slate-100 p-8 shadow-[0_20px_40px_rgba(15,23,42,0.06)] rounded-[24px] select-none">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-700 border border-slate-100">
                            <Quote className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div
                            className="flex gap-1"
                            aria-label={`${testimonial.rating} out of 5 stars`}
                          >
                            {Array.from({ length: testimonial.rating }).map(
                              (_, i) => (
                                <Star
                                  key={i}
                                  className="h-4.5 w-4.5 fill-amber-400 text-amber-400"
                                  aria-hidden="true"
                                />
                              ),
                            )}
                          </div>
                        </div>

                        <blockquote className="mt-6 text-lg sm:text-xl font-condensed font-medium leading-relaxed text-slate-800">
                          &ldquo;{testimonial.quote}&rdquo;
                        </blockquote>
                      </div>

                      <div className="mt-8 flex flex-col gap-5 border-t border-slate-100 pt-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            aria-hidden="true"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-800 border border-slate-200"
                          >
                            {testimonial.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {testimonial.name}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500 font-condensed">
                              {testimonial.role} - {testimonial.location}
                            </p>
                            <p className="mt-0.5 text-[11px] font-condensed text-slate-700 font-medium">
                              {testimonial.carModel}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-full border border-emerald-500/20 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-600 self-start sm:self-auto">
                          Claim covered: {testimonial.claimAmount}
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Sidebar Points (Clean horizontal grid below card) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-condensed font-bold uppercase tracking-wider text-slate-400">
                    Outcome
                  </p>
                  <p className="mt-1 text-sm sm:text-base font-sans font-medium text-slate-600 leading-relaxed">
                    Covered repair, no upfront workshop payment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  <Wrench className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-condensed font-bold uppercase tracking-wider text-slate-400">
                    Workshop
                  </p>
                  <p className="mt-1 text-sm sm:text-base font-sans font-medium text-slate-600 leading-relaxed">
                    Partner garage coordinated directly by Garanty.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-condensed font-bold uppercase tracking-wider text-slate-400">
                    Confidence
                  </p>
                  <p className="mt-1 text-sm sm:text-base font-sans font-medium text-slate-600 leading-relaxed">
                    Clear claim status and repair cost visibility.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Slider Navigator & Arrows */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-8 lg:grid lg:grid-cols-[1fr_auto] lg:gap-4">
              {/* Desktop Name-Card Navigator */}
              <div className="hidden sm:grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {testimonials.map((testimonial, i) => (
                  <motion.button
                    key={testimonial.id}
                    type="button"
                    onClick={() => goTo(i)}
                    whileHover={shouldReduce ? undefined : { y: -2 }}
                    whileTap={shouldReduce ? undefined : { scale: 0.98 }}
                    aria-pressed={activeIdx === i}
                    className={`min-h-[72px] rounded-xl border p-4 text-left transition-all duration-[330ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 ${
                      activeIdx === i
                        ? "border-slate-300 bg-white shadow-md text-slate-900"
                        : "border-transparent bg-slate-100/60 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-bold">
                        {testimonial.name}
                      </p>
                      <span className="shrink-0 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 text-[9px] font-bold">
                        {testimonial.claimAmount}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500 font-condensed font-medium">
                      {testimonial.carModel}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Mobile Pagination Dots */}
              <div className="flex sm:hidden items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      activeIdx === i ? "w-6 bg-brand-blue" : "w-2 bg-slate-300"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center justify-end gap-2">
                <motion.button
                  type="button"
                  onClick={scrollPrev}
                  aria-label="Previous testimonial"
                  whileTap={shouldReduce ? undefined : { scale: 0.94 }}
                  transition={motionSpring.snappy}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-all duration-[330ms] hover:bg-slate-50 hover:border-slate-300 shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={scrollNext}
                  aria-label="Next testimonial"
                  whileTap={shouldReduce ? undefined : { scale: 0.94 }}
                  transition={motionSpring.snappy}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-all duration-[330ms] hover:bg-slate-50 hover:border-slate-300 shadow-sm cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
