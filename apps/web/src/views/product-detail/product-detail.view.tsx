"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  ShieldAlert,
  Sun,
} from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { findProductBySlug } from "@/src/constants/product-catalog.constants";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import type { ProductCatalogItem } from "@/src/types/product-catalog.types";
import {
  defaultFilmProductId,
  filmCatalogMap,
  spectrumImages,
} from "./product-detail.constants";

interface ProductDetailViewProps {
  slug: string;
}

interface ReasonItem {
  title: string;
  description: string;
}

export function ProductDetailView({ slug }: ProductDetailViewProps) {
  const product = findProductBySlug(slug);

  if (product && !product.film) {
    return <AccessoryProductDetail product={product} />;
  }

  return <FilmProductDetail slug={slug} />;
}

function AccessoryProductDetail({ product }: { product: ProductCatalogItem }) {
  const t = useTranslations("ProductDetailPage");
  const productsT = useTranslations("ProductsPage");
  const introduction = t.raw(
    `products.${product.detailKey}.introduction`,
  ) as string[];
  const features = t.raw(`products.${product.detailKey}.features`) as string[];
  const applications = t.raw(
    `products.${product.detailKey}.applications`,
  ) as string[];

  return (
    <main className="min-h-screen bg-surface-muted text-deep-black">
      <section className="border-b border-border-gray bg-white py-10 sm:py-16">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border-gray bg-surface-muted">
            <Image
              src={product.image}
              alt={productsT("productImageAlt", { code: product.code })}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-4"
            />
          </div>

          <div className="space-y-5">
            <nav className="flex items-center gap-2 text-sm text-stone-gray">
              <Link href={APP_ROUTES.home}>{t("breadcrumbs.home")}</Link>
              <span>/</span>
              <Link href={APP_ROUTES.products}>
                {t("breadcrumbs.products")}
              </Link>
            </nav>
            <span className="text-sm font-medium uppercase tracking-wider text-premium-red">
              {t(`products.${product.detailKey}.eyebrow`)}
            </span>
            <h1 className="font-condensed text-3xl font-semibold uppercase tracking-wide sm:text-5xl">
              {productsT(`catalog.items.${product.detailKey}.name`)}
            </h1>
            <p className="text-base leading-relaxed text-stone-gray sm:text-lg">
              {t(`products.${product.detailKey}.description`)}
            </p>
            <div className="grid grid-cols-2 gap-3 border-y border-border-gray py-5">
              {product.highlightSpecs.map((spec) => (
                <div key={spec.id}>
                  <span className="block text-xs font-medium uppercase text-stone-gray">
                    {productsT(`catalog.specs.${spec.id}`)}
                  </span>
                  <span className="text-base font-semibold">
                    {spec.translateValue
                      ? productsT(`catalog.values.${spec.value}`)
                      : spec.value}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href={APP_ROUTES.contact}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-premium-red px-6 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-warm-red"
            >
              {t("bookInstallationCta")}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-4 sm:px-6 lg:grid-cols-3">
          {[
            { title: t("introductionTitle"), items: introduction },
            { title: t("technologyTitle"), items: features },
            { title: t("applicationsTitle"), items: applications },
          ].map((section) => (
            <article
              key={section.title}
              className="rounded-3xl border border-border-gray bg-white p-6"
            >
              <h2 className="font-condensed text-xl font-semibold uppercase tracking-wide">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-gray">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-premium-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function FilmProductDetail({ slug }: ProductDetailViewProps) {
  const t = useTranslations("ProductDetailPage");
  const productsT = useTranslations("ProductsPage");
  const locale = useLocale();
  const catalogProduct = findProductBySlug(slug);
  const productId = catalogProduct?.film
    ? catalogProduct.id
    : defaultFilmProductId;
  const filmData =
    filmCatalogMap[productId as keyof typeof filmCatalogMap] ??
    filmCatalogMap[defaultFilmProductId];
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    setSelectedIndex(emblaApi?.selectedScrollSnap() ?? 0);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const activeName = productsT(`catalog.items.${filmData.detailKey}.name`);
  const activePrice = filmData.priceRange
    .map((price) =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(price),
    )
    .join(" – ");
  const reasons = t.raw("film.reasons") as ReasonItem[];
  const metrics = [
    ["vlt", filmData.film.vlt, filmData.vltNum],
    [
      "internalReflection",
      filmData.film.internalReflection,
      filmData.internalReflectionNum,
    ],
    [
      "externalReflection",
      filmData.film.externalReflection,
      filmData.externalReflectionNum,
    ],
    [
      "energyTransmission",
      filmData.film.energyTransmission,
      filmData.energyTransmissionNum,
    ],
    [
      "energyReflection",
      filmData.film.energyReflection,
      filmData.energyReflectionNum,
    ],
    [
      "energyAbsorption",
      filmData.film.energyAbsorption,
      filmData.energyAbsorptionNum,
    ],
    ["uvBlock", filmData.film.uvBlock, filmData.uvBlockNum],
    ["irBlock", filmData.film.irBlock, filmData.irBlockNum],
    [
      "heatTransferCoeff",
      filmData.film.heatTransferCoeff,
      filmData.heatTransferCoeffNum,
    ],
  ] as const;

  return (
    <main className="min-h-screen bg-white text-deep-black">
      <div className="border-b border-border-gray bg-white py-3">
        <nav className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 text-xs font-medium text-stone-gray sm:px-6">
          <Link
            href={APP_ROUTES.home}
            className="transition-colors hover:text-premium-red"
          >
            {t("breadcrumbs.home")}
          </Link>
          <ChevronRight className="size-3.5 text-stone-gray/50" />
          <Link
            href={APP_ROUTES.products}
            className="transition-colors hover:text-premium-red"
          >
            {t("breadcrumbs.products")}
          </Link>
          <ChevronRight className="size-3.5 text-stone-gray/50" />
          <span className="truncate font-semibold text-deep-black">
            <span className="sm:hidden">{filmData.code}</span>
            <span className="hidden sm:inline">{activeName}</span>
          </span>
        </nav>
      </div>

      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <SectionHeading
            number="01"
            eyebrow={t("film.overviewEyebrow")}
            title={activeName}
          />
          <div className="mt-8 grid gap-8 rounded-3xl border border-border-gray bg-surface-muted p-5 sm:p-8 lg:grid-cols-2 lg:p-10">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border-gray bg-white">
              <Image
                src={filmData.image}
                alt={activeName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-lg bg-premium-red px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  VLT | {filmData.code}
                </span>
                <span className="rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-deep-black">
                  {t("film.noTint")}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="font-condensed text-3xl font-semibold uppercase tracking-wide sm:text-5xl">
                {activeName}
              </h1>
              <p className="mt-2 text-xl font-semibold text-premium-red">
                {activePrice}
              </p>
              <ul className="my-6 space-y-3 border-y border-border-gray py-5 text-base">
                <li>
                  {t("summary.color", {
                    value: t(`colors.${filmData.film.colorId}`),
                  })}
                </li>
                <li>{t("summary.vlt", { value: filmData.film.vlt })}</li>
                <li>{t("summary.ir", { value: filmData.film.irBlock })}</li>
                <li>{t("summary.uv", { value: filmData.film.uvBlock })}</li>
                <li>
                  {t("summary.heatTransfer", {
                    value: filmData.film.heatTransferCoeff,
                  })}
                </li>
              </ul>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="tel:0886337733"
                  className="flex items-center gap-3 rounded-2xl bg-premium-red p-4 text-white transition-colors hover:bg-warm-red"
                >
                  <PhoneCall className="size-5" />
                  <span>
                    <span className="block text-xs uppercase tracking-wide">
                      {t("film.hotlineLabel")}
                    </span>
                    <span className="font-semibold">0886 33 77 33</span>
                  </span>
                </a>
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-zalo-blue p-4 text-white transition-opacity hover:opacity-90"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-white text-xs font-semibold text-zalo-blue">
                    Zalo
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wide text-white/80">
                      {t("film.onlineLabel")}
                    </span>
                    <span className="font-semibold">{t("film.zaloCta")}</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border-gray bg-surface-muted py-12 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <SectionHeading
            number="02"
            eyebrow={t("film.technologyEyebrow")}
            title={t("film.technologyTitle", {
              technology: filmData.film.structure,
              code: filmData.code,
            })}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [t("film.facts.originLabel"), t("film.facts.originValue")],
              [t("film.facts.technologyLabel"), filmData.film.structure],
              [t("film.facts.mechanismLabel"), t("film.facts.mechanismValue")],
              [t("film.facts.materialLabel"), t("film.facts.materialValue")],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-border-gray bg-white p-5"
              >
                <span className="text-xs font-medium uppercase tracking-widest text-stone-gray">
                  {label}
                </span>
                <span className="mt-2 block text-base font-semibold uppercase">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-4xl text-base leading-relaxed text-stone-gray sm:text-lg">
            {t("film.technologyDescription")}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <SectionHeading
            number="03"
            eyebrow={t("film.specsEyebrow")}
            title={t("film.specsTitle")}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map(([id, displayValue, numericValue]) => (
              <article
                key={id}
                className="rounded-2xl border border-border-gray bg-white p-5"
              >
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium uppercase tracking-wide">
                    {t(`film.metrics.${id}`)}
                  </span>
                  <span className="font-semibold text-premium-red">
                    {displayValue}
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-premium-red"
                    style={{ width: `${Math.min(numericValue, 100)}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-deep-black px-5 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white">
            {t("warrantyYears", { years: filmData.warrantyYears })}
          </div>
        </div>
      </section>

      <section className="border-y border-border-gray bg-surface-muted py-12 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <SectionHeading
            number="04"
            eyebrow={t("film.spectrumEyebrow")}
            title={t("film.spectrumTitle", { code: filmData.code })}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {spectrumImages.map((src, index) => (
              <div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border-gray bg-white"
              >
                <Image
                  src={src}
                  alt={t("film.spectrumImageAlt", {
                    code: filmData.code,
                    index: index + 1,
                  })}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <p className="mt-6 text-base leading-relaxed text-stone-gray">
            {t("film.spectrumDescription")}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <SectionHeading
            number="05"
            eyebrow={t("film.mechanismEyebrow")}
            title={t("film.mechanismTitle", { code: filmData.code })}
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[
              {
                Icon: Sun,
                title: t("film.visibleLightTitle"),
                description: t("film.visibleLightDescription"),
              },
              {
                Icon: ShieldAlert,
                title: t("film.infraredTitle"),
                description: t("film.infraredDescription"),
              },
            ].map(({ Icon, title, description }) => (
              <article
                key={title}
                className="rounded-3xl border border-border-gray bg-surface-muted p-6 sm:p-8"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-premium-red/10 text-premium-red">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-5 font-condensed text-xl font-semibold uppercase">
                  {title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-stone-gray">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border-gray bg-surface-muted py-12 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <SectionHeading
            number="06"
            eyebrow={t("film.reasonsEyebrow")}
            title={t("film.reasonsTitle")}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {reasons.map((reason, index) => (
              <article
                key={reason.title}
                className="rounded-2xl border border-border-gray bg-white p-5"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-premium-red text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-gray">
                  {reason.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <SectionHeading
            number="07"
            eyebrow={t("film.climateEyebrow")}
            title={t("film.climateTitle")}
          />
          <p className="mt-8 rounded-3xl border border-border-gray bg-surface-muted p-6 text-base leading-relaxed text-stone-gray sm:p-10 sm:text-lg">
            {t("film.climateDescription")}
          </p>
        </div>
      </section>

      <section className="border-y border-border-gray bg-surface-muted py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <SectionHeading
            number="08"
            eyebrow={t("film.galleryEyebrow")}
            title={t("film.galleryTitle")}
          />

          <div className="mt-8 space-y-4 sm:hidden">
            <div ref={emblaRef} className="overflow-hidden rounded-3xl">
              <div className="flex">
                {filmData.galleryImages.map((src, index) => (
                  <div key={src} className="min-w-0 flex-[0_0_100%]">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={src}
                        alt={t("film.galleryImageAlt", {
                          code: filmData.code,
                          index: index + 1,
                        })}
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-5">
              <CarouselButton
                label={t("film.previousImage")}
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ChevronLeft className="size-5" />
              </CarouselButton>
              <span className="text-sm font-medium text-stone-gray">
                {selectedIndex + 1} / {filmData.galleryImages.length}
              </span>
              <CarouselButton
                label={t("film.nextImage")}
                onClick={() => emblaApi?.scrollNext()}
              >
                <ChevronRight className="size-5" />
              </CarouselButton>
            </div>
          </div>

          <div className="mt-8 hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {filmData.galleryImages.slice(0, 6).map((src, index) => (
              <div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border-gray bg-white"
              >
                <Image
                  src={src}
                  alt={t("film.galleryImageAlt", {
                    code: filmData.code,
                    index: index + 1,
                  })}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 text-center sm:py-16">
        <h2 className="font-condensed text-2xl font-semibold uppercase tracking-wide sm:text-4xl">
          {t("relatedTitle")}
        </h2>
        <Link
          href={APP_ROUTES.products}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-premium-red px-6 py-4 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-warm-red"
        >
          <ArrowLeft className="size-4" />
          {t("backToCatalog")}
        </Link>
      </section>
    </main>
  );
}

function SectionHeading({
  number,
  eyebrow,
  title,
}: {
  number: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <span
        aria-hidden="true"
        className="font-condensed text-5xl font-semibold leading-none tracking-tighter text-transparent sm:text-7xl"
        style={{ WebkitTextStroke: "2px var(--color-stone-gray)" }}
      >
        {number}
      </span>
      <div>
        <span className="inline-flex rounded-full bg-premium-red px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
          {eyebrow}
        </span>
        <h2 className="mt-2 font-condensed text-2xl font-semibold uppercase tracking-wide sm:text-4xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-full border border-border-gray bg-white transition-colors hover:border-premium-red hover:text-premium-red"
    >
      {children}
    </button>
  );
}
