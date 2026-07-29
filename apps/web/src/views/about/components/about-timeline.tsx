"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/src/components/common/container";
import { FadeIn } from "@/src/components/animation/fade-in";

const timelineData = [
  {
    id: "rdJapan",
    year: "2015",
    isCurrent: false,
    tags: ["technology", "research", "patents"],
    stats: [
      { id: "patents", value: "50+" },
      { id: "research", value: "3" },
      { id: "certification", value: "ISO 9001" },
    ],
  },
  {
    id: "launchVietnam",
    year: "2018",
    isCurrent: false,
    tags: ["launch", "dealers", "customers"],
    stats: [
      { id: "dealers", value: "50+" },
      { id: "customers", value: "10K+" },
      { id: "satisfaction", value: "99%" },
    ],
  },
  {
    id: "ewarrantyRelease",
    year: "2021",
    isCurrent: false,
    tags: ["ewarranty", "digitalApp", "records"],
    stats: [
      { id: "warranties", value: "100K+" },
      { id: "lookup", value: "24/7" },
      { id: "commitment", value: "10" },
    ],
  },
  {
    id: "networkExpansion",
    year: "2024",
    isCurrent: true,
    tags: ["dealers", "provinces", "leader"],
    stats: [
      { id: "dealers", value: "100+" },
      { id: "provinces", value: "34" },
      { id: "brand", value: "#1" },
    ],
  },
] as const;

export function AboutTimeline() {
  const t = useTranslations("AboutPage");

  return (
    <section className="w-full bg-surface-muted py-20 lg:py-28">
      <Container>
        {/* Header Section with FadeIn animation */}
        <FadeIn
          direction="up"
          className="text-center max-w-3xl mx-auto mb-16 space-y-3"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="w-8 h-[2px] bg-premium-red shrink-0" />
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-premium-red">
              {t("milestones.eyebrow")}
            </span>
            <span className="w-8 h-[2px] bg-premium-red shrink-0" />
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-deep-black leading-tight">
            {t("milestones.title")}
          </h2>

          <p className="text-sm sm:text-base text-stone-gray text-pretty">
            {t("milestones.description")}
          </p>
        </FadeIn>

        {/* UNBOXED SPLIT TIMELINE ROWS (Individual Scroll FadeIn for Each Year) */}
        <div className="divide-y divide-border-gray/60 max-w-6xl mx-auto">
          {timelineData.map((item) => (
            <FadeIn
              key={item.id}
              direction="up"
              className="py-10 first:pt-0 last:pb-0"
            >
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Column 1: Year Pill / Accent Tag (2 Cols) */}
                <div className="lg:col-span-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-[2px] bg-premium-red shrink-0" />
                    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-deep-black leading-none">
                      {item.year}
                    </span>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-premium-red block pl-6">
                    {item.isCurrent
                      ? t("milestones.current")
                      : t(`milestones.items.${item.id}.phase`)}
                  </span>
                </div>

                {/* Column 2: Main Narrative Content (6 Cols) */}
                <div className="lg:col-span-6 space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-deep-black leading-snug">
                    {t(`milestones.items.${item.id}.title`)}
                  </h3>

                  <p className="text-sm sm:text-base text-stone-gray leading-relaxed text-pretty">
                    {t(`milestones.items.${item.id}.description`)}
                  </p>

                  {/* Clean Unboxed Inline Tags */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
                    {item.tags.map((tag) => (
                      <div key={tag} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-premium-red shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-soft-gray">
                          {t(`milestones.items.${item.id}.tags.${tag}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Stats Row (4 Cols) */}
                <div className="lg:col-span-4 grid grid-cols-3 gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:border-border-gray/60 lg:pl-8">
                  {item.stats.map((stat) => (
                    <div key={stat.id} className="space-y-1">
                      <div className="text-xl sm:text-2xl font-bold tracking-tight text-premium-red leading-none">
                        {t(
                          `milestones.items.${item.id}.stats.${stat.id}.value`,
                          { value: stat.value },
                        )}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-gray block leading-tight">
                        {t(
                          `milestones.items.${item.id}.stats.${stat.id}.label`,
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
