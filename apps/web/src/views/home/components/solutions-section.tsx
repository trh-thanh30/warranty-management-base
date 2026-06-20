"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";
import { leftSolutionsData, rightSolutionsData } from "../home.constants";
import { solutionsIcons } from "./solutions-icons";

export function SolutionsSection() {
  const { fadeUp } = useScrollReveal();

  return (
    <section className="w-full bg-brand-blue py-24 relative overflow-hidden text-white">
      {/* Decorative Subtle Grid / Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 w-full">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="text-center pb-20"
        >
          <div className="inline-flex items-center gap-2.5 text-sm sm:text-base font-sans font-bold uppercase tracking-[0.25em] text-white/80">
            <span>WHAT WE DO</span>
            <span className="text-white/40 text-sm sm:text-base font-sans">
              •
            </span>
            <span>SERVICES</span>
          </div>
          <h2 className="mt-4 text-3xl font-condensed font-bold uppercase tracking-wider text-white sm:text-5xl lg:text-6xl max-w-none">
            RELIABLE CAR REPAIR SOLUTIONS YOU CAN TRUST
          </h2>
          <div className="mt-6 mx-auto h-[3px] w-16 bg-white" />
        </motion.div>

        {/* 3-Column Layout */}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column (Stack vertically, text right-aligned on Desktop, icon top row) */}
          <div className="lg:col-span-4 space-y-16 order-2 lg:order-1">
            {leftSolutionsData.map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="flex flex-col items-center lg:items-end text-center lg:text-right gap-4"
              >
                {/* Icon Row */}
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-white text-brand-blue shadow-md transition-transform hover:scale-110 duration-300">
                  {solutionsIcons[item.iconKey]}
                </div>
                {/* Title Row */}
                <h3 className="text-2xl sm:text-3xl font-condensed font-bold uppercase tracking-wide text-white">
                  {item.title}
                </h3>
                {/* Description Row */}
                <p className="text-base leading-relaxed text-cloud/90 font-sans">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Center Column (Tall mechanic image) */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="lg:col-span-4 flex justify-center order-1 lg:order-2"
          >
            <div className="relative w-full max-w-[380px] aspect-[3/4] rounded-[24px] overflow-hidden shadow-2xl border-4 border-white/20">
              <Image
                src="/service_4.jpg"
                alt="Professional automotive repair"
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover transition-transform duration-[600ms] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Right Column (Stack vertically, text left-aligned, icon top row) */}
          <div className="lg:col-span-4 space-y-16 order-3">
            {rightSolutionsData.map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4"
              >
                {/* Icon Row */}
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-white text-brand-blue shadow-md transition-transform hover:scale-110 duration-300">
                  {solutionsIcons[item.iconKey]}
                </div>
                {/* Title Row */}
                <h3 className="text-2xl sm:text-3xl font-condensed font-bold uppercase tracking-wide text-white">
                  {item.title}
                </h3>
                {/* Description Row */}
                <p className="text-base leading-relaxed text-cloud/90 font-sans">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
