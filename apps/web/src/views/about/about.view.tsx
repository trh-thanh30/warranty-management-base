"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import {
  aboutCompassNeedleVariants,
  aboutFilmLayerDetails,
  aboutFilmLayerIds,
  aboutOriginTimelineIds,
  aboutPerformanceItems,
  aboutStatItems,
} from "./about.constants";

function StatCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  return (
    <motion.span
      onViewportEnter={() => {
        const duration = 1400;
        const startTime = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const current = Math.round((1 - Math.pow(1 - progress, 3)) * target);
          setCount(current);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }}
      viewport={{ once: true }}
    >
      {count}
      {suffix}
    </motion.span>
  );
}

export function AboutView() {
  const t = useTranslations("AboutPage");
  const marqueeItems = t.raw("marquee") as string[];
  const shouldReduceMotion = useReducedMotion();

  // Interactive 3D layer stack state
  const [activeLayerIndex, setActiveLayerIndex] = useState<number | null>(null);

  // Hero 3D tilt effect state
  const [heroTilt, setHeroTilt] = useState({ rotateX: 8, rotateY: -16 });

  // Core-Tech tabs state
  const [activeTechTab, setActiveTechTab] = useState<"sputter" | "nano">(
    "sputter",
  );

  // Spotlight effect state
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 40 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHeroTilt({ rotateX: 0, rotateY: 0 });
      return;
    }

    const handlePointerMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      setHeroTilt({
        rotateY: -16 + x * 14,
        rotateX: 8 - y * 12,
      });
    };

    window.addEventListener("mousemove", handlePointerMove);
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, []);

  const handleSpotlightMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotlightPos({ x, y });
  };

  return (
    <main className="w-full overflow-x-hidden bg-white text-deep-black">
      {/* HERO SECTION */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-white pt-24 pb-20 sm:pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_72%_18%,rgba(219,33,20,0.14),transparent_60%),radial-gradient(55%_55%_at_8%_92%,rgba(4,7,8,0.04),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(4,7,8,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(4,7,8,0.04)_1px,transparent_1px)] bg-[size:64px_64px] opacity-60 [mask-image:radial-gradient(70%_70%_at_50%_40%,#000,transparent)]" />

        <div className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-12 px-6 sm:px-10 lg:grid-cols-12 lg:px-12">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 lg:col-span-7"
          >
            <span className="inline-block rounded-full bg-premium-red px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white shadow-xs">
              {t("hero.eyebrow")}
            </span>
            <h1 className="font-condensed text-2xl xs:text-3xl sm:text-6xl lg:text-7xl font-semibold uppercase leading-snug tracking-tight text-deep-black">
              <span className="block sm:inline whitespace-nowrap">
                {t("hero.titlePrefix")}
              </span>{" "}
              <span className="block sm:inline whitespace-nowrap">
                <span className="text-premium-red">
                  {t("hero.titleHighlight")}
                </span>{" "}
                {t("hero.titleSuffix")}
              </span>
            </h1>
            <p className="max-w-xl text-base font-medium leading-relaxed text-stone-gray sm:text-lg lg:text-xl text-left text-pretty">
              {t("hero.description")}
            </p>
            <div className="flex flex-col sm:flex-row sm:gap-8 border-t border-border-gray pt-4 sm:pt-6 text-xs font-semibold uppercase tracking-widest text-stone-gray">
              <div className="flex items-center justify-between sm:block py-2.5 sm:py-0 border-b sm:border-b-0 border-border-gray">
                <span className="text-xl font-semibold text-deep-black sm:text-3xl sm:block leading-none sm:mb-1">
                  {t("hero.stats.uvIrValue")}
                </span>
                <span className="text-stone-gray">{t("hero.stats.uvIr")}</span>
              </div>
              <div className="flex items-center justify-between sm:block py-2.5 sm:py-0 border-b sm:border-b-0 border-border-gray sm:border-l sm:pl-8">
                <span className="inline-flex items-center gap-2 text-xl font-semibold text-deep-black sm:text-3xl sm:inline-flex leading-none sm:mb-1">
                  <span
                    data-about-origin-flag
                    aria-hidden="true"
                    className="inline-flex size-5 sm:size-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-gray bg-white shadow-xs translate-y-[1px]"
                  >
                    <span className="size-2 sm:size-2.5 rounded-full bg-premium-red" />
                  </span>
                  <span className="leading-none">
                    {t("hero.stats.originValue")}
                  </span>
                </span>
                <span className="text-stone-gray sm:block">
                  {t("hero.stats.origin")}
                </span>
              </div>
              <div className="flex items-center justify-between sm:block py-2.5 sm:py-0 sm:border-l sm:pl-8">
                <span className="text-xl font-semibold text-deep-black sm:text-3xl sm:block leading-none sm:mb-1">
                  {t("hero.stats.technologyValue")}
                </span>
                <span className="text-stone-gray">
                  {t("hero.stats.technology")}
                </span>
              </div>
            </div>
          </motion.div>

          {/* 3D PARALLAX FILM PANE */}
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative aspect-[16/10] sm:aspect-[4/3] w-full mt-6 sm:mt-0 [perspective:900px] lg:col-span-5"
          >
            <div
              className="group relative h-full w-full rounded-[28px] sm:rounded-[34px] border border-white/20 bg-gradient-to-br from-graphite to-deep-black shadow-2xl transition-transform duration-200 ease-out cursor-pointer"
              style={{
                transform: `rotateY(${heroTilt.rotateY}deg) rotateX(${heroTilt.rotateX}deg)`,
              }}
            >
              <div className="absolute inset-0 rounded-[28px] sm:rounded-[34px] bg-[linear-gradient(115deg,transparent_32%,rgba(219,33,20,0.35)_50%,transparent_68%)] mix-blend-screen" />
              <div className="relative flex h-full flex-col justify-between p-6 sm:p-8 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-premium-red backdrop-blur-md">
                    {t("hero.brandLabel")}
                  </span>
                  <Sparkles className="size-5 text-premium-red" />
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-xs tracking-widest text-white/60">
                    {t("hero.originLabel")}
                  </span>
                  <h3 className="font-condensed text-xl sm:text-2xl font-semibold uppercase tracking-wider text-premium-red">
                    {t("hero.productLabel")}
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-stone-gray pointer-events-none z-20">
          <span>{t("hero.scrollCue")}</span>
          <div className="mx-auto mt-2 h-8 w-0.5 animate-bounce bg-gradient-to-b from-premium-red to-transparent" />
        </div>
      </section>

      {/* MARQUEE */}
      <div
        aria-hidden="true"
        className="overflow-hidden border-y border-border-gray bg-white py-4 text-deep-black"
      >
        <div className="flex w-max animate-marquee-left items-center gap-12 whitespace-nowrap text-sm font-semibold uppercase tracking-wider text-deep-black/80 will-change-transform hover:[animation-play-state:paused]">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-12">
              <span>{item}</span>
              <span className="font-semibold text-premium-red">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* 01 MANIFESTO */}
      <section
        className="relative border-b border-border-gray bg-white py-12 lg:py-16"
        id="intro"
      >
        <span className="absolute top-16 left-4 hidden rotate-180 border-t-4 border-premium-red pt-3 text-xs font-semibold uppercase tracking-[0.42em] text-deep-black [writing-mode:vertical-rl] lg:block">
          {t("sectionRails.intro")}
        </span>
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
          >
            <span
              className="font-condensed text-5xl sm:text-8xl lg:text-9xl font-semibold leading-none tracking-tighter shrink-0"
              style={{
                WebkitTextStroke: "2.5px #94A3B8",
                color: "transparent",
              }}
            >
              01
            </span>
            <div>
              <span className="inline-block rounded-full bg-premium-red px-3.5 py-1 text-xs sm:text-xs font-semibold uppercase tracking-widest text-white whitespace-nowrap">
                {t("intro.eyebrow")}
              </span>
              <h2 className="mt-1.5 sm:mt-2 font-condensed text-2xl sm:text-5xl font-semibold uppercase tracking-tight text-deep-black leading-snug">
                {t("intro.title")}
              </h2>
            </div>
          </motion.div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 items-start lg:items-start">
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative lg:col-span-6"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] sm:rounded-[34px] border border-border-gray bg-surface-muted shadow-xl">
                <Image
                  src="/feat1.jpg"
                  alt={t("hero.imageAlt")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 rounded-full bg-premium-red px-3 py-1 text-xs sm:text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                  {t("intro.mainTag")}
                </span>
              </div>
              <div className="absolute -right-4 -bottom-6 hidden aspect-[4/3] w-1/2 overflow-hidden rounded-[21px] border-4 border-white bg-surface-muted shadow-2xl sm:block">
                <Image
                  src="/sanpham/491785581_659103893492716_3763861878564125633_n.jpg"
                  alt={t("hero.imageAlt")}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-5 lg:col-span-6 mt-2 sm:mt-0"
            >
              <blockquote className="border-l-4 border-premium-red pl-4 sm:pl-6 text-lg sm:text-2xl font-semibold leading-relaxed text-deep-black text-left text-pretty">
                {t("intro.pullquote")}
              </blockquote>
              <div className="space-y-4 text-base sm:text-lg font-medium leading-relaxed text-stone-gray text-left text-pretty">
                <p>{t("intro.p1")}</p>
                <p>{t("intro.p2")}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 02 INTERACTIVE LAYERS (ANATOMY) */}
      <section
        className="relative border-b border-border-gray bg-surface-muted py-12 lg:py-16"
        id="layers"
      >
        <span className="absolute top-16 left-4 hidden rotate-180 border-t-4 border-premium-red pt-3 text-xs font-semibold uppercase tracking-[0.42em] text-deep-black [writing-mode:vertical-rl] lg:block">
          {t("sectionRails.anatomy")}
        </span>
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
          >
            <span
              className="font-condensed text-5xl sm:text-8xl lg:text-9xl font-semibold leading-none tracking-tighter shrink-0"
              style={{
                WebkitTextStroke: "2.5px #94A3B8",
                color: "transparent",
              }}
            >
              02
            </span>
            <div>
              <span className="inline-block rounded-full bg-premium-red px-3.5 py-1 text-xs sm:text-xs font-semibold uppercase tracking-widest text-white whitespace-nowrap">
                {t("filmLayers.eyebrow")}
              </span>
              <h2 className="mt-1.5 sm:mt-2 font-condensed text-2xl sm:text-5xl font-semibold uppercase tracking-tight text-deep-black leading-snug">
                {t("filmLayers.title")}
              </h2>
            </div>
          </motion.div>

          <div className="grid gap-8 lg:gap-12 lg:grid-cols-12">
            {/* 3D STAGE */}
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="sticky top-24 flex aspect-square w-full max-w-md mx-auto items-center justify-center rounded-[28px] sm:rounded-[34px] border border-border-gray bg-white p-4 sm:p-8 shadow-inner [perspective:1100px] lg:col-span-6"
            >
              <div className="relative h-[72%] w-[72%] [transform-style:preserve-3d] [transform:rotateX(56deg)_rotateZ(-45deg)]">
                {aboutFilmLayerDetails.map((layer, index) => {
                  const isHovered = activeLayerIndex === index;
                  const isDimmed = activeLayerIndex !== null && !isHovered;

                  return (
                    <div
                      key={layer.id}
                      onMouseEnter={() => setActiveLayerIndex(index)}
                      onMouseLeave={() => setActiveLayerIndex(null)}
                      className={`absolute inset-0 rounded-2xl border border-black/20 shadow-md transition-all duration-500 ease-out cursor-pointer ${
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

            {/* LAYER LIST */}
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-4 lg:col-span-6"
            >
              <p className="text-sm font-semibold text-stone-gray">
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
                      className={`group flex items-start gap-4 rounded-2xl border p-4 sm:p-5 transition-all duration-300 cursor-pointer ${
                        isHovered
                          ? "border-premium-red bg-white shadow-lg translate-x-2"
                          : "border-border-gray bg-white/70 hover:border-premium-red hover:bg-white"
                      }`}
                    >
                      <span
                        className="mt-1 size-4 shrink-0 rounded-full transition-transform group-hover:scale-125"
                        style={{ backgroundColor: details.color }}
                      />
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-deep-black">
                          {t(`filmLayers.items.${layerId}.title`)}
                        </h4>
                        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-stone-gray text-left text-pretty">
                          {t(`filmLayers.items.${layerId}.description`)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 03 ORIGIN */}
      <section
        className="relative border-b border-border-gray bg-white py-12 lg:py-16"
        id="origin"
      >
        <span className="absolute top-16 left-4 hidden rotate-180 border-t-4 border-premium-red pt-3 text-xs font-semibold uppercase tracking-[0.42em] text-deep-black [writing-mode:vertical-rl] lg:block">
          {t("sectionRails.origin")}
        </span>
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
          >
            <span
              className="font-condensed text-5xl sm:text-8xl lg:text-9xl font-semibold leading-none tracking-tighter shrink-0"
              style={{
                WebkitTextStroke: "2.5px #94A3B8",
                color: "transparent",
              }}
            >
              03
            </span>
            <div>
              <span className="inline-block rounded-full bg-premium-red px-3.5 py-1 text-xs sm:text-xs font-semibold uppercase tracking-widest text-white whitespace-nowrap">
                {t("origin.eyebrow")}
              </span>
              <h2 className="mt-1.5 sm:mt-2 font-condensed text-2xl sm:text-5xl font-semibold uppercase tracking-tight text-deep-black leading-snug">
                {t("origin.title")}
              </h2>
            </div>
          </motion.div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 items-start lg:items-start">
            {/* JAPANESE FLAG VECTOR */}
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[3/2] w-full max-w-md mx-auto overflow-hidden rounded-[24px] sm:rounded-[28px] border border-border-gray bg-white shadow-xl lg:col-span-5"
            >
              <svg viewBox="0 0 360 240" className="h-full w-full">
                <rect width="360" height="240" fill="#fff" />
                <circle cx="180" cy="120" r="72" fill="#BC002D" />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-4 lg:col-span-7"
            >
              <div className="font-condensed font-semibold leading-tight tracking-tight text-deep-black">
                <span className="block text-3xl xs:text-4xl sm:text-7xl lg:text-8xl text-premium-red">
                  {t("origin.badgeValue")}
                </span>
                <span className="block whitespace-nowrap text-lg xs:text-xl sm:text-5xl lg:text-6xl mt-1">
                  {t("origin.badgeLabel")}
                </span>
              </div>
              <div className="space-y-3 text-base sm:text-lg font-medium leading-relaxed text-stone-gray text-left text-pretty">
                <p>{t("origin.p1")}</p>
                <p>{t("origin.p2")}</p>
              </div>
              <div className="grid gap-4 border-t border-border-gray pt-5 grid-cols-1 sm:grid-cols-3">
                {aboutOriginTimelineIds.map((item) => (
                  <div key={item} className="border-l border-border-gray pl-4">
                    <span className="block text-xs font-semibold uppercase tracking-widest text-deep-black">
                      {t(`origin.timeline.${item}.title`)}
                    </span>
                    <p className="mt-1 text-xs leading-relaxed text-stone-gray text-left text-pretty">
                      {t(`origin.timeline.${item}.description`)}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 04 CORE-TECH TABS */}
      <section
        className="relative border-b border-border-gray bg-surface-muted py-12 lg:py-16"
        id="core"
      >
        <span className="absolute top-16 left-4 hidden rotate-180 border-t-4 border-premium-red pt-3 text-xs font-semibold uppercase tracking-[0.42em] text-deep-black [writing-mode:vertical-rl] lg:block">
          {t("sectionRails.coreTech")}
        </span>
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
              <span
                className="font-condensed text-5xl sm:text-8xl lg:text-9xl font-semibold leading-none tracking-tighter shrink-0"
                style={{
                  WebkitTextStroke: "2.5px #94A3B8",
                  color: "transparent",
                }}
              >
                04
              </span>
              <div>
                <span className="inline-block rounded-full bg-premium-red px-3.5 py-1 text-xs sm:text-xs font-semibold uppercase tracking-widest text-white whitespace-nowrap">
                  {t("coreTech.eyebrow")}
                </span>
                <h2 className="mt-1.5 sm:mt-2 font-condensed text-2xl sm:text-5xl font-semibold uppercase tracking-tight text-deep-black leading-snug">
                  {t("coreTech.title")}
                </h2>
              </div>
            </div>
            <p className="mt-4 text-base sm:text-lg font-medium leading-relaxed text-stone-gray max-w-2xl text-left text-pretty">
              {t("coreTech.subtitle")}
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* TABS HEADER */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTechTab("sputter")}
                className={`w-full sm:w-auto text-center rounded-xl sm:rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTechTab === "sputter"
                    ? "bg-premium-red text-white shadow-md"
                    : "bg-white border border-border-gray text-deep-black hover:bg-surface-muted"
                }`}
              >
                {t("coreTech.sputtering.title")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTechTab("nano")}
                className={`w-full sm:w-auto text-center rounded-xl sm:rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTechTab === "nano"
                    ? "bg-premium-red text-white shadow-md"
                    : "bg-white border border-border-gray text-deep-black hover:bg-surface-muted"
                }`}
              >
                {t("coreTech.nanoCeramic.title")}
              </button>
            </div>

            {/* TAB PANELS */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTechTab}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="grid gap-6 sm:gap-8 lg:grid-cols-12 items-start lg:items-start pt-2 sm:pt-4"
              >
                {activeTechTab === "sputter" ? (
                  <>
                    <div className="space-y-3 lg:col-span-6">
                      <h3 className="font-condensed text-xl xs:text-2xl sm:text-3xl font-semibold uppercase tracking-wider text-deep-black leading-snug">
                        {t("coreTech.sputtering.title")}
                      </h3>
                      <p className="text-base sm:text-lg font-medium leading-relaxed text-stone-gray text-left text-pretty">
                        {t("coreTech.sputtering.description")}
                      </p>
                      <ul className="space-y-2 text-sm sm:text-base font-semibold text-deep-black pt-2">
                        <li className="flex items-center gap-3">
                          <span className="h-0.5 w-4 bg-premium-red shrink-0" />
                          <span>{t("coreTech.sputtering.b1")}</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="h-0.5 w-4 bg-premium-red shrink-0" />
                          <span>{t("coreTech.sputtering.b2")}</span>
                        </li>
                      </ul>
                    </div>
                    <div className="relative aspect-[4/3] w-full max-w-md mx-auto overflow-hidden rounded-[24px] sm:rounded-[28px] border border-border-gray bg-white shadow-md flex items-center justify-center lg:col-span-6">
                      <div className="absolute inset-[3%] rounded-full border border-black/10 animate-[spin_18s_linear_infinite]" />
                      <div className="absolute inset-[17%] animate-[spin_12s_linear_infinite_reverse] rounded-full border-2 border-premium-red" />
                      <div className="absolute inset-[33%] rounded-full border border-black/10 animate-[spin_8s_linear_infinite]" />
                      <div
                        className="absolute inset-0 m-auto w-[14%] h-[14%] rounded-full bg-premium-red"
                        style={{ filter: "blur(5px)", opacity: 0.5 }}
                      />
                      <div className="absolute inset-0 m-auto w-[7%] h-[7%] rounded-full bg-premium-red" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3 lg:col-span-6">
                      <h3 className="font-condensed text-xl xs:text-2xl sm:text-3xl font-semibold uppercase tracking-wider text-deep-black leading-snug">
                        {t("coreTech.nanoCeramic.title")}
                      </h3>
                      <p className="text-base sm:text-lg font-medium leading-relaxed text-stone-gray text-left text-pretty">
                        {t("coreTech.nanoCeramic.description")}
                      </p>
                      <ul className="space-y-2 text-sm sm:text-base font-semibold text-deep-black pt-2">
                        <li className="flex items-center gap-3">
                          <span className="h-0.5 w-4 bg-premium-red shrink-0" />
                          <span>{t("coreTech.nanoCeramic.b1")}</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="h-0.5 w-4 bg-premium-red shrink-0" />
                          <span>{t("coreTech.nanoCeramic.b2")}</span>
                        </li>
                      </ul>
                    </div>
                    <div className="relative aspect-[4/3] w-full max-w-md mx-auto overflow-hidden rounded-[24px] sm:rounded-[28px] border border-border-gray bg-white shadow-md flex items-center justify-center lg:col-span-6">
                      <div className="absolute inset-[3%] rounded-full border border-black/10 animate-[spin_20s_linear_infinite]" />
                      <div className="absolute inset-[17%] animate-[spin_14s_linear_infinite_reverse] rounded-full border-2 border-premium-red" />
                      <div className="absolute inset-[33%] rounded-full border border-black/10 animate-[spin_10s_linear_infinite]" />
                      <div
                        className="absolute inset-0 m-auto w-[14%] h-[14%] rounded-full bg-premium-red"
                        style={{ filter: "blur(5px)", opacity: 0.5 }}
                      />
                      <div className="absolute inset-0 m-auto w-[7%] h-[7%] rounded-full bg-premium-red" />
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* STATS BAND WITH ANIMATED COUNTER */}
      <div className="border-y border-border-gray bg-white py-12 text-deep-black">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-12">
          {aboutStatItems.map((item) => (
            <div
              key={item.id}
              className="text-center border-l border-border-gray first:border-l-0 pl-4 first:pl-0"
            >
              <div className="font-condensed text-5xl font-semibold tracking-tight text-premium-red sm:text-6xl">
                <StatCounter target={item.target} suffix={item.suffix} />
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-stone-gray">
                {t(`stats.${item.id}`)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 05 PERFORMANCE BENTO */}
      <section
        className="relative border-b border-border-gray bg-white py-12 lg:py-16"
        id="performance"
      >
        <span className="absolute top-16 left-4 hidden rotate-180 border-t-4 border-premium-red pt-3 text-xs font-semibold uppercase tracking-[0.42em] text-deep-black [writing-mode:vertical-rl] lg:block">
          {t("sectionRails.performance")}
        </span>
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6"
          >
            <span
              className="font-condensed text-5xl sm:text-8xl lg:text-9xl font-semibold leading-none tracking-tighter shrink-0"
              style={{
                WebkitTextStroke: "2.5px #94A3B8",
                color: "transparent",
              }}
            >
              05
            </span>
            <div>
              <span className="inline-block rounded-full bg-premium-red px-3.5 py-1 text-xs sm:text-xs font-semibold uppercase tracking-widest text-white whitespace-nowrap">
                {t("performance.eyebrow")}
              </span>
              <h2 className="mt-1.5 sm:mt-2 font-condensed text-2xl sm:text-4xl font-semibold uppercase tracking-tight text-deep-black leading-snug">
                {t("performance.title")}
              </h2>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/3] sm:col-span-2 sm:row-span-2 overflow-hidden rounded-[24px] sm:rounded-[34px] border border-border-gray bg-surface-muted shadow-lg"
            >
              <Image
                src="/sanpham/660867658_932031392866630_1775108430541815111_n.jpg"
                alt={t("performance.imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover"
              />
              <span className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4 rounded-full bg-premium-red px-3 py-1 text-xs sm:text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                {t("performance.imageCaption")}
              </span>
            </motion.div>
            {aboutPerformanceItems.map((itemId) => (
              <motion.div
                key={itemId}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-border-gray bg-surface-muted p-5 sm:p-6 transition-all hover:border-premium-red hover:shadow-lg"
              >
                <div className="flex items-center gap-2.5">
                  <Check className="size-5 shrink-0 text-premium-red" />
                  <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-deep-black">
                    {t(`performance.items.${itemId}.title`)}
                  </h3>
                </div>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-gray text-left text-pretty">
                  {t(`performance.items.${itemId}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 SAFETY */}
      <section
        className="relative border-b border-border-gray bg-white py-20 lg:py-32"
        id="safety"
      >
        <span className="absolute top-28 left-4 hidden rotate-180 border-t-4 border-premium-red pt-3 text-xs font-semibold uppercase tracking-[0.42em] text-deep-black [writing-mode:vertical-rl] lg:block">
          {t("sectionRails.safety")}
        </span>
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6"
          >
            <span
              className="font-condensed text-5xl sm:text-8xl lg:text-9xl font-semibold leading-none tracking-tighter shrink-0"
              style={{
                WebkitTextStroke: "2.5px #94A3B8",
                color: "transparent",
              }}
            >
              06
            </span>
            <div>
              <span className="inline-block rounded-full bg-premium-red px-3.5 py-1 text-xs sm:text-xs font-semibold uppercase tracking-widest text-white whitespace-nowrap">
                {t("safety.eyebrow")}
              </span>
              <h2 className="mt-1.5 sm:mt-2 font-condensed text-2xl sm:text-4xl font-semibold uppercase tracking-tight text-deep-black leading-snug">
                {t("safety.title")}
              </h2>
            </div>
          </motion.div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 items-start lg:items-start">
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-4 lg:col-span-6"
            >
              <p className="text-base sm:text-lg font-medium leading-relaxed text-stone-gray text-left text-pretty">
                {t.rich("safety.description", {
                  brand: (chunks) => (
                    <strong className="font-semibold text-premium-red">
                      {chunks}
                    </strong>
                  ),
                  emphasis: (chunks) => (
                    <strong className="font-semibold text-deep-black">
                      {chunks}
                    </strong>
                  ),
                })}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl sm:rounded-full border border-border-gray bg-surface-muted p-3.5 sm:px-5 sm:py-3 shadow-xs">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-premium-red text-white font-semibold text-xs">
                    <Check className="size-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm text-deep-black text-left text-pretty font-medium leading-normal">
                    {t("safety.b1")}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl sm:rounded-full border border-border-gray bg-surface-muted p-3.5 sm:px-5 sm:py-3 shadow-xs">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-premium-red text-white font-semibold text-xs">
                    <Check className="size-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm text-deep-black text-left text-pretty font-medium leading-normal">
                    {t("safety.b2")}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl sm:rounded-full border border-border-gray bg-surface-muted p-3.5 sm:px-5 sm:py-3 shadow-xs">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-premium-red text-white font-semibold text-xs">
                    <Check className="size-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm text-deep-black text-left text-pretty font-medium leading-normal">
                    {t("safety.b3")}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-base sm:text-lg font-medium leading-relaxed text-stone-gray text-left text-pretty">
                {t.rich("safety.footerNote", {
                  brand: (chunks) => (
                    <strong className="font-semibold text-premium-red">
                      {chunks}
                    </strong>
                  ),
                  emphasis: (chunks) => (
                    <strong className="font-semibold text-deep-black">
                      {chunks}
                    </strong>
                  ),
                })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/3] overflow-hidden rounded-[34px] border border-border-gray bg-surface-muted shadow-xl lg:col-span-6"
            >
              <Image
                src="/sanpham/680213145_948050377931398_4658545440541295332_n.jpg"
                alt={t("safety.imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
              <span className="absolute left-4 bottom-4 rounded-full bg-premium-red px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                {t("safety.imageCaption")}
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 07 AUDIENCE SPOTLIGHT */}
      <section
        className="relative border-b border-border-gray bg-white py-20 lg:py-32"
        id="audience"
      >
        <span className="absolute top-28 left-4 hidden rotate-180 border-t-4 border-premium-red pt-3 text-xs font-semibold uppercase tracking-[0.42em] text-deep-black [writing-mode:vertical-rl] lg:block">
          {t("sectionRails.audience")}
        </span>
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6"
          >
            <span
              className="font-condensed text-5xl sm:text-8xl lg:text-9xl font-semibold leading-none tracking-tighter shrink-0"
              style={{
                WebkitTextStroke: "2.5px #94A3B8",
                color: "transparent",
              }}
            >
              07
            </span>
            <div>
              <span className="inline-block rounded-full bg-premium-red px-3.5 py-1 text-xs sm:text-xs font-semibold uppercase tracking-widest text-white whitespace-nowrap">
                {t("customerValue.eyebrow")}
              </span>
              <h2 className="mt-1.5 sm:mt-2 font-condensed text-2xl sm:text-4xl font-semibold uppercase tracking-tight text-deep-black leading-snug">
                {t("customerValue.headline")}
              </h2>
            </div>
          </motion.div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 items-start lg:items-start">
            {/* SPOTLIGHT CONTAINER */}
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] sm:rounded-[34px] border border-border-gray bg-surface-muted shadow-2xl lg:col-span-6 cursor-crosshair"
              onMouseMove={handleSpotlightMouseMove}
            >
              <Image
                src="/khachhang/510962789_708623938540711_2735951356818959986_n.jpg"
                alt={t("customerValue.imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(260px circle at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(219,33,20,0.45), transparent 70%)`,
                }}
              />
              <span className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4 rounded-full bg-premium-red px-3 py-1 text-xs sm:text-xs font-semibold uppercase tracking-wider text-white shadow-md">
                {t("customerValue.imageCaption")}
              </span>
            </motion.div>

            <div className="space-y-4 lg:col-span-6">
              <p className="text-sm sm:text-lg font-semibold leading-relaxed text-stone-gray text-left text-pretty whitespace-nowrap sm:whitespace-normal">
                {t.rich("customerValue.description", {
                  brand: (chunks) => (
                    <strong className="font-semibold text-premium-red">
                      {chunks}
                    </strong>
                  ),
                })}
              </p>

              <ul className="space-y-3 text-sm sm:text-base font-medium text-deep-black">
                <li className="flex items-start gap-3">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-premium-red" />
                  <span className="text-left text-pretty">
                    {t("customerValue.b1")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-premium-red" />
                  <span className="text-left text-pretty">
                    {t("customerValue.b2")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-premium-red" />
                  <span className="text-left text-pretty">
                    {t("customerValue.b3")}
                  </span>
                </li>
              </ul>

              <p className="mt-3 text-base sm:text-lg font-medium leading-relaxed text-stone-gray text-left text-pretty">
                {t.rich("customerValue.footerNote", {
                  brand: (chunks) => (
                    <strong className="font-semibold text-premium-red">
                      {chunks}
                    </strong>
                  ),
                  emphasis: (chunks) => (
                    <strong className="font-semibold text-deep-black">
                      {chunks}
                    </strong>
                  ),
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ∞ VISION & 3D COMPASS */}
      <section
        className="relative border-b border-border-gray bg-white py-12 lg:py-16"
        id="vision"
      >
        <span className="absolute top-16 left-4 hidden rotate-180 border-t-4 border-premium-red pt-3 text-xs font-semibold uppercase tracking-[0.42em] text-deep-black [writing-mode:vertical-rl] lg:block">
          {t("sectionRails.vision")}
        </span>
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
          >
            <span
              className="font-condensed text-5xl sm:text-8xl lg:text-9xl font-semibold leading-none tracking-tighter shrink-0"
              style={{
                WebkitTextStroke: "2.5px #94A3B8",
                color: "transparent",
              }}
            >
              08
            </span>
            <div>
              <span className="inline-block rounded-full bg-premium-red px-3.5 py-1 text-xs sm:text-xs font-semibold uppercase tracking-widest text-white whitespace-nowrap">
                {t("vision.eyebrow")}
              </span>
              <h2 className="mt-1.5 sm:mt-2 font-condensed text-2xl sm:text-5xl font-semibold uppercase tracking-tight text-deep-black leading-snug">
                {t("vision.headline")}
              </h2>
            </div>
          </motion.div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 items-start lg:items-start">
            <div className="space-y-4 lg:col-span-7">
              <p className="text-base sm:text-lg font-medium leading-relaxed text-stone-gray text-left text-pretty">
                {t.rich("vision.p1", {
                  brand: (chunks) => (
                    <strong className="font-semibold text-premium-red">
                      {chunks}
                    </strong>
                  ),
                  emphasis: (chunks) => (
                    <strong className="font-semibold text-deep-black">
                      {chunks}
                    </strong>
                  ),
                })}
              </p>
              <p className="text-base sm:text-lg font-medium leading-relaxed text-stone-gray text-left text-pretty">
                {t("vision.p2")}
              </p>
              <div className="pt-4">
                <Link
                  href={APP_ROUTES.contact}
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-premium-red px-4 sm:px-8 py-3 sm:py-4 text-xs xs:text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-warm-red hover:shadow-lg whitespace-nowrap max-w-full"
                >
                  <span className="whitespace-nowrap">
                    {t("labels.contact")}
                  </span>
                  <ArrowRight className="size-3.5 sm:size-5 shrink-0" />
                </Link>
              </div>
            </div>

            {/* 3D SVG COMPASS WITH ROTATING NEEDLE */}
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square w-full max-w-[360px] justify-self-center lg:col-span-5"
              whileHover="hover"
            >
              <svg viewBox="0 0 200 200" className="h-full w-full">
                <circle
                  cx="100"
                  cy="100"
                  r="92"
                  fill="none"
                  stroke="rgba(4,7,8,0.14)"
                  strokeWidth="2"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="rgba(4,7,8,0.08)"
                  strokeWidth="1"
                />
                <g stroke="rgba(4,7,8,0.28)" strokeWidth="1.5">
                  <line x1="100" y1="14" x2="100" y2="28" />
                  <line x1="100" y1="172" x2="100" y2="186" />
                  <line x1="14" y1="100" x2="28" y2="100" />
                  <line x1="172" y1="100" x2="186" y2="100" />
                </g>
                <motion.g
                  variants={aboutCompassNeedleVariants}
                  initial={{ rotate: shouldReduceMotion ? 0 : 130 }}
                  whileInView={{ rotate: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 1.6,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  style={{ transformOrigin: "100px 100px" }}
                >
                  <polygon
                    points="100,22 108,100 100,112 92,100"
                    fill="var(--color-premium-red)"
                  />
                  <polygon
                    points="100,178 108,100 100,88 92,100"
                    fill="rgba(4,7,8,0.4)"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="6"
                    fill="var(--color-premium-red)"
                  />
                </motion.g>
              </svg>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
