"use client";

import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Container } from "@/src/components/common/container";
import { FadeIn } from "@/src/components/animation/fade-in";
import {
  StaggerGroup,
  StaggerItem,
} from "@/src/components/animation/stagger-group";

export function ComparisonSection() {
  const t = useTranslations("HomePage.comparison");

  return (
    <section className="w-full py-16 lg:py-24 bg-gray-50">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Left Summary with FadeIn */}
          <FadeIn direction="right" className="lg:col-span-5 space-y-4">
            <span className="block text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-premium-red">
              {t("eyebrow")}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold uppercase text-deep-black">
              FUJITEK FILMS
            </h2>
            <p className="text-base sm:text-lg text-stone-gray leading-relaxed">
              {t("description")}
            </p>
            <div className="pt-2">
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-premium-red hover:bg-warm-red text-white px-7 py-3.5 rounded-md text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors duration-300 shadow-md cursor-pointer"
              >
                <span>{t("bookNow")}</span>
                <ChevronRight className="size-4" />
              </a>
            </div>
          </FadeIn>

          {/* Right Comparison Columns with Staggered Entrance */}
          <StaggerGroup className="lg:col-span-7 grid gap-6 sm:grid-cols-2">
            {/* Common Film (❌) */}
            <StaggerItem className="p-7 sm:p-8 rounded-md bg-premium-red/5 border border-premium-red/20 space-y-4">
              <div className="flex items-center gap-3">
                <XCircle className="size-8 text-premium-red shrink-0" />
                <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black">
                  {t("standard.title")}
                </h3>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-stone-gray font-semibold">
                <li className="flex items-start gap-2">
                  <span className="text-premium-red font-medium">•</span>
                  <span>{t("standard.items.heat")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-premium-red font-medium">•</span>
                  <span>{t("standard.items.glare")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-premium-red font-medium">•</span>
                  <span>{t("standard.items.signal")}</span>
                </li>
              </ul>
            </StaggerItem>

            {/* FUJITEK Film (✅) */}
            <StaggerItem className="p-7 sm:p-8 rounded-md bg-gray-100/60 border-2 border-premium-red space-y-4 shadow-lg relative">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-8 text-premium-red shrink-0" />
                <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black">
                  FUJITEK Films
                </h3>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-deep-black font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-premium-red font-medium">•</span>
                  <span>{t("fujitek.items.protection")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-premium-red font-medium">•</span>
                  <span>{t("fujitek.items.signal")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-premium-red font-medium">•</span>
                  <span>{t("fujitek.items.warranty")}</span>
                </li>
              </ul>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </Container>
    </section>
  );
}
