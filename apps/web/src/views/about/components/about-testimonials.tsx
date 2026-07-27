"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Star, Quote } from "lucide-react";
import { Container } from "@/src/components/common/container";
import {
  StaggerGroup,
  StaggerItem,
} from "@/src/components/animation/stagger-group";
import { FadeIn } from "@/src/components/animation/fade-in";
import { aboutTestimonials } from "../about.constants";

export function AboutTestimonials() {
  const t = useTranslations("AboutPage");

  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <Container>
        <FadeIn direction="up" className="text-center max-w-4xl mx-auto mb-16">
          <span className="block text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-premium-red mb-2">
            {t("testimonials.eyebrow")}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wide text-deep-black leading-tight sm:whitespace-nowrap">
            {t("testimonials.title")}
          </h2>
        </FadeIn>

        <StaggerGroup className="grid gap-8 md:grid-cols-2">
          {aboutTestimonials.map((item) => (
            <StaggerItem
              key={item.id}
              className="group rounded-3xl border border-border-gray bg-white p-8 shadow-md hover:shadow-xl hover:border-premium-red/50 hover:-translate-y-1.5 transition-all duration-300 relative flex flex-col justify-between cursor-pointer"
            >
              <Quote className="size-10 text-premium-red/20 group-hover:text-premium-red/40 transition-colors duration-300 absolute top-6 right-6" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-1 text-accent-gold">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-accent-gold" />
                  ))}
                </div>

                <p className="text-base text-stone-gray italic leading-relaxed text-pretty">
                  &ldquo;{t(`testimonials.items.${item.id}.quote`)}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-4 pt-6 mt-6 border-t border-border-gray/60 relative z-10">
                <div className="relative size-12 rounded-full overflow-hidden shrink-0 border border-border-gray">
                  <Image
                    src={item.avatar}
                    alt={t(`testimonials.items.${item.id}.author`)}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-deep-black text-sm">
                    {t(`testimonials.items.${item.id}.author`)}
                  </h3>
                  <p className="text-xs text-stone-gray">
                    {t(`testimonials.items.${item.id}.role`)}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
