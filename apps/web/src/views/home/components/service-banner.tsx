"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function ServiceBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elementTop, setElementTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateLayout = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        setElementTop(absoluteTop);
        setClientHeight(window.innerHeight);
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);

    // Recalculate after page finishes rendering to handle any layout shifts
    const timer = setTimeout(updateLayout, 600);

    return () => {
      window.removeEventListener("resize", updateLayout);
      clearTimeout(timer);
    };
  }, []);

  const { scrollY } = useScroll();

  // Define scroll range:
  // Start: when element enters from bottom (scrollY = elementTop - clientHeight)
  // End: when element exits through top (scrollY = elementTop + 480)
  const scrollRange = [
    elementTop - clientHeight || 0,
    elementTop + 480 || 1000,
  ];

  // Map global scrollY to local image parallax coordinates
  const yRaw = useTransform(scrollY, scrollRange, [-120, 120], { clamp: true });
  const scaleRaw = useTransform(scrollY, scrollRange, [1.18, 1.05], {
    clamp: true,
  });

  // Apply spring physics for ultra-smooth momentum parallax
  const y = useSpring(yRaw, { stiffness: 45, damping: 20, mass: 0.4 });
  const scale = useSpring(scaleRaw, { stiffness: 45, damping: 20, mass: 0.4 });

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] overflow-hidden flex items-center justify-center text-white"
      aria-label="Get Premium Service"
    >
      {/* Parallax Background Image (sized extra large to support up-down movement) */}
      <motion.div
        style={{
          scale,
          y,
          backgroundImage: "url('/service_3.jpg')",
        }}
        className="absolute inset-0 w-full h-[140%] -top-[20%] bg-cover bg-center bg-no-repeat"
      />

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-brand-blue/85 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/90 via-transparent to-brand-blue/90" />

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 w-full flex flex-col items-center text-center">
        {/* Subtitle (Brand Blue, clean, no icon) */}
        <div className="text-xs sm:text-sm font-sans font-bold uppercase tracking-[0.25em] text-sky-200">
          GET OUR SERVICE NOW!
        </div>

        {/* Headline */}
        <h2 className="mt-6 max-w-4xl text-3xl sm:text-5xl md:text-6xl font-condensed font-bold uppercase leading-tight tracking-wider text-white">
          GET <span className="text-sky-200">PREMIUM AUTO CAR SERVICE</span>,
          <br className="hidden sm:inline" /> FEEL FREE TO CONTACT US.
        </h2>

        {/* CONNECT NOW button with sliding diagonal overlay hover effect */}
        <button
          type="button"
          onClick={() => {
            const pricing = document.getElementById("pricing");
            if (pricing) pricing.scrollIntoView({ behavior: "smooth" });
          }}
          className="group/btn relative mt-8 sm:mt-10 inline-flex overflow-hidden rounded-full border border-white bg-white px-8 py-3.5 text-base font-condensed font-bold uppercase tracking-wider text-brand-blue transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg cursor-pointer w-fit"
        >
          {/* Sliding diagonal background */}
          <span className="absolute w-[200%] aspect-square -top-[50%] -left-[50%] bg-brand-blue rotate-45 translate-y-[120%] translate-x-[120%] transition-transform duration-[400ms] ease-out group-hover/btn:translate-y-0 group-hover/btn:translate-x-0 z-0" />
          <span className="relative z-10 transition-colors duration-[330ms] group-hover/btn:text-white">
            CONNECT NOW
          </span>
        </button>
      </div>
    </section>
  );
}
