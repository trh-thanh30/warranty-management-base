"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { aboutPerformanceItems } from "../about.constants";

export function AboutPerformanceBento() {
  const t = useTranslations("AboutPage");

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative aspect-[4/3] sm:col-span-2 sm:row-span-2 overflow-hidden rounded-[24px] sm:rounded-[34px] border border-border-gray bg-surface-muted shadow-lg"
      >
        <Image
          src="/product/product_3.jpg"
          alt={t("performance.imageAlt")}
          fill
          sizes="(max-width: 1024px) 100vw, 700px"
          className="object-cover"
        />
        <span className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4 rounded-full bg-premium-red px-3 py-1 text-xs sm:text-xs font-semibold uppercase tracking-wider text-white shadow-md font-sans">
          {t("performance.imageCaption")}
        </span>
      </motion.div>
      {(aboutPerformanceItems as readonly string[]).map((itemId: string) => (
        <motion.div
          key={itemId}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-border-gray bg-surface-muted p-5 sm:p-6 transition-all hover:border-premium-red hover:shadow-lg"
        >
          <div className="flex items-center gap-2.5">
            <Check className="size-5 shrink-0 text-premium-red" />
            <h3 className="text-sm sm:text-base font-semibold uppercase tracking-wider text-deep-black font-sans">
              {t(`performance.items.${itemId}.title`)}
            </h3>
          </div>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-gray font-sans text-left text-pretty">
            {t(`performance.items.${itemId}.description`)}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
