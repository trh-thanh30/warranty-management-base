"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Clock, Menu, X, Send } from "lucide-react";
import { navItems, carHeroImages } from "../home.constants";
import { motionDuration, motionEase } from "@/src/constants/motion.constants";

interface HeroSectionProps {
  onOpenHub?: (tab: "lookup" | "activate" | "claim") => void;
}

export function HeroSection({ onOpenHub }: HeroSectionProps) {
  const shouldReduce = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled((prev) => {
        if (currentScrollY > 100) return true;
        if (currentScrollY < 20) return false;
        return prev;
      });
      if (currentScrollY < 80) {
        setActiveSection("home");
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = navItems.map((item) =>
      item.toLowerCase().replaceAll(" ", "-"),
    );

    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0,
    };

    let timeoutId: NodeJS.Timeout | null = null;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (window.scrollY >= 80) {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              setActiveSection(entry.target.id);
            }, 80); // Debounce to prevent layoutId indicator flickering during rapid scrolls
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section
      id="home"
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

      {/* Navigation header — fixed top-0 w-full */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 w-full flex flex-col transition-all duration-[400ms] ease-out pointer-events-none"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
        }}
      >
        {/* Top Bar - hidden when scrolled */}
        <div
          className={`w-full bg-brand-blue text-white transition-all duration-[400ms] ease-out overflow-hidden pointer-events-auto ${
            isScrolled
              ? "h-0 opacity-0 -translate-y-full"
              : "h-10 opacity-100 flex items-center justify-between px-6 lg:px-12 border-b border-white/10"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-sans font-medium uppercase tracking-wider">
            <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>info@garanty.com</span>
          </div>
          <div className="hidden lg:block text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-white/95">
            Welcome to Garanty - Your Trusted Vehicle Warranty Partner
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-sans font-medium uppercase tracking-wider">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Mon-Fri: 09:00 AM - 6:00 PM</span>
          </div>
        </div>

        {/* Menu Bar / Capsule Wrapper */}
        <div
          className={`w-full transition-all duration-[400ms] ease-out pointer-events-auto ${
            isScrolled ? "px-0" : "px-6 lg:px-12"
          }`}
        >
          <motion.div
            className={`mx-auto flex items-center justify-between transition-all duration-[400ms] ease-out ${
              isScrolled
                ? "w-full max-w-none rounded-none bg-brand-blue/95 backdrop-blur-md border-0 border-b border-white/10 px-8 py-3 shadow-md mt-0"
                : "max-w-[1440px] rounded-[28px] bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3.5 shadow-lg mt-3"
            }`}
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
            <div className="flex items-center lg:w-[150px]">
              <span className="text-sm font-condensed font-bold tracking-[0.4em] text-white uppercase">
                GARANTY
              </span>
            </div>

            {/* Nav items — centered, clean, medium weight */}
            <nav className="hidden items-center gap-1.5 lg:flex">
              {navItems.map((item) => {
                const itemTargetId = item.toLowerCase().replaceAll(" ", "-");
                const isActive = activeSection === itemTargetId;

                return (
                  <motion.a
                    key={item}
                    href={`#${itemTargetId}`}
                    className={`relative text-sm font-condensed font-medium uppercase tracking-wider px-4 py-1.5 rounded-full transition-colors duration-[330ms] z-10 ${
                      isScrolled
                        ? isActive
                          ? "text-brand-blue font-semibold"
                          : "text-white/90 hover:text-white hover:bg-white/15"
                        : isActive
                          ? "text-white font-semibold"
                          : "text-white/90 hover:text-white hover:bg-brand-blue"
                    }`}
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
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className={`absolute inset-0 rounded-full -z-10 ${
                          isScrolled ? "bg-white" : "bg-brand-blue"
                        }`}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    {item}
                  </motion.a>
                );
              })}
            </nav>

            {/* CTA — flat, barely rounded outline button */}
            {/* <motion.button
              onClick={onOpenQuote}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative hidden sm:inline-flex items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/5 px-6 py-2.5 text-sm font-condensed font-semibold uppercase tracking-wider text-white transition-all duration-[330ms] cursor-pointer"
            >
              <span className="absolute inset-0 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-[300ms] ease-out z-0" />
              <span className="relative z-10 transition-colors duration-[330ms] group-hover:text-brand-blue">
                CHECK PRICE
              </span>
            </motion.button> */}
            {/* Spacer to center the nav items (balances logo width on desktop) */}
            <div className="hidden lg:block lg:w-[150px]" />

            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center p-2 rounded-full text-white hover:bg-white/10 transition-all duration-[300ms] lg:hidden cursor-pointer"
              aria-label="Toggle Menu"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <Menu
                  className={`absolute h-5 w-5 transition-all duration-300 ${isMobileMenuOpen ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
                />
                <X
                  className={`absolute h-5 w-5 transition-all duration-300 ${isMobileMenuOpen ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`}
                />
              </div>
            </button>
          </motion.div>
        </div>

        {/* Mobile Menu Overlay Card */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed left-4 right-4 z-50 rounded-[28px] bg-white/95 backdrop-blur-md p-6 shadow-2xl border border-cloud pointer-events-auto lg:hidden ${
                isScrolled ? "top-4" : "top-14"
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between pb-4 border-b border-cloud">
                {/* Logo */}
                <span className="text-sm font-condensed font-bold tracking-[0.4em] text-charcoal uppercase">
                  GARANTY
                </span>
                {/* Close Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center p-2 rounded-full text-charcoal/80 hover:text-charcoal hover:bg-charcoal/5 transition-colors cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu Links */}
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => {
                  const itemTargetId = item.toLowerCase().replaceAll(" ", "-");
                  const isActive = activeSection === itemTargetId;
                  return (
                    <a
                      key={item}
                      href={`#${itemTargetId}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`relative text-lg font-condensed font-semibold uppercase tracking-wider px-5 py-1.5 rounded-full transition-colors duration-200 w-fit ${
                        isActive
                          ? "bg-brand-blue text-white"
                          : "text-charcoal hover:bg-brand-blue hover:text-white"
                      }`}
                    >
                      {item}
                    </a>
                  );
                })}
              </nav>

              {/* CTA Button */}
              {onOpenHub && (
                <div className="mt-8">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenHub("lookup");
                    }}
                    className="flex h-11 px-8 items-center justify-center rounded-full bg-brand-blue text-xs font-condensed font-bold uppercase tracking-wider text-white hover:bg-brand-blue-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-[300ms] cursor-pointer w-full"
                  >
                    WARRANTY HUB
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] lg:leading-[64px] font-condensed font-bold leading-tight tracking-[0.01em] text-white uppercase overflow-hidden">
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
                className="mt-4 text-base sm:text-lg text-white/80 max-w-xl font-condensed font-medium leading-relaxed"
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
                onClick={() => onOpenHub?.("lookup")}
                whileTap={{ scale: 0.98 }}
                className="group relative flex h-12 w-full sm:w-[240px] items-center justify-center overflow-hidden rounded-full bg-brand-blue text-sm font-condensed font-medium uppercase tracking-wider text-white transition-all duration-[330ms] cursor-pointer shadow-sm"
              >
                {/* Horizontal slide-in fill effect */}
                <span className="absolute inset-0 bg-brand-blue-hover -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
                <span className="relative z-10">CHECK WARRANTY STATUS</span>
              </motion.button>

              <motion.button
                onClick={() => onOpenHub?.("activate")}
                whileTap={{ scale: 0.98 }}
                className="group relative flex h-12 w-full sm:w-[240px] items-center justify-center overflow-hidden rounded-full bg-white/80 text-sm font-condensed font-medium uppercase tracking-wider text-charcoal backdrop-blur-sm transition-all duration-[330ms] cursor-pointer shadow-sm"
              >
                {/* Horizontal slide-in fill effect */}
                <span className="absolute inset-0 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
                <span className="relative z-10 transition-colors duration-[330ms] group-hover:text-brand-blue">
                  ACTIVATE WARRANTY
                </span>
              </motion.button>
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
