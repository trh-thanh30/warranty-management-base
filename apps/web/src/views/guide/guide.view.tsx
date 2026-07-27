"use client";

import { useTranslations } from "next-intl";

export function GuideView() {
  const t = useTranslations("GuidePage");
  return (
    <main className="min-h-screen bg-surface-muted py-12 sm:py-20 text-deep-black">
      <div className="mx-auto max-w-[1000px] px-6 space-y-12">
        <div className="text-center space-y-4">
          <span className="inline-block bg-deep-black/10 text-deep-black border border-deep-black/30 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.25em]">
            {t("eyebrow")}
          </span>
          <h1 className="text-3xl sm:text-5xl font-condensed font-semibold uppercase tracking-wider">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-stone-gray font-normal max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="bg-white rounded-[28px] p-8 sm:p-12 border border-border-gray shadow-xl space-y-8 text-sm text-stone-gray font-normal">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold uppercase text-deep-black">
              {t("steps.receive.title")}
            </h2>
            <p>{t("steps.receive.description")}</p>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold uppercase text-deep-black">
              {t("steps.lookup.title")}
            </h2>
            <p>{t("steps.lookup.description")}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
