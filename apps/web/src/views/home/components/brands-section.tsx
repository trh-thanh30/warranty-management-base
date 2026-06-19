"use client";

import Image from "next/image";
import { carBrands } from "../home.constants";

// Duplicate for seamless loop
const track = [...carBrands, ...carBrands];

function BrandCard({ brand }: { brand: (typeof carBrands)[number] }) {
  return (
    <div className="flex h-12 min-w-[140px] shrink-0 items-center justify-center rounded-[4px] border border-cloud bg-ash px-5 transition-colors duration-[330ms] hover:border-brand-blue/30 hover:bg-brand-blue/5 group">
      <Image
        src={brand.src}
        alt={`${brand.name} logo`}
        width={96}
        height={24}
        loading="lazy"
        className="h-6 w-24 object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100"
      />
    </div>
  );
}

export function BrandsSection() {
  return (
    <section
      aria-label="Supported car brands"
      className="overflow-hidden border-y border-cloud bg-white py-6"
    >
      {/* Label */}
      <p className="mb-5 text-center text-xs font-medium uppercase tracking-widest text-pewter">
        All makes &amp; models covered
      </p>

      {/* Row 1 — Left (Pauses on hover for focused interaction) */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
        <div className="flex w-max flex-nowrap items-center gap-8 animate-marquee-left will-change-transform py-2 hover:[animation-play-state:paused]">
          {track.map((brand, i) => (
            <BrandCard key={`r1-${brand.name}-${i}`} brand={brand} />
          ))}
        </div>
      </div>

      {/* Row 2 — Right (Pauses on hover for focused interaction) */}
      <div className="relative mt-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
        <div className="flex w-max flex-nowrap items-center gap-8 animate-marquee-right will-change-transform py-2 hover:[animation-play-state:paused]">
          {track.map((brand, i) => (
            <BrandCard key={`r2-${brand.name}-${i}`} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
