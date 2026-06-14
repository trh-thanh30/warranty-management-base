"use client";

import { useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { motionDuration, motionEase } from "@/src/constants/motion.constants";

/** Returns animation variants that respect prefers-reduced-motion */
export function useScrollReveal() {
  const shouldReduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.08,
        delayChildren: 0,
      },
    },
  };

  const fadeUp: Variants = {
    hidden: shouldReduce ? { opacity: 0 } : { opacity: 0, y: 32 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? motionDuration.instant : motionDuration.slow,
        ease: motionEase.out,
      },
    },
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: shouldReduce ? motionDuration.instant : motionDuration.reveal,
        ease: "easeOut",
      },
    },
  };

  const scaleIn: Variants = {
    hidden: shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduce ? motionDuration.instant : motionDuration.reveal,
        ease: motionEase.out,
      },
    },
  };

  const slideLeft: Variants = {
    hidden: shouldReduce ? { opacity: 0 } : { opacity: 0, x: 48 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduce ? motionDuration.instant : motionDuration.slow,
        ease: motionEase.out,
      },
    },
  };

  const slideRight: Variants = {
    hidden: shouldReduce ? { opacity: 0 } : { opacity: 0, x: -48 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduce ? motionDuration.instant : motionDuration.slow,
        ease: motionEase.out,
      },
    },
  };

  return { container, fadeUp, fadeIn, scaleIn, slideLeft, slideRight };
}

/** Standard viewport config for whileInView */
export const viewportOnce = { once: true, margin: "-80px" } as const;
