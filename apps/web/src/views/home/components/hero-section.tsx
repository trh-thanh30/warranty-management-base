"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Button } from "@repo/ui/button";
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

      {/* Navigation header — floating capsule glassmorphism bar */}
      <motion.header
        className="relative z-20 px-4 pt-5 sm:px-6 lg:px-10"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
        }}
      >
        <motion.div
          className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/8 bg-black/15 px-6 py-2.5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
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
            <span className="text-sm font-extrabold tracking-widest text-white">
              LOGO
            </span>
          </div>

          {/* Nav items — centered, uppercase small caps */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
                className="text-sm font-semibold uppercase tracking-widest text-white/55 transition-colors duration-200 hover:text-white"
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

          {/* CTA — rounded-full outline button */}
          <motion.a
            href="#pricing"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="hidden sm:inline-flex items-center rounded-full border border-white/20 px-5 py-2 text-sm font-bold uppercase tracking-[0.12em] text-white/90 transition-all duration-200 hover:border-white/50 hover:bg-white/5"
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
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight text-white uppercase overflow-hidden">
              {(carHeroImages[currentIdx]?.title ?? "")
                .split(" ")
                .map((word, i) => (
                  <motion.span
                    key={i}
                    className="mr-[0.25em] inline-block"
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4, ease: "easeOut" },
                      },
                      exit: {
                        opacity: 0,
                        y: -20,
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
                className="mt-4 text-base text-white/70 max-w-lg"
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: "easeOut" },
                  },
                  exit: {
                    opacity: 0,
                    y: -15,
                    transition: { duration: 0.2, ease: "easeIn" },
                  },
                }}
              >
                {carHeroImages[currentIdx]?.description}
              </motion.p>
            </div>

            {/* CTA Button */}
            <motion.div
              className="mt-6"
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: "easeOut" },
                },
                exit: {
                  opacity: 0,
                  y: -15,
                  transition: { duration: 0.2, ease: "easeIn" },
                },
              }}
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                <Button
                  onClick={onOpenQuote}
                  className="h-12 rounded-full px-8 text-sm font-bold uppercase tracking-wider cursor-pointer"
                >
                  Get a quote
                </Button>
              </motion.div>
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
