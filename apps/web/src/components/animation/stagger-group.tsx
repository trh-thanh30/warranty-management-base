"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type StaggerGroupProps = {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
};

export function StaggerGroup({
  children,
  staggerDelay = 0.18,
  className = "",
  once = false,
}: StaggerGroupProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-30px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  scale?: number;
  className?: string;
};

export function StaggerItem({
  children,
  direction = "up",
  distance = 36,
  scale = 0.95,
  className = "",
}: StaggerItemProps) {
  const getInitialOffset = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      case "none":
        return { x: 0, y: 0 };
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale, ...getInitialOffset() },
    show: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
