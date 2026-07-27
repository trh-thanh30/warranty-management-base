"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useScrollReveal } from "@/src/hooks/use-scroll-reveal";
import { revealViewportOnce } from "@/src/constants/motion.constants";
import { galleryCategories, galleryImages } from "../home.constants";

type GalleryImage = (typeof galleryImages)[number];

const isUploadedGalleryImage = (
  item: GalleryImage,
): item is GalleryImage & {
  kind: "products" | "customers";
  index: number;
} => "kind" in item;

export function GallerySection() {
  const t = useTranslations("HomePage.gallery");
  const { fadeUp } = useScrollReveal();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const filteredGallery =
    activeFilter === "ALL"
      ? galleryImages
      : galleryImages.filter((item) => item.category === activeFilter);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 4000, stopOnInteraction: false })],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    setSelectedIndex(0);
    const timer = setTimeout(() => {
      emblaApi.reInit();
      emblaApi.scrollTo(0);
      setScrollSnaps(emblaApi.scrollSnapList());
    }, 50);
    return () => clearTimeout(timer);
  }, [activeFilter, emblaApi]);

  const getImageLabel = (item: GalleryImage) => {
    if (isUploadedGalleryImage(item)) {
      return t(`uploaded.${item.kind}.caption`, { index: item.index });
    }

    return t(`items.${item.id}`);
  };

  const getImageAlt = (item: GalleryImage) => {
    if (isUploadedGalleryImage(item)) {
      return t(`uploaded.${item.kind}.imageAlt`, { index: item.index });
    }

    return t(`items.${item.id}`);
  };

  return (
    <section className="w-full bg-gray-50 py-16 lg:py-24">
      <div className="mx-auto max-w-[1720px] space-y-12 px-6 text-center sm:px-10 lg:px-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealViewportOnce}
        >
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.25em] text-premium-red sm:text-sm">
            {t("eyebrow")}
          </span>
          <h2 className="text-3xl font-medium uppercase tracking-wider text-deep-black sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <div className="mx-auto mt-3 h-[3px] w-20 bg-premium-red" />
        </motion.div>

        {/* Filter Categories */}
        <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
          {galleryCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveFilter(category)}
              className={`shrink-0 cursor-pointer rounded-full px-4 sm:px-5 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-300 ${
                activeFilter === category
                  ? "bg-premium-red text-white shadow-md"
                  : "bg-white text-stone-gray hover:bg-light-gray hover:text-deep-black border border-border-gray"
              }`}
            >
              {t(`categories.${category}`)}
            </button>
          ))}
        </div>

        {/* Embla Carousel Viewport */}
        <div
          className="overflow-hidden cursor-grab active:cursor-grabbing"
          ref={emblaRef}
        >
          <div className="-ml-6 flex text-left">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                className="min-w-0 flex-[0_0_100%] pl-6 sm:flex-[0_0_50%] lg:flex-[0_0_33.333333%]"
              >
                <figure className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-border-gray bg-deep-black shadow-md">
                  <Image
                    src={item.src}
                    alt={getImageAlt(item)}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-deep-black/80 via-deep-black/20 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-xs font-medium uppercase tracking-wider text-premium-red">
                      {t(`categories.${item.category}`)}
                    </span>
                    <figcaption className="mt-0.5 text-base font-medium uppercase text-white">
                      {getImageLabel(item)}
                    </figcaption>
                  </div>
                </figure>
              </div>
            ))}
          </div>
        </div>

        {/* Embla Navigation Controls (Prev on Left, Fraction Counter in Center, Next on Right) */}
        {scrollSnaps.length > 1 ? (
          <div className="mt-8 flex items-center justify-between max-w-sm sm:max-w-md mx-auto px-4">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label={t("previousSlide")}
              className="flex size-11 sm:size-12 cursor-pointer items-center justify-center rounded-full border border-border-gray bg-white text-deep-black shadow-md transition-all hover:border-premium-red hover:text-premium-red active:scale-95"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>

            <span className="text-sm font-semibold uppercase tracking-wider text-deep-black select-none">
              <span className="text-deep-black">{selectedIndex + 1}</span>{" "}
              <span className="text-stone-gray font-normal px-1">/</span>{" "}
              <span className="text-stone-gray">{scrollSnaps.length}</span>
            </span>

            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label={t("nextSlide")}
              className="flex size-11 sm:size-12 cursor-pointer items-center justify-center rounded-full border border-border-gray bg-white text-deep-black shadow-md transition-all hover:border-premium-red hover:text-premium-red active:scale-95"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
