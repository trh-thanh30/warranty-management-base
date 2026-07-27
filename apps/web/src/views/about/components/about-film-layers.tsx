"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { aboutFilmLayerDetails, aboutFilmLayerIds } from "../about.constants";

export function AboutFilmLayers() {
  const t = useTranslations("AboutPage");
  const [activeLayerIndex, setActiveLayerIndex] = useState<number | null>(null);

  return (
    <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 items-center">
      {/* 3D STAGE - Left 5 Columns */}
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="sticky top-24 flex aspect-square w-full max-w-md mx-auto items-center justify-center rounded-md border border-border-gray bg-white p-6 sm:p-8 shadow-md [perspective:1100px] lg:col-span-5"
      >
        <div className="relative h-[75%] w-[75%] [transform-style:preserve-3d] [transform:rotateX(56deg)_rotateZ(-45deg)]">
          {aboutFilmLayerDetails.map((layer, index) => {
            const isHovered = activeLayerIndex === index;
            const isDimmed = activeLayerIndex !== null && !isHovered;

            return (
              <div
                key={layer.id}
                onMouseEnter={() => setActiveLayerIndex(index)}
                onMouseLeave={() => setActiveLayerIndex(null)}
                className={`absolute inset-0 rounded-md border border-black/20 shadow-md transition-all duration-500 ease-out cursor-pointer ${
                  isDimmed ? "opacity-25 grayscale-[60%]" : "opacity-100"
                } ${isHovered ? "scale-105 shadow-2xl ring-2 ring-premium-red" : ""}`}
                style={{
                  backgroundColor: layer.color,
                  transform: `translateZ(${isHovered ? layer.zOffset + 24 : layer.zOffset}px)`,
                }}
              />
            );
          })}
        </div>
      </motion.div>

      {/* LAYER LIST - Right 7 Columns (Wide, spacious, easy to read) */}
      <motion.div
        initial={{ opacity: 1, x: 0 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-4 lg:col-span-7"
      >
        <p className="text-xs sm:text-sm font-semibold text-stone-gray font-sans uppercase tracking-wider">
          {t("filmLayers.instruction")}
        </p>

        <div className="space-y-3">
          {aboutFilmLayerIds.map((layerId, index) => {
            const details = aboutFilmLayerDetails[index] ?? {
              color: "var(--color-premium-red)",
            };
            const isHovered = activeLayerIndex === index;

            return (
              <div
                key={layerId}
                onMouseEnter={() => setActiveLayerIndex(index)}
                onMouseLeave={() => setActiveLayerIndex(null)}
                className={`group flex items-start gap-4 rounded-md border p-4 sm:p-5 transition-all duration-300 cursor-pointer ${
                  isHovered
                    ? "border-premium-red bg-white shadow-md translate-x-2"
                    : "border-border-gray/70 bg-white hover:border-premium-red"
                }`}
              >
                <span
                  className="mt-1 size-3.5 shrink-0 rounded-md transition-transform group-hover:scale-125"
                  style={{ backgroundColor: details.color }}
                />
                <div>
                  <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider text-deep-black font-sans">
                    {t(`filmLayers.items.${layerId}.title`)}
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-stone-gray font-sans text-left text-pretty">
                    {t(`filmLayers.items.${layerId}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
