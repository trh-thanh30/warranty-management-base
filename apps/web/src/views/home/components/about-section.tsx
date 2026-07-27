"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PhoneCall } from "lucide-react";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { useScrollReveal } from "@/src/hooks/use-scroll-reveal";
import { revealViewportOnce } from "@/src/constants/motion.constants";
import { Link } from "@/src/i18n/navigation";
import { BrandsSection } from "./brands-section";

import { Container } from "@/src/components/common/container";

export function AboutSection() {
  const t = useTranslations("HomePage.about");
  const { container, fadeUp } = useScrollReveal();

  return (
    <section
      id="about-us"
      className="w-full bg-white py-8 lg:py-10 relative overflow-hidden flex flex-col justify-between items-center"
    >
      {/* Decorative Background Blob */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-premium-red/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-premium-red/5 rounded-full blur-3xl pointer-events-none" />

      <Container>
        {/* Centered Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealViewportOnce}
          className="text-center pb-4 lg:pb-6"
        >
          <span className="block text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-premium-red mb-1.5">
            {t("eyebrow")}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold uppercase tracking-wide text-deep-black leading-snug text-center">
            {t("title")}
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={revealViewportOnce}
          className="grid gap-8 lg:gap-12 lg:grid-cols-12 lg:items-start pt-1"
        >
          {/* Left Column: Premium Image Collage (7 cols for larger display) */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-7 relative flex justify-center items-center"
          >
            {/* Main Large Image */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/10] rounded-md overflow-hidden border border-border-gray">
              <Image
                src="/hero/hero_3.jpg"
                alt={t("mainImageAlt")}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 950px"
                className="object-cover transition-transform duration-[600ms] hover:scale-105"
              />
            </div>
          </motion.div>

          {/* Right Column: Content Block (5 cols) */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-5 flex flex-col justify-start pt-1 sm:pt-2"
          >
            {/* Description */}
            <p className="text-base sm:text-lg text-stone-gray leading-relaxed">
              {t("descriptionPrimary")}
            </p>
            <p className="mt-4 text-base sm:text-lg text-stone-gray leading-relaxed">
              {t("descriptionSecondary")}
            </p>

            {/* CTA Buttons & Phone Row */}
            <div className="mt-6 sm:mt-8 flex items-center gap-3.5 sm:gap-6">
              <Link
                href={APP_ROUTES.about}
                className="group/btn relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-premium-red hover:bg-warm-red px-5 py-3 sm:px-8 sm:py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-md shadow-premium-red/20 transition-all duration-300 cursor-pointer"
              >
                <span className="relative z-10 text-white">
                  {t("learnMore")}
                </span>
              </Link>

              {/* Call Us Link */}
              <a
                href="tel:1800123456"
                className="flex shrink-0 items-center gap-2 sm:gap-3 text-deep-black hover:text-premium-red transition-colors duration-300 group/phone"
              >
                <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-light-gray border border-border-gray text-premium-red">
                  <PhoneCall className="relative h-4 w-4 sm:h-5 sm:w-5 z-10" />
                </div>
                <div>
                  <span className="block text-xs sm:text-xs font-semibold text-soft-gray uppercase tracking-wider leading-none">
                    {t("hotlineLabel")}
                  </span>
                  <span className="block text-sm sm:text-lg font-semibold text-deep-black group-hover/phone:text-premium-red transition-colors mt-1 leading-none whitespace-nowrap">
                    1800 123 456
                  </span>
                </div>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </Container>

      {/* Brand Logo Marquee Slider (Full-width edge-to-edge) */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={revealViewportOnce}
        className="mt-16 w-full"
      >
        <BrandsSection />
      </motion.div>
    </section>
  );
}
