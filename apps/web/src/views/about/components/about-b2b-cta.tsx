"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Phone, CheckCircle2 } from "lucide-react";
import { Container } from "@/src/components/common/container";
import {
  StaggerGroup,
  StaggerItem,
} from "@/src/components/animation/stagger-group";
import { FadeIn } from "@/src/components/animation/fade-in";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { aboutB2BBenefits } from "../about.constants";
import { usePrimaryWebsiteHotline } from "@/src/app/providers/site-settings-provider";

export function AboutB2BCta() {
  const t = useTranslations("AboutPage");
  const hotline = usePrimaryWebsiteHotline();

  return (
    <section className="w-full bg-surface-muted py-16 sm:py-20 lg:py-24">
      <Container>
        <FadeIn
          direction="up"
          className="text-center space-y-6 max-w-4xl mx-auto"
        >
          {/* Clean Red Line Eyebrow Tag */}
          <div className="flex items-center justify-center gap-3">
            <span className="w-8 h-[2px] bg-premium-red shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-premium-red">
              {t("b2bCta.eyebrow")}
            </span>
            <span className="w-8 h-[2px] bg-premium-red shrink-0" />
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-deep-black leading-tight">
            {t("b2bCta.title")}
          </h2>

          <p className="text-sm sm:text-base text-stone-gray leading-relaxed max-w-2xl mx-auto text-pretty">
            {t("b2bCta.description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 pb-4">
            <Link
              href={APP_ROUTES.dealers}
              className="inline-flex items-center justify-center gap-2.5 rounded-md bg-premium-red hover:bg-warm-red px-8 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all cursor-pointer"
            >
              <span>{t("b2bCta.partnerBtn")}</span>
              <ArrowRight className="size-4 text-white" />
            </Link>

            {hotline && (
              <a
                href={hotline.href}
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-white hover:bg-stone-100 border border-border-gray px-8 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-deep-black transition-all cursor-pointer"
              >
                <Phone className="size-4 text-premium-red" />
                <span>
                  {t("b2bCta.hotlineBtn", {
                    phone: hotline.displayValue,
                  })}
                </span>
              </a>
            )}
          </div>

          {/* Checkmark Bullet Points (Single Line Layout with Staggered Animation) */}
          <StaggerGroup className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-8 border-t border-border-gray/80 text-xs sm:text-sm font-semibold text-deep-black max-w-4xl mx-auto whitespace-nowrap">
            {aboutB2BBenefits.map((benefitKey) => (
              <StaggerItem
                key={benefitKey}
                className="flex items-center justify-center gap-2 shrink-0"
              >
                <CheckCircle2 className="size-4 text-premium-red shrink-0" />
                <span>{t(`b2bCta.benefits.${benefitKey}`)}</span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </FadeIn>
      </Container>
    </section>
  );
}
