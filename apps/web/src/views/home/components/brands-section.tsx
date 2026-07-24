"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { carBrands } from "../home.constants";

// Duplicate for seamless loop
const track = [...carBrands, ...carBrands];

function BrandCard({
  brand,
  imageAlt,
}: {
  brand: (typeof carBrands)[number];
  imageAlt: string;
}) {
  return (
    <div className="flex h-14 min-w-[150px] shrink-0 items-center justify-center rounded-xl border border-cloud/60 bg-white px-6 shadow-xs transition-all duration-[330ms] hover:border-brand-blue/40 hover:shadow-md hover:scale-105 group cursor-pointer">
      <Image
        src={brand.src}
        alt={imageAlt}
        width={96}
        height={24}
        loading="lazy"
        className="h-6 w-24 object-contain opacity-60 transition-opacity duration-300 group-hover:opacity-100"
      />
    </div>
  );
}

export function BrandsSection() {
  const t = useTranslations("HomePage.brands");

  return (
    <section
      aria-label={t("ariaLabel")}
      className="overflow-hidden border-y border-cloud/60 bg-ash/50 py-10"
    >
      {/* Label */}
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-premium-red font-sans leading-relaxed">
        {t("title")}
      </p>

      {/* Row 1 — Left (Pauses on hover for focused interaction) */}
      <div className="relative py-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ash/50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ash/50 to-transparent" />
        <div className="flex w-max flex-nowrap items-center gap-6 animate-marquee-left will-change-transform py-2 hover:[animation-play-state:paused]">
          {track.map((brand, i) => (
            <BrandCard
              key={`r1-${brand.name}-${i}`}
              brand={brand}
              imageAlt={t("brandImageAlt", { brand: brand.name })}
            />
          ))}
        </div>
      </div>

      {/* Row 2 — Right (Pauses on hover for focused interaction) */}
      <div className="relative mt-2 py-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ash/50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ash/50 to-transparent" />
        <div className="flex w-max flex-nowrap items-center gap-6 animate-marquee-right will-change-transform py-2 hover:[animation-play-state:paused]">
          {track.map((brand, i) => (
            <BrandCard
              key={`r2-${brand.name}-${i}`}
              brand={brand}
              imageAlt={t("brandImageAlt", { brand: brand.name })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
