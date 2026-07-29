"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import type { PaginatedResponse, PublicProductCategory } from "@repo/shared";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { richTextToPlainText } from "../home.utils";

const mainCategories = [
  {
    key: "film",
    image: "/product/product_1.jpg",
    badgeKey: "korea",
  },
  {
    key: "lighting",
    image: "/product/product_3.jpg",
    badgeKey: "japaneseTech",
  },
  {
    key: "dashcam",
    image: "/product/product_9.jpg",
    badgeKey: "recording4k",
  },
  {
    key: "tpms",
    image: "/product/product_10.jpg",
    badgeKey: "safety",
  },
] as const;

import { Container } from "@/src/components/common/container";
import { FadeIn } from "@/src/components/animation/fade-in";

export function ProductsSection({
  initialPage,
}: {
  initialPage: PaginatedResponse<PublicProductCategory> | null;
}) {
  const t = useTranslations("HomePage.products");
  const [, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
    slidesToScroll: 1,
  });

  const publicCategories = (initialPage?.items ?? [])
    .filter(
      (category): category is PublicProductCategory & { imageUrl: string } =>
        Boolean(category.imageUrl),
    )
    .map((category) => ({
      id: category.id,
      image: category.imageUrl,
      title: category.name,
      description: richTextToPlainText(category.description),
      badge: t("itemCount", { count: category.productCount }),
    }));
  const displayCategories =
    publicCategories.length > 0
      ? publicCategories
      : mainCategories.map((category) => ({
          id: category.key,
          image: category.image,
          title: t(`categories.${category.key}.title`),
          description: t(`categories.${category.key}.description`),
          badge: t(`badges.${category.badgeKey}`),
        }));
  const syncCarouselState = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    syncCarouselState();
    emblaApi.on("select", syncCarouselState);
    emblaApi.on("reInit", syncCarouselState);

    return () => {
      emblaApi.off("select", syncCarouselState);
      emblaApi.off("reInit", syncCarouselState);
    };
  }, [emblaApi, syncCarouselState]);

  const canScrollPrevious = Boolean(emblaApi?.canScrollPrev());
  const canScrollNext = Boolean(emblaApi?.canScrollNext());

  const handlePrevious = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const handleNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <section id="products" className="w-full bg-surface-muted py-12 lg:py-16">
      <Container>
        {/* Section Header with FadeIn */}
        <FadeIn direction="up" className="text-center pb-8 lg:pb-12">
          <span className="block text-xs sm:text-sm font-semibold uppercase text-premium-red mb-2">
            {t("eyebrow")}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold uppercase tracking-wide text-deep-black leading-snug text-center">
            {t("title")}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-gray max-w-2xl mx-auto">
            {t("description")}
          </p>
        </FadeIn>

        <div className="group/carousel relative">
          <div className="absolute -left-14 inset-y-0 z-10 hidden w-[4.5rem] lg:block">
            <button
              type="button"
              aria-label={t("previousCategories")}
              className="pointer-events-none absolute left-0 top-1/2 flex size-11 -translate-y-1/2 scale-90 items-center justify-center rounded-full border border-border-gray bg-white text-deep-black opacity-0 shadow-md transition-all duration-500 ease-out hover:border-premium-red hover:text-premium-red focus-visible:pointer-events-auto focus-visible:scale-100 focus-visible:opacity-100 disabled:cursor-not-allowed motion-reduce:transition-none group-hover/carousel:pointer-events-auto group-hover/carousel:scale-100 group-hover/carousel:opacity-100 group-focus-within/carousel:pointer-events-auto group-focus-within/carousel:scale-100 group-focus-within/carousel:opacity-100"
              disabled={!canScrollPrevious}
              onClick={handlePrevious}
            >
              <ChevronLeft className="size-5" />
            </button>
          </div>

          <div ref={emblaRef} className="overflow-hidden">
            <div className="-ml-4 flex">
              {displayCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="min-w-0 flex-[0_0_68%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_25%]"
                >
                  <motion.article
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(index, 3) * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group flex h-full flex-col justify-between overflow-hidden rounded-md border border-border-gray bg-white shadow-sm transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-premium-red/50 hover:shadow-xl"
                  >
                    <Link
                      href={APP_ROUTES.products}
                      className="relative block aspect-[16/9] w-full overflow-hidden bg-black/5"
                    >
                      <Image
                        src={category.image}
                        alt={category.title}
                        fill
                        sizes="(max-width: 640px) calc(100vw - 7rem), (max-width: 1024px) 45vw, 23vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-2.5 top-2.5 rounded bg-deep-black/80 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-xs transition-colors duration-300 group-hover:bg-premium-red">
                        {category.badge}
                      </span>
                    </Link>

                    <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                      <div>
                        <h3 className="min-h-[2.75rem] text-sm font-semibold uppercase leading-snug tracking-tight text-deep-black transition-colors group-hover:text-premium-red sm:min-h-[3rem] sm:text-base">
                          <Link href={APP_ROUTES.products}>
                            {category.title}
                          </Link>
                        </h3>
                        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-stone-gray">
                          {category.description}
                        </p>
                      </div>

                      <div className="mt-5 border-t border-border-gray pt-3.5">
                        <Link
                          href={APP_ROUTES.products}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-deep-black transition-colors group-hover:text-premium-red"
                        >
                          <span>{t("explore")}</span>
                          <ArrowRight className="size-3.5 text-premium-red transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -right-14 inset-y-0 z-10 hidden w-[4.5rem] lg:block">
            <button
              type="button"
              aria-label={t("nextCategories")}
              className="pointer-events-none absolute right-0 top-1/2 flex size-11 -translate-y-1/2 scale-90 items-center justify-center rounded-full border border-border-gray bg-white text-deep-black opacity-0 shadow-md transition-all duration-500 ease-out hover:border-premium-red hover:text-premium-red focus-visible:pointer-events-auto focus-visible:scale-100 focus-visible:opacity-100 disabled:cursor-not-allowed motion-reduce:transition-none group-hover/carousel:pointer-events-auto group-hover/carousel:scale-100 group-hover/carousel:opacity-100 group-focus-within/carousel:pointer-events-auto group-focus-within/carousel:scale-100 group-focus-within/carousel:opacity-100"
              disabled={!canScrollNext}
              onClick={handleNext}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* View All Categories Button */}
        <div className="text-center pt-8">
          <Link
            href={APP_ROUTES.products}
            className="inline-flex items-center gap-2 bg-premium-red sm:bg-deep-black sm:hover:bg-premium-red active:scale-95 text-white px-7 py-3 rounded-md text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
          >
            <span>{t("viewAll")}</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
