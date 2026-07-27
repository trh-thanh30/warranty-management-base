"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";

import { Container } from "@/src/components/common/container";
import { FadeIn } from "@/src/components/animation/fade-in";
import { Counter } from "@/src/components/animation/counter";
import {
  StaggerGroup,
  StaggerItem,
} from "@/src/components/animation/stagger-group";

export function SputterSection() {
  const t = useTranslations("HomePage.sputter");

  return (
    <section className="w-full py-16 lg:py-24 bg-white">
      <Container className="space-y-16">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Left Description with FadeIn */}
          <FadeIn direction="right" className="lg:col-span-6 space-y-5">
            <span className="block text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-premium-red">
              {t("eyebrow")}
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold uppercase tracking-wide text-deep-black leading-tight">
              {t("title")}
            </h2>
            <p className="text-base sm:text-lg text-stone-gray leading-relaxed">
              {t.rich("descriptionPrimary", {
                brand: (chunks) => (
                  <strong className="text-premium-red">{chunks}</strong>
                ),
              })}
            </p>
            <p className="text-base sm:text-lg text-stone-gray leading-relaxed">
              {t("descriptionSecondary")}
            </p>

            <div className="pt-2">
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-premium-red sm:bg-deep-black sm:hover:bg-premium-red active:scale-95 text-white px-7 py-3.5 rounded-md text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-md"
              >
                <span>{t("learnMore")}</span>
                <ChevronRight className="size-4" />
              </a>
            </div>
          </FadeIn>

          {/* Right Chamber Diagram with FadeIn */}
          <FadeIn
            direction="left"
            className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-md overflow-hidden border border-border-gray bg-deep-black flex items-center justify-center"
          >
            <Image
              src="/hero/hero_2.jpg"
              alt={t("chamberImageAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 650px"
              className="object-cover"
            />
          </FadeIn>
        </div>

        {/* Structure Diagram & Stats Block */}
        <div className="space-y-10 pt-6 border-t border-border-gray/60">
          {/* Full Viewport Width Banner Image */}
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] aspect-[21/9] sm:aspect-[24/9] lg:aspect-[32/10] overflow-hidden bg-white shadow-sm">
            <Image
              src="/hero/hero.jpg"
              alt={t("structureImageAlt")}
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* 3 Stat Counter Cards with Animated Count-up Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 sm:p-8 rounded-md bg-white border border-border-gray shadow-sm hover:shadow-md transition-shadow">
              <span className="block text-4xl sm:text-6xl font-semibold text-premium-red">
                <Counter value={10} suffix=" NĂM" />
              </span>
              <span className="block text-xs sm:text-sm font-semibold text-deep-black uppercase tracking-wider mt-2.5">
                {t("stats.warrantyLabel")}
              </span>
            </div>

            <div className="p-6 sm:p-8 rounded-md bg-white border border-border-gray shadow-sm hover:shadow-md transition-shadow">
              <span className="block text-4xl sm:text-6xl font-semibold text-premium-red">
                <Counter value={99} suffix="%" />
              </span>
              <span className="block text-xs sm:text-sm font-semibold text-deep-black uppercase tracking-wider mt-2.5">
                {t("stats.uvLabel")}
              </span>
            </div>

            <div className="p-6 sm:p-8 rounded-md bg-white border border-border-gray shadow-sm hover:shadow-md transition-shadow">
              <span className="block text-4xl sm:text-6xl font-semibold text-premium-red">
                <Counter value={98} suffix="%" />
              </span>
              <span className="block text-xs sm:text-sm font-semibold text-deep-black uppercase tracking-wider mt-2.5">
                {t("stats.irLabel")}
              </span>
            </div>
          </div>

          {/* 3 Detail Columns with Staggered Entrance Animation */}
          <StaggerGroup className="grid gap-8 md:grid-cols-3 pt-6 border-t border-border-gray">
            <StaggerItem className="space-y-2">
              <h4 className="text-base sm:text-lg font-semibold uppercase text-deep-black">
                {t("details.warranty.title")}
              </h4>
              <p className="text-sm text-stone-gray leading-relaxed">
                {t("details.warranty.description")}
              </p>
            </StaggerItem>
            <StaggerItem className="space-y-2">
              <h4 className="text-base sm:text-lg font-semibold uppercase text-deep-black">
                {t("details.uv.title")}
              </h4>
              <p className="text-sm text-stone-gray leading-relaxed">
                {t("details.uv.description")}
              </p>
            </StaggerItem>
            <StaggerItem className="space-y-2">
              <h4 className="text-base sm:text-lg font-semibold uppercase text-deep-black">
                {t("details.ir.title")}
              </h4>
              <p className="text-sm text-stone-gray leading-relaxed">
                {t("details.ir.description")}
              </p>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </Container>
    </section>
  );
}
