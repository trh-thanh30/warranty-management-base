"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  desktopHeroImages,
  type HeroImageItem,
  mobileHeroImages,
} from "../home.constants";
import { motionDuration } from "@/src/constants/motion.constants";

export function HeroSection({
  desktopImages = desktopHeroImages,
  mobileImages = mobileHeroImages,
}: {
  desktopImages?: HeroImageItem[];
  mobileImages?: HeroImageItem[];
}) {
  return (
    <section
      className="relative flex aspect-[4/5] h-auto flex-col overflow-hidden sm:aspect-auto sm:h-[calc(100dvh-84px)]"
      id="home"
    >
      <HeroCarousel
        className="hidden sm:block"
        fallbackImages={desktopHeroImages}
        images={desktopImages}
      />
      <HeroCarousel
        className="block sm:hidden"
        fallbackImages={mobileHeroImages}
        images={mobileImages}
      />
    </section>
  );
}

function HeroCarousel({
  className,
  fallbackImages,
  images,
}: {
  className: string;
  fallbackImages: HeroImageItem[];
  images: HeroImageItem[];
}) {
  const t = useTranslations("HomePage.hero");
  const shouldReduce = useReducedMotion();
  const availableImages = images.length > 0 ? images : fallbackImages;
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeImage = availableImages[currentIndex] ?? availableImages[0];

  useEffect(() => {
    setCurrentIndex((index) => index % availableImages.length);
  }, [availableImages.length]);

  useEffect(() => {
    if (availableImages.length < 2) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % availableImages.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [availableImages.length]);

  if (!activeImage) return null;

  const previous = () =>
    setCurrentIndex(
      (index) => (index - 1 + availableImages.length) % availableImages.length,
    );
  const next = () =>
    setCurrentIndex((index) => (index + 1) % availableImages.length);
  const knownSlide = ["primary", "technology", "protection"].includes(
    activeImage.id,
  );
  const alt = knownSlide ? t(`slides.${activeImage.id}.alt`) : t("slideAlt");

  return (
    <div className={`absolute inset-0 ${className}`}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          animate={{ opacity: 1 }}
          className="absolute inset-0"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key={`${activeImage.id}-${currentIndex}`}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <Image
            alt={alt}
            className="object-cover object-center"
            fill
            priority
            sizes="100vw"
            src={activeImage.src}
          />
        </motion.div>
      </AnimatePresence>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-none absolute inset-x-0 bottom-6 z-30 px-6 sm:px-10 lg:px-16"
        initial={{ opacity: 0, y: 8 }}
        transition={{ delay: 1.2, duration: motionDuration.reveal }}
      >
        <div className="pointer-events-auto flex w-full items-center justify-between">
          <div className="relative flex h-10 w-6 items-center justify-center rounded-full border border-white/35 bg-white/5 backdrop-blur-[2px]">
            <motion.div
              animate={
                shouldReduce
                  ? { y: -3 }
                  : { opacity: [0.4, 1, 0.4], y: [-3, 3, -3] }
              }
              className="h-1.5 w-1.5 rounded-full bg-white"
              transition={
                shouldReduce
                  ? { duration: 0 }
                  : {
                      duration: 1.8,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }
              }
            />
          </div>

          {availableImages.length > 1 ? (
            <div className="flex items-center gap-4">
              <button
                aria-label={t("previousSlideAriaLabel")}
                className="flex size-10 items-center justify-center text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={previous}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="size-7" />
              </button>
              <div className="relative h-px w-24 bg-white/40">
                <motion.div
                  animate={{
                    left: `${(currentIndex / availableImages.length) * 100}%`,
                    width: `${100 / availableImages.length}%`,
                  }}
                  className="absolute inset-y-0 bg-white"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
              <button
                aria-label={t("nextSlideAriaLabel")}
                className="flex size-10 items-center justify-center text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={next}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="size-7" />
              </button>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
