"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { navItems, carHeroImages } from "../home.constants";
import { motionDuration, motionEase } from "@/src/constants/motion.constants";

export function HeroSection({ onOpenQuote }: { onOpenQuote: () => void }) {
  const shouldReduce = useReducedMotion();
  const [currentIdx, setCurrentIdx] = useState(0);
  const activeImage = carHeroImages[currentIdx] ?? {
    src: "/service_1.jpg",
    alt: "Professional vehicle service checkup",
  };
  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % carHeroImages.length);
  };

  const prevSlide = () => {
    setCurrentIdx(
      (prev) => (prev - 1 + carHeroImages.length) % carHeroImages.length,
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % carHeroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="top"
      className="relative flex h-[100dvh] flex-col overflow-hidden"
    >
      {/* Background image slider */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      </div>

      {/* Navigation header — full-width transparent bar */}
      <motion.header
        className="relative z-20 w-full px-6 py-5 lg:px-12"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
        }}
      >
        <motion.div
          className="mx-auto flex max-w-[1440px] items-center justify-between w-full"
          variants={{
            hidden: { opacity: 0, y: -16 },
            show: {
              opacity: 1,
              y: 0,
              transition: {
                duration: motionDuration.reveal,
                ease: motionEase.out,
              },
            },
          }}
        >
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-sm font-medium tracking-[0.4em] text-white uppercase">
              GARANTY
            </span>
          </div>

          {/* Nav items — centered, clean, medium weight */}
          <nav className="hidden items-center gap-1.5 lg:flex">
            {navItems.map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
                className="text-sm font-medium text-white/75 px-4 py-1.5 rounded-[4px] transition-all duration-[330ms] hover:text-white hover:bg-white/10"
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: motionDuration.reveal,
                      ease: motionEase.out,
                    },
                  },
                }}
              >
                {item}
              </motion.a>
            ))}
          </nav>

          {/* CTA — flat, barely rounded outline button */}
          <motion.a
            href="#pricing"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden sm:inline-flex items-center rounded-[4px] border border-white/25 bg-white/5 px-5 py-2 text-sm font-medium text-white transition-all duration-[330ms] hover:bg-white hover:text-charcoal hover:border-white"
          >
            Check Price
          </motion.a>
        </motion.div>
      </motion.header>

      {/* Hero content */}
      <div className="relative z-20 mt-auto px-5 pb-28 sm:px-8 lg:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05 } },
              exit: {
                transition: { staggerChildren: 0.05, staggerDirection: -1 },
              },
            }}
            className="max-w-2xl"
          >
            {/* Headline */}
            <h1 className="text-4xl sm:text-[40px] font-medium leading-tight tracking-[0.02em] text-white overflow-hidden">
              {(carHeroImages[currentIdx]?.title ?? "")
                .split(" ")
                .map((word, i) => (
                  <motion.span
                    key={i}
                    className="mr-[0.25em] inline-block"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4, ease: "easeOut" },
                      },
                      exit: {
                        opacity: 0,
                        y: -10,
                        transition: { duration: 0.2, ease: "easeIn" },
                      },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
            </h1>

            {/* Subtitle */}
            <div className="overflow-hidden">
              <motion.p
                className="mt-3 text-sm text-white/80 max-w-lg font-normal"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: "easeOut" },
                  },
                  exit: {
                    opacity: 0,
                    y: -10,
                    transition: { duration: 0.2, ease: "easeIn" },
                  },
                }}
              >
                {carHeroImages[currentIdx]?.description}
              </motion.p>
            </div>

            {/* CTA Buttons - Side by Side, flat styling */}
            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-4"
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: "easeOut" },
                },
                exit: {
                  opacity: 0,
                  y: -10,
                  transition: { duration: 0.2, ease: "easeIn" },
                },
              }}
            >
              <motion.button
                onClick={onOpenQuote}
                whileTap={{ scale: 0.98 }}
                className="h-10 w-full sm:w-[200px] rounded-[4px] bg-brand-blue text-xs font-medium uppercase tracking-wider text-white transition-all duration-[330ms] hover:bg-brand-blue/90 cursor-pointer"
              >
                Get a quote
              </motion.button>

              <motion.a
                href="#pricing"
                whileTap={{ scale: 0.98 }}
                className="flex h-10 w-full sm:w-[200px] items-center justify-center rounded-[4px] bg-white/80 text-xs font-medium uppercase tracking-wider text-charcoal backdrop-blur-sm transition-all duration-[330ms] hover:bg-white cursor-pointer"
              >
                Explore Plans
              </motion.a>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Bar: Scroll Indicator (Left) & Carousel Controls (Right) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: motionDuration.reveal }}
        className="absolute bottom-6 left-0 right-0 z-30 px-6 sm:px-10 lg:px-16 pointer-events-none"
      >
        <div className="flex w-full items-center justify-between pointer-events-auto">
          {/* Left: Mouse Scroll Indicator */}
          <div className="flex items-center">
            <div className="relative flex h-10 w-6 items-center justify-center rounded-full border border-white/35 bg-white/5 backdrop-blur-[2px]">
              <motion.div
                animate={
                  shouldReduce
                    ? { y: -3 }
                    : {
                        y: [-3, 3, -3],
                        opacity: [0.4, 1, 0.4],
                      }
                }
                transition={
                  shouldReduce
                    ? { duration: 0 }
                    : {
                        repeat: Infinity,
                        duration: 1.8,
                        ease: "easeInOut",
                      }
                }
                className="h-1.5 w-1.5 rounded-full bg-white"
              />
            </div>
          </div>

          {/* Right: Carousel Controls */}
          {carHeroImages.length > 1 && (
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={prevSlide}
                onMouseEnter={() => setIsLeftHovered(true)}
                onMouseLeave={() => setIsLeftHovered(false)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer focus:outline-none flex h-6 w-12 items-center justify-end relative"
                aria-label="Previous slide"
              >
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={
                    isLeftHovered
                      ? { opacity: 0.7, x: 2 }
                      : { opacity: 0, x: 8 }
                  }
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 h-6 flex items-center justify-center w-[18px]"
                >
                  <svg
                    className="h-[18px] w-[18px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 2L7 12L17 22"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
                <motion.div
                  animate={isLeftHovered ? { x: -6 } : { x: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 h-6 flex items-center justify-center w-6"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 2L7 12L17 22"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              </button>

              <div className="relative h-[1px] w-24 bg-white/40">
                <motion.div
                  className="absolute top-0 bottom-0 left-0 bg-white"
                  animate={{
                    left: `${(currentIdx / carHeroImages.length) * 100}%`,
                    width: `${100 / carHeroImages.length}%`,
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>

              <button
                type="button"
                onClick={nextSlide}
                onMouseEnter={() => setIsRightHovered(true)}
                onMouseLeave={() => setIsRightHovered(false)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer focus:outline-none flex h-6 w-12 items-center justify-start relative"
                aria-label="Next slide"
              >
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={
                    isRightHovered
                      ? { opacity: 0.7, x: -2 }
                      : { opacity: 0, x: -8 }
                  }
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-0 h-6 flex items-center justify-center w-[18px]"
                >
                  <svg
                    className="h-[18px] w-[18px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 2L17 12L7 22"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
                <motion.div
                  animate={isRightHovered ? { x: 6 } : { x: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-0 h-6 flex items-center justify-center w-6"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 2L17 12L7 22"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
