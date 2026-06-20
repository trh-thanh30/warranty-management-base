"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";

const servicesData = [
  {
    id: "service-1",
    subtitle: "SERVICE 01",
    title: "MECHANICAL WARRANTY",
    description:
      "Comprehensive coverage for engine parts, gearbox components, transmission assemblies, and certified workshop labor.",
    imageUrl: "/service_3.jpg",
  },
  {
    id: "service-2",
    subtitle: "SERVICE 02",
    title: "ELECTRICAL COVERAGE",
    description:
      "Protection for starters, alternators, ECUs, wiring harnesses, sensors, and high-cost digital screen clusters.",
    imageUrl: "/workshop_1.jpg",
  },
  {
    id: "service-3",
    subtitle: "SERVICE 03",
    title: "24/7 ROADSIDE ASSIST",
    description:
      "Instant nationwide dispatch for towing, emergency battery jump-starts, fuel delivery, and roadside tyre replacement.",
    imageUrl: "/service_1.jpg",
  },
  {
    id: "service-4",
    subtitle: "SERVICE 04",
    title: "PAINT & CERAMIC COAT",
    description:
      "Premium exterior paint correction, multi-layer ceramic coatings, and specialized body maintenance.",
    imageUrl: "/service_2.jpg",
  },
  {
    id: "service-5",
    subtitle: "SERVICE 05",
    title: "ROUTINE MAINTENANCE",
    description:
      "Scheduled engine oil flushes, filter servicing, brake pad replacements, and alignment tuning.",
    imageUrl: "/service_4.jpg",
  },
  {
    id: "service-6",
    subtitle: "SERVICE 06",
    title: "DIAGNOSTICS & TUNING",
    description:
      "High-end electronic OBD diagnostics, check engine light resolution, and performance system calibrations.",
    imageUrl: "/workshop_2.jpg",
  },
];

