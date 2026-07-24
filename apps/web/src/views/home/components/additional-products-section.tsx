"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { useScrollReveal } from "@/src/hooks/use-scroll-reveal";
import { revealViewportOnce } from "@/src/constants/motion.constants";
import {
  IconAndroidBox,
  IconBiLedPha,
  IconBongLed,
  IconCamBienApSuat,
  IconCameraHanhTrinh,
  IconDenTroSang,
  IconPhuKienDoDen,
} from "../../products/components/category-icons";
import { additionalProductCategories } from "../home.constants";

const categoryIcons = {
  ledBulbs: IconBongLed,
  biLed: IconBiLedPha,
  auxLights: IconDenTroSang,
  dashcam: IconCameraHanhTrinh,
  tpms: IconCamBienApSuat,
  androidBox: IconAndroidBox,
  retroAccessories: IconPhuKienDoDen,
} as const;

export function AdditionalProductsSection() {
  const t = useTranslations("HomePage.additionalProducts");
  const { fadeUp } = useScrollReveal();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 4000, stopOnInteraction: false })],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="w-full border-b border-border-gray bg-surface-muted py-16 lg:py-24">
      <div className="mx-auto max-w-[1640px] space-y-10 px-6 sm:px-10 lg:px-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealViewportOnce}
          className="space-y-3 text-center"
        >
          <span className="block text-xs xs:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.25em] text-premium-red sm:text-sm whitespace-nowrap">
            {t("eyebrow")}
          </span>
          <h2 className="font-condensed text-2xl font-semibold uppercase tracking-wide text-deep-black sm:text-4xl lg:text-5xl leading-snug">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-stone-gray sm:text-lg text-justify text-pretty">
            {t("description")}
          </p>
          <div className="mx-auto mt-4 h-[3px] w-20 bg-premium-red" />
        </motion.div>

        {/* EMBLA HORIZONTAL SLIDER */}
        <div className="relative">
          <div
            className="overflow-hidden cursor-grab active:cursor-grabbing rounded-[32px]"
            ref={emblaRef}
          >
            <div className="-ml-6 flex">
              {additionalProductCategories.map((category) => {
                const IconComponent = categoryIcons[category.id];

                return (
                  <div
                    key={category.id}
                    className="min-w-0 flex-[0_0_100%] pl-6 sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
                  >
                    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-border-gray bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-premium-red hover:shadow-xl">
                      <div>
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-deep-black">
                          <Image
                            src={category.image}
                            alt={t(`categories.${category.id}.title`)}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 via-deep-black/20 to-transparent" />
                          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-white/15 bg-deep-black/80 px-3.5 py-2 text-white shadow-md backdrop-blur-xs">
                            <IconComponent className="size-4 text-premium-red" />
                            <span className="text-xs font-semibold uppercase tracking-wider">
                              {t("itemCount", { count: category.itemCount })}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3 p-6">
                          <h3 className="font-condensed text-xl font-semibold uppercase tracking-wide text-deep-black transition-colors group-hover:text-premium-red">
                            {t(`categories.${category.id}.title`)}
                          </h3>
                          <p className="line-clamp-2 text-xs font-medium leading-relaxed text-stone-gray">
                            {t(`categories.${category.id}.description`)}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 pt-0">
                        <Link
                          href={APP_ROUTES.products}
                          className="flex w-full items-center justify-between rounded-xl border border-border-gray bg-surface-muted px-4 py-3 text-xs font-semibold uppercase tracking-wider text-deep-black transition-all group-hover:border-premium-red group-hover:bg-premium-red group-hover:text-white"
                        >
                          <span>{t("exploreCategory")}</span>
                          <ChevronRight className="size-4" />
                        </Link>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SLIDER NAVIGATION CONTROLS */}
          <div className="mt-8 flex items-center justify-between max-w-sm sm:max-w-md mx-auto px-4">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous slide"
              className="flex size-11 sm:size-12 cursor-pointer items-center justify-center rounded-full border border-border-gray bg-white text-deep-black shadow-md transition-all hover:border-premium-red hover:text-premium-red active:scale-95"
            >
              <ChevronLeft className="size-5" />
            </button>

            <span className="text-sm font-semibold uppercase tracking-wider text-deep-black select-none">
              <span className="text-deep-black">{selectedIndex + 1}</span>{" "}
              <span className="text-stone-gray font-normal px-1">/</span>{" "}
              <span className="text-stone-gray">{scrollSnaps.length}</span>
            </span>

            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next slide"
              className="flex size-11 sm:size-12 cursor-pointer items-center justify-center rounded-full border border-border-gray bg-white text-deep-black shadow-md transition-all hover:border-premium-red hover:text-premium-red active:scale-95"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link
            href={APP_ROUTES.products}
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-[14px] bg-premium-red sm:bg-deep-black sm:hover:bg-premium-red active:scale-95 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white shadow-xl transition-all duration-300 hover:shadow-2xl sm:text-sm"
          >
            <span>{t("viewAllCta")}</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
