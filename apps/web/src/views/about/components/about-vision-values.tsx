"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/src/components/common/container";
import {
  StaggerGroup,
  StaggerItem,
} from "@/src/components/animation/stagger-group";
import { FadeIn } from "@/src/components/animation/fade-in";
import { aboutCorePillars } from "../about.constants";

export function AboutVisionValues() {
  const t = useTranslations("AboutPage");

  return (
    <section className="w-full bg-white py-20 lg:py-28">
      <Container>
        {/* Clean Header with FadeIn animation */}
        <FadeIn
          direction="up"
          className="text-center max-w-3xl mx-auto mb-16 space-y-3"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="w-8 h-[2px] bg-premium-red shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-premium-red">
              {t("pillars.eyebrow")}
            </span>
            <span className="w-8 h-[2px] bg-premium-red shrink-0" />
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-deep-black leading-tight">
            {t("pillars.title")}
          </h2>
        </FadeIn>

        {/* Clean Editorial 3-Column Pillars with Staggered Entrance & Hover Animations */}
        <StaggerGroup className="grid gap-10 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-gray/60">
          {aboutCorePillars.map((pillar, index) => (
            <StaggerItem
              key={pillar.id}
              className={`group space-y-4 cursor-pointer ${
                index !== 0 ? "md:pl-10 pt-8 md:pt-0" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl sm:text-5xl font-bold text-stone-300 group-hover:text-premium-red transition-colors duration-300 leading-none">
                  0{index + 1}
                </span>
                <span className="w-8 group-hover:w-14 h-[2px] bg-premium-red/30 group-hover:bg-premium-red transition-all duration-300" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-deep-black border-l-2 border-premium-red pl-3.5 group-hover:pl-5 transition-all duration-300">
                {t(`pillars.items.${pillar.id}.title`)}
              </h3>

              <p className="text-sm sm:text-base text-stone-gray leading-relaxed text-pretty">
                {t(`pillars.items.${pillar.id}.description`)}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