export function StatsSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (emblaApi: any) => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    },
    [],
  );

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect(emblaApi);
  }, [emblaApi, onSelect]);

  const { container, fadeUp } = useScrollReveal();

  return (
    <section
      id="services"
      className="w-full bg-slate-50/50 py-16 lg:py-20 border-b border-cloud min-h-[90vh] lg:min-h-screen flex flex-col justify-center items-center"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 w-full"
      >
        <motion.div variants={fadeUp} className="text-center pb-12">
          <div className="inline-flex items-center gap-2.5 text-sm sm:text-base font-sans font-bold uppercase tracking-[0.25em] text-brand-blue">
            <span>SERVICES</span>
            <span className="text-charcoal/40 text-sm sm:text-base font-sans">
              •
            </span>
            <span>WE PROVIDE</span>
          </div>
          <h2 className="mt-4 text-3xl font-condensed font-bold uppercase tracking-wider text-charcoal sm:text-5xl lg:text-6xl max-w-none">
            OUR SERVICE AREA WHERE YOUR CAR SHINES
          </h2>
          <div className="mt-6 mx-auto h-[3px] w-16 bg-brand-blue" />
        </motion.div>

        <motion.div variants={fadeUp} className="relative mt-12 px-2 sm:px-12">
          {/* Left Arrow Button */}
          <div className="absolute top-1/2 -left-2 sm:-left-4 md:-left-8 z-10 -translate-y-1/2 hidden sm:block">
            <button
              onClick={scrollPrev}
              className="group/btn relative flex h-12 w-12 items-center justify-center rounded-full border border-brand-blue bg-white text-brand-blue overflow-hidden hover:scale-105 active:scale-95 transition-all duration-300 shadow-xs cursor-pointer"
              aria-label="Previous service"
            >
              <span className="absolute w-[200%] aspect-square -top-[50%] -left-[50%] bg-brand-blue rotate-45 translate-y-[120%] translate-x-[120%] transition-transform duration-[500ms] ease-out group-hover/btn:translate-y-0 group-hover/btn:translate-x-0 z-0" />
              <ChevronLeft className="relative h-5 w-5 z-10 transition-colors duration-300 group-hover/btn:text-white" />
            </button>
          </div>

          {/* Right Arrow Button */}
          <div className="absolute top-1/2 -right-2 sm:-right-4 md:-right-8 z-10 -translate-y-1/2 hidden sm:block">
            <button
              onClick={scrollNext}
              className="group/btn relative flex h-12 w-12 items-center justify-center rounded-full border border-brand-blue bg-white text-brand-blue overflow-hidden hover:scale-105 active:scale-95 transition-all duration-300 shadow-xs cursor-pointer"
              aria-label="Next service"
            >
              <span className="absolute w-[200%] aspect-square -top-[50%] -left-[50%] bg-brand-blue rotate-45 translate-y-[120%] translate-x-[120%] transition-transform duration-[500ms] ease-out group-hover/btn:translate-y-0 group-hover/btn:translate-x-0 z-0" />
              <ChevronRight className="relative h-5 w-5 z-10 transition-colors duration-300 group-hover/btn:text-white" />
            </button>
          </div>

          {/* Embla Viewport */}
          <div className="overflow-hidden w-full mt-4" ref={emblaRef}>
            {/* Embla Container (Track) */}
            <div className="flex -ml-8">
              {servicesData.map((service) => (
                <div
                  key={service.id}
                  className="pl-8 w-full md:w-1/3 flex-shrink-0"
                >
                  <div className="group flex flex-col h-full justify-between overflow-hidden rounded-[16px] border border-cloud bg-white p-5 shadow-xs hover:bg-brand-blue hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/20 transition-all duration-[330ms]">
                    <div>
                      <div className="relative h-[220px] w-full overflow-hidden rounded-[12px]">
                        <Image
                          src={service.imageUrl}
                          alt={service.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-6 flex flex-col">
                        <span className="text-xs sm:text-sm font-sans font-bold uppercase tracking-widest text-brand-blue group-hover:text-white/80 transition-colors duration-300">
                          {service.subtitle}
                        </span>
                        <h3 className="mt-2 text-2xl sm:text-3xl font-condensed font-bold uppercase tracking-wide text-charcoal group-hover:text-white transition-colors duration-300">
                          {service.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-graphite group-hover:text-white/95 transition-colors duration-300 min-h-[60px]">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="group/btn relative mt-5 inline-flex overflow-hidden rounded-full border border-brand-blue px-[20px] py-[10px] text-[16px] font-condensed font-bold uppercase tracking-wider text-brand-blue bg-transparent transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs cursor-pointer w-fit z-10 group-hover:border-white"
                    >
                      {/* Sweeps white background on card hover or button hover */}
                      <span className="absolute w-[200%] aspect-square -top-[50%] -left-[50%] bg-white rotate-45 translate-y-[120%] translate-x-[120%] transition-transform duration-[400ms] ease-out group-hover:translate-y-0 group-hover:translate-x-0 group-hover/btn:translate-y-0 group-hover/btn:translate-x-0 z-0" />
                      <span className="relative z-10 transition-colors duration-300 text-brand-blue">
                        Book Now!
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Dot Indicators & Mobile Navigation */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {/* Mobile Prev Button */}
          <button
            onClick={scrollPrev}
            className="flex sm:hidden h-9 w-9 items-center justify-center rounded-full border border-brand-blue bg-white text-brand-blue hover:bg-brand-blue/5 active:scale-95 transition-all cursor-pointer"
            aria-label="Previous service"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>

          {/* Dot Indicators */}
          <div className="flex gap-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 cursor-pointer ${
                  selectedIndex === index
                    ? "bg-brand-blue w-4"
                    : "bg-pale-silver"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Next Button */}
          <button
            onClick={scrollNext}
            className="flex sm:hidden h-9 w-9 items-center justify-center rounded-full border border-brand-blue bg-white text-brand-blue hover:bg-brand-blue/5 active:scale-95 transition-all cursor-pointer"
            aria-label="Next service"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
