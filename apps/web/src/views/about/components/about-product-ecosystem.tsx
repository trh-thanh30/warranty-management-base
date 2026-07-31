"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Shield, Zap, Camera, Gauge, ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Container } from "@/src/components/common/container";
import { openPublicQuickChat } from "@/src/components/common/public-quick-chat.events";
import { PUBLIC_FEATURES } from "@/src/config/public-features.config";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { aboutEcosystemProducts } from "../about.constants";

const productIcons = {
  Shield,
  Zap,
  Camera,
  Gauge,
};

export function AboutProductEcosystem() {
  const t = useTranslations("AboutPage");
  const viewAllCtaLabel = PUBLIC_FEATURES.products
    ? "ecosystem.viewAllCta"
    : "hero.contactCta";
  const productDetailCtaLabel = PUBLIC_FEATURES.products
    ? "ecosystem.productDetailCta"
    : "hero.contactCta";

  return (
    <section className="w-full bg-surface-muted py-16 lg:py-24">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="block text-xs sm:text-sm font-semibold uppercase text-premium-red mb-2 font-sans">
              {t("ecosystem.eyebrow")}
            </span>
            <h2 className="font-condensed text-3xl sm:text-5xl font-semibold uppercase tracking-tight text-deep-black leading-snug">
              {t("ecosystem.title")}
            </h2>
            <p className="font-sans text-sm sm:text-base text-stone-gray leading-relaxed mt-3 text-pretty">
              {t("ecosystem.description")}
            </p>
          </div>

          {PUBLIC_FEATURES.products ? (
            <Button
              asChild
              className="h-auto shrink-0 p-0 font-sans text-xs font-semibold uppercase tracking-wider text-premium-red hover:bg-transparent hover:text-warm-red sm:text-sm"
              variant="ghost"
            >
              <Link href={APP_ROUTES.products}>
                <span>{t(viewAllCtaLabel)}</span>
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button
              className="h-auto shrink-0 p-0 font-sans text-xs font-semibold uppercase tracking-wider text-premium-red hover:bg-transparent hover:text-warm-red sm:text-sm"
              onClick={openPublicQuickChat}
              type="button"
              variant="ghost"
            >
              <span>{t(viewAllCtaLabel)}</span>
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {aboutEcosystemProducts.map((product, index) => {
            const IconComponent =
              productIcons[product.iconName as keyof typeof productIcons] ??
              Shield;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group flex flex-col justify-between rounded-3xl border border-border-gray bg-white overflow-hidden shadow-md hover:border-premium-red hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                    <Image
                      src={product.image}
                      alt={t(`ecosystem.items.${product.id}.title`)}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-deep-black/80 backdrop-blur-md px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white font-sans">
                      <IconComponent className="size-3.5 text-premium-red" />
                      <span>{product.badge}</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-sans text-base sm:text-lg font-semibold uppercase tracking-wider text-deep-black leading-snug group-hover:text-premium-red transition-colors">
                      {t(`ecosystem.items.${product.id}.title`)}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-stone-gray leading-relaxed text-left text-pretty">
                      {t(`ecosystem.items.${product.id}.description`)}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  {PUBLIC_FEATURES.products ? (
                    <Button
                      asChild
                      className="h-auto p-0 font-sans text-xs font-semibold uppercase tracking-wider text-deep-black group-hover:text-premium-red hover:bg-transparent hover:text-premium-red"
                      variant="ghost"
                    >
                      <Link href={APP_ROUTES.products}>
                        <span>{t(productDetailCtaLabel)}</span>
                        <ArrowRight aria-hidden="true" className="size-3.5" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="h-auto p-0 font-sans text-xs font-semibold uppercase tracking-wider text-deep-black group-hover:text-premium-red hover:bg-transparent hover:text-premium-red"
                      onClick={openPublicQuickChat}
                      type="button"
                      variant="ghost"
                    >
                      <span>{t(productDetailCtaLabel)}</span>
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
