"use client";

import { Container } from "@/src/components/common/container";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { ArrowUpRight, Handshake } from "lucide-react";
import { useTranslations } from "next-intl";

export function DealerRecruitmentCta() {
  const t = useTranslations("DealersPage.recruitment");

  return (
    <section
      aria-labelledby="dealer-recruitment-title"
      className="bg-white pb-10 lg:pb-16"
    >
      <Container>
        <Card className="relative overflow-hidden rounded-sm border-border-gray bg-white px-6 py-8 text-deep-black shadow-sm sm:px-8 lg:px-12 lg:py-10">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1.5 bg-premium-red"
          />
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-24 size-64 rotate-12 border-32 border-premium-red/5"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3 text-premium-red">
                <Handshake aria-hidden="true" className="size-5 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {t("eyebrow")}
                </span>
              </div>

              <h2
                id="dealer-recruitment-title"
                className="font-condensed text-2xl font-bold uppercase leading-tight tracking-wide text-deep-black sm:text-3xl lg:text-4xl"
              >
                {t("title")}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-gray sm:text-base">
                {t("description")}
              </p>
            </div>

            <Button
              asChild
              size="md"
              className="min-h-12 w-full rounded-sm bg-premium-red px-6 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-warm-red focus-visible:ring-premium-red focus-visible:ring-offset-white sm:w-fit"
            >
              <Link href={APP_ROUTES.contact}>
                <span>{t("cta")}</span>
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </Container>
    </section>
  );
}
