"use client";

import { FadeIn } from "@/src/components/animation/fade-in";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, CheckCircle2, Cpu, XCircle, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const comparisonMetricKeys = ["tser", "durability", "signal", "glare"] as const;

export function AboutCoreTech() {
  const t = useTranslations("AboutPage");
  const [activeTab, setActiveTab] = useState<
    "sputtering" | "nanoCeramic" | "comparison"
  >("sputtering");

  return (
    <div className="w-full">
      {/* 2-COLUMN SIDE-BY-SIDE SPLIT LAYOUT */}
      <div className="grid gap-12 lg:gap-20 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Headlines & Tab Switcher Buttons (4 Columns with FadeIn animation) */}
        <FadeIn direction="right" className="lg:col-span-4 space-y-6">
          <div className="space-y-3">
            {/* Clean Eyebrow with Red Line */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-0.5 bg-premium-red shrink-0" />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-premium-red">
                {t("coreTech.eyebrow")}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-deep-black leading-tight">
              {t("coreTech.title")}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-stone-gray leading-relaxed text-pretty">
            {t("coreTech.subtitle")}
          </p>

          {/* Tab Switcher Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => setActiveTab("sputtering")}
              className={`flex items-center gap-3 rounded-md px-5 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer text-left ${
                activeTab === "sputtering"
                  ? "bg-premium-red text-white shadow-lg shadow-premium-red/20 border border-premium-red"
                  : "bg-white border border-border-gray/80 text-stone-gray hover:text-deep-black hover:border-premium-red/40 hover:bg-surface-muted/60"
              }`}
            >
              <Zap className="size-4 shrink-0" />
              <span>{t("coreTech.sputtering.title")}</span>
            </button>

            <button
              onClick={() => setActiveTab("nanoCeramic")}
              className={`flex items-center gap-3 rounded-md px-5 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer text-left ${
                activeTab === "nanoCeramic"
                  ? "bg-premium-red text-white shadow-lg shadow-premium-red/20 border border-premium-red"
                  : "bg-white border border-border-gray/80 text-stone-gray hover:text-deep-black hover:border-premium-red/40 hover:bg-surface-muted/60"
              }`}
            >
              <Cpu className="size-4 shrink-0" />
              <span>{t("coreTech.nanoCeramic.title")}</span>
            </button>

            <button
              onClick={() => setActiveTab("comparison")}
              className={`flex items-center gap-3 rounded-md px-5 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all cursor-pointer text-left ${
                activeTab === "comparison"
                  ? "bg-premium-red text-white shadow-lg shadow-premium-red/20 border border-premium-red"
                  : "bg-white border border-border-gray/80 text-stone-gray hover:text-deep-black hover:border-premium-red/40 hover:bg-surface-muted/60"
              }`}
            >
              <BarChart3 className="size-4 shrink-0" />
              <span>{t("coreTech.comparisonTitle")}</span>
            </button>
          </div>
        </FadeIn>

        {/* RIGHT COLUMN: Active Tab Content / Clean Minimal Comparison Table (8 Columns) */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeTab === "sputtering" && (
              <motion.div
                key="sputtering"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-premium-red shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-premium-red">
                      {t("coreTech.sputtering.eyebrow")}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-wide text-deep-black">
                    {t("coreTech.sputtering.displayTitle")}
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-stone-gray leading-relaxed text-pretty">
                  {t("coreTech.sputtering.description")}
                </p>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3">
                    <span className="w-4 h-[2px] bg-premium-red mt-2.5 shrink-0" />
                    <p className="text-sm sm:text-base font-semibold text-deep-black">
                      {t("coreTech.sputtering.b1")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-4 h-[2px] bg-premium-red mt-2.5 shrink-0" />
                    <p className="text-sm sm:text-base font-semibold text-deep-black">
                      {t("coreTech.sputtering.b2")}
                    </p>
                  </div>
                </div>

                {/* 2 Key Stat Cards */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-gray/60">
                  <div className="rounded-md bg-surface-muted p-5 border border-border-gray/60 space-y-1">
                    <span className="text-2xl sm:text-3xl font-bold text-premium-red block leading-none">
                      70% TSER
                    </span>
                    <span className="text-xs font-semibold uppercase text-stone-gray block">
                      {t("coreTech.sputtering.heatReflectionLabel")}
                    </span>
                  </div>

                  <div className="rounded-md bg-surface-muted p-5 border border-border-gray/60 space-y-1">
                    <span className="text-2xl sm:text-3xl font-bold text-deep-black block leading-none">
                      {t("coreTech.sputtering.durabilityValue")}
                    </span>
                    <span className="text-xs font-semibold uppercase text-stone-gray block">
                      {t("coreTech.sputtering.durabilityLabel")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "nanoCeramic" && (
              <motion.div
                key="nanoCeramic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-premium-red shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-premium-red">
                      {t("coreTech.nanoCeramic.eyebrow")}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-wide text-deep-black">
                    {t("coreTech.nanoCeramic.displayTitle")}
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-stone-gray leading-relaxed text-pretty">
                  {t("coreTech.nanoCeramic.description")}
                </p>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3">
                    <span className="w-4 h-[2px] bg-premium-red mt-2.5 shrink-0" />
                    <p className="text-sm sm:text-base font-semibold text-deep-black">
                      {t("coreTech.nanoCeramic.b1")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-4 h-[2px] bg-premium-red mt-2.5 shrink-0" />
                    <p className="text-sm sm:text-base font-semibold text-deep-black">
                      {t("coreTech.nanoCeramic.b2")}
                    </p>
                  </div>
                </div>

                {/* 2 Key Stat Cards */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-gray/60">
                  <div className="rounded-md bg-surface-muted p-5 border border-border-gray/60 space-y-1">
                    <span className="text-2xl sm:text-3xl font-bold text-premium-red block leading-none">
                      100% PASS
                    </span>
                    <span className="text-xs font-semibold uppercase text-stone-gray block">
                      {t("coreTech.nanoCeramic.signalLabel")}
                    </span>
                  </div>

                  <div className="rounded-md bg-surface-muted p-5 border border-border-gray/60 space-y-1">
                    <span className="text-2xl sm:text-3xl font-bold text-deep-black block leading-none">
                      &lt; 8% GLARE
                    </span>
                    <span className="text-xs font-semibold uppercase text-stone-gray block">
                      {t("coreTech.nanoCeramic.glareLabel")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "comparison" && (
              <motion.div
                key="comparison"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="space-y-2 border-b border-border-gray pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-premium-red shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-premium-red">
                      {t("coreTech.comparisonEyebrow")}
                    </span>
                  </div>

                  <h4 className="text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-wide text-deep-black">
                    {t("coreTech.comparisonTitle")}
                  </h4>
                </div>

                {/* Clean Minimal Unboxed Table Rows */}
                <div className="divide-y divide-border-gray/60">
                  {/* Table Header Row */}
                  <div className="grid grid-cols-12 gap-3 py-2 text-xs font-semibold uppercase tracking-wider text-stone-gray">
                    <div className="col-span-5">
                      {t("coreTech.metricHeader")}
                    </div>
                    <div className="col-span-4 text-premium-red font-semibold">
                      {t("coreTech.fujitekLabel")}
                    </div>
                    <div className="col-span-3 text-silver-fog">
                      {t("coreTech.standardLabel")}
                    </div>
                  </div>

                  {comparisonMetricKeys.map((metricKey) => (
                    <div
                      key={metricKey}
                      className="grid grid-cols-12 gap-3 py-4 items-center hover:bg-surface-muted/60 transition-colors rounded-sm px-1"
                    >
                      {/* Metric Name */}
                      <div className="col-span-5 text-xs sm:text-sm font-semibold text-deep-black uppercase tracking-wide">
                        {t(`coreTech.metrics.${metricKey}.name`)}
                      </div>

                      {/* Fujitek Performance */}
                      <div className="col-span-4 flex items-center gap-2">
                        <CheckCircle2 className="size-4 shrink-0 text-premium-red" />
                        <span className="text-xs sm:text-sm font-semibold text-premium-red">
                          {t(`coreTech.metrics.${metricKey}.fujitek`)}
                        </span>
                      </div>

                      {/* Standard Film Performance */}
                      <div className="col-span-3 flex items-center gap-2 text-stone-gray">
                        <XCircle className="size-4 shrink-0 text-pale-silver" />
                        <span className="text-xs sm:text-sm font-medium text-stone-gray">
                          {t(`coreTech.standardLabel`)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
