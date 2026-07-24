"use client";

import { useTranslations } from "next-intl";
import { WarrantyActionCards } from "./components/warranty-action-cards";

export function WarrantyHubView() {
  const t = useTranslations("Warranty.hub");
  return (
    <main className="min-h-screen bg-white text-deep-black">
      {/* Sub Hero Banner */}
      <div className="bg-deep-black text-white py-16 sm:py-24 text-center border-b border-ink-black">
        <div className="mx-auto max-w-[1200px] px-6 space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-condensed font-semibold uppercase tracking-wider">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-white/70 font-medium max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>
      </div>

      {/* 6 Action Cards Section */}
      <WarrantyActionCards />
    </main>
  );
}
