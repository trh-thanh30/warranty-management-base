"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { carHeroImages } from "../home.constants";
import { motionDuration } from "@/src/constants/motion.constants";

export function HeroSection() {
  const t = useTranslations("HomePage.hero");
  const shouldReduce = useReducedMotion();
  const [currentIdx, setCurrentIdx] = useState(0);
  const activeImage = carHeroImages[currentIdx] ?? {
    id: "primary",
    src: "/feat1.jpg",
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
      id="home"
      className="relative flex aspect-[4/5] h-auto flex-col overflow-hidden sm:aspect-auto sm:h-[calc(100dvh-84px)]"
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
            {/* Desktop Hero Image */}
            <Image
              src={activeImage.src}
              alt={t(`slides.${activeImage.id}.alt`)}
              fill
              priority
              sizes="100vw"
              className="hidden sm:block object-cover object-center"
            />

            {/* Mobile Hero Image (fallback to Desktop src if srcMobile is not provided) */}
            <Image
              src={activeImage.srcMobile || activeImage.src}
              alt={t(`slides.${activeImage.id}.alt`)}
              fill
              priority
              sizes="100vw"
              className="block sm:hidden object-cover object-center"
            />
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
                aria-label={t("previousSlideAriaLabel")}
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
                aria-label={t("nextSlideAriaLabel")}
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
