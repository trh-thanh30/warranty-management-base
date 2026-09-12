"use client";

import { Container } from "@/src/components/common/container";
import { useTranslations } from "next-intl";
import { WarrantyActionCards } from "./components/warranty-action-cards";

export function WarrantyHubView() {
  const t = useTranslations("Warranty.hub");
  return (
    <main className="min-h-screen bg-white text-deep-black">
      {/* Sub Hero Banner */}
      <section className="flex min-h-72 items-center border-b border-ink-black bg-deep-black py-16 text-center text-white sm:min-h-96 sm:py-24">
        <Container className="max-w-300 space-y-4">
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
