"use client";

import { useTranslations } from "next-intl";

export function PolicyView() {
  const t = useTranslations("PolicyPage");
  return (
    <main className="min-h-screen bg-surface-muted py-12 sm:py-20 text-deep-black">
      <div className="mx-auto max-w-[1000px] px-6 space-y-12">
        <div className="text-center space-y-4">
          <span className="inline-block bg-premium-red/10 text-premium-red border border-premium-red/30 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.25em]">
            {t("eyebrow")}
          </span>
          <h1 className="text-3xl sm:text-5xl font-condensed font-semibold uppercase tracking-wider">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-stone-gray max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="bg-white rounded-[28px] p-8 sm:p-12 border border-border-gray shadow-xl space-y-8 text-sm leading-relaxed text-stone-gray">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold uppercase text-deep-black">
              {t("duration.title")}
            </h2>
            <p>{t("duration.description")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold uppercase text-deep-black">
              {t("conditions.title")}
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>{t("conditions.items.material")}</li>
              <li>{t("conditions.items.performance")}</li>
              <li>{t("conditions.items.registration")}</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
