"use client";

import { useTranslations } from "next-intl";
import { MapPin, Phone, Clock } from "lucide-react";
import { supportCenters } from "./support-centers.constants";

export function SupportCentersView() {
  const t = useTranslations("SupportCentersPage");

  return (
    <main className="min-h-screen bg-surface-muted py-12 sm:py-20 text-deep-black">
      <div className="mx-auto max-w-[1200px] px-6 space-y-12">
        <div className="text-center space-y-4">
          <span className="inline-block bg-premium-red/10 text-premium-red border border-premium-red/30 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.25em]">
            {t("eyebrow")}
          </span>
          <h1 className="text-3xl sm:text-5xl font-condensed font-semibold uppercase tracking-wider">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-stone-gray font-medium max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {supportCenters.map((center) => (
            <div
              key={center.id}
              className="bg-white rounded-[24px] p-6 border border-border-gray shadow-md space-y-4 hover:border-premium-red transition-colors"
            >
              <span className="text-xs font-semibold text-premium-red uppercase tracking-wider block">
                {t(`centers.${center.id}.city`)}
              </span>
              <h3 className="text-lg font-semibold uppercase text-deep-black">
                {t(`centers.${center.id}.name`)}
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-stone-gray font-medium">
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 text-premium-red shrink-0 mt-0.5" />
                  <span>{t(`centers.${center.id}.address`)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-premium-red shrink-0" />
                  <span className="font-medium text-deep-black">
                    {center.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-premium-red shrink-0" />
                  <span>{t(`centers.${center.id}.hours`)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
