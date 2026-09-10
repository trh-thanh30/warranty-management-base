"use client";

import { Container } from "@/src/components/common/container";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { WarrantyActionCards } from "./components/warranty-action-cards";

export function WarrantyHubView() {
  const t = useTranslations("Warranty.hub");
  return (
    <main className="min-h-screen bg-white text-deep-black">
      {/* Sub Hero Banner */}
      <section className="group relative isolate flex aspect-[16/5] min-h-96 items-center overflow-hidden border-b border-ink-black py-16 text-center text-white sm:py-24">
        <Image
          src="/dealer/dealer.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-black/65 transition-colors duration-500 [@media(hover:hover)]:bg-black/0 [@media(hover:hover)]:group-hover:bg-black/65 motion-reduce:transition-none"
        />
        <Container className="max-w-300 translate-y-0 space-y-4 opacity-100 transition-[opacity,transform] duration-500 ease-out [@media(hover:hover)]:translate-y-6 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 motion-reduce:transform-none motion-reduce:transition-none">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-condensed font-semibold uppercase tracking-wider">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-white font-normal max-w-2xl mx-auto">
            {t("description")}
          </p>
        </Container>
      </section>

      {/* 6 Action Cards Section */}
      <WarrantyActionCards />
    </main>
  );
}
