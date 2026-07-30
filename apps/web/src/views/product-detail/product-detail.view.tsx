"use client";

import { Container } from "@/src/components/common/container";
import { openPublicQuickChat } from "@/src/components/common/public-quick-chat.events";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { productsService } from "@/src/services/products/products.service";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ImageOff,
  MapPin,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

interface ProductDetailViewProps {
  slug: string;
}

export function ProductDetailView({ slug }: ProductDetailViewProps) {
  const t = useTranslations("ProductDetailPage");
  const productQuery = useQuery({
    queryKey: ["public-product-detail", slug],
    queryFn: ({ signal }) => productsService.getProductDetail(slug, signal),
  });

  if (productQuery.isPending) {
    return <ProductDetailSkeleton />;
  }

  if (productQuery.isError) {
    return (
      <main className="min-h-screen bg-white py-16 text-deep-black">
        <Container className="flex max-w-3xl flex-col items-center text-center">
          <ImageOff className="size-10 text-premium-red" />
          <h1 className="mt-4 text-xl font-semibold uppercase">
            {t("loadErrorTitle")}
          </h1>
          <p className="mt-2 text-base text-stone-gray">
            {t("loadErrorDescription")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              className="bg-premium-red text-white hover:bg-warm-red"
              type="button"
              onClick={() => void productQuery.refetch()}
            >
              <RefreshCw className="size-4" />
              {t("retry")}
            </Button>
            <Button asChild variant="outline">
              <Link href={APP_ROUTES.products}>
                <ArrowLeft className="size-4" />
                {t("backToCatalog")}
              </Link>
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  const product = productQuery.data;
  const primaryImage = product.coverImage ?? product.galleryImages[0] ?? null;

  return (
    <main className="min-h-screen bg-white text-deep-black">
      <div className="border-b border-border-gray py-3">
        <Container className="max-w-350">
          <nav className="flex min-w-0 items-center gap-2 text-sm font-medium text-stone-gray">
            <Link
              className="shrink-0 transition-colors hover:text-premium-red"
              href={APP_ROUTES.home}
            >
              {t("breadcrumbs.home")}
            </Link>
            <ChevronRight className="size-3.5 shrink-0 text-stone-gray/50" />
            <Link
              className="shrink-0 transition-colors hover:text-premium-red"
              href={APP_ROUTES.products}
            >
              {t("breadcrumbs.products")}
            </Link>
            <ChevronRight className="size-3.5 shrink-0 text-stone-gray/50" />
            <span className="truncate font-semibold text-deep-black">
              {product.name}
            </span>
          </nav>
        </Container>
      </div>

      <section className="py-10 sm:py-16">
        <Container className="grid max-w-350 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch">
          <ProductDetailImage
            key={primaryImage?.url ?? product.id}
            alt={primaryImage?.altText ?? product.name}
            src={primaryImage?.url ?? null}
          />

          <div className="min-w-0 lg:flex lg:h-full lg:flex-col">
            <p className="text-sm font-semibold uppercase text-premium-red">
              {product.category.name}
            </p>
            <h1 className="mt-2 text-3xl font-semibold uppercase sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm font-medium uppercase text-stone-gray">
              {[product.brand, product.model].filter(Boolean).join(" / ")}
            </p>
            <p className="mt-5 text-base leading-7 text-stone-gray">
              {product.shortDescription ??
                product.description ??
                t("noDescription")}
            </p>

            <div className="mt-6 lg:mt-auto">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border-gray py-5 text-sm">
                <div>
                  <dt className="font-medium uppercase text-stone-gray">
                    {t("skuLabel")}
                  </dt>
                  <dd className="mt-1 font-semibold">{product.sku}</dd>
                </div>
                <div>
                  <dt className="font-medium uppercase text-stone-gray">
                    {t("warrantyLabel")}
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {t("warrantyMonths", {
                      months: product.warranty.durationMonths,
                    })}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-premium-red px-3 text-xs font-semibold uppercase text-white transition-colors hover:bg-warm-red sm:px-5 sm:text-sm"
                  onClick={openPublicQuickChat}
                  type="button"
                >
                  <PhoneCall className="size-4 shrink-0" />
                  {t("bookInstallationCta")}
                </button>
                <Link
                  className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border-gray px-3 text-xs font-semibold uppercase transition-colors hover:border-premium-red hover:text-premium-red sm:px-5 sm:text-sm"
                  href={APP_ROUTES.dealers}
                >
                  <MapPin className="size-4 shrink-0" />
                  {t("dealerNetworkCta")}
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {product.description && (
        <section className="bg-surface-muted py-10 sm:py-14">
          <Container className="max-w-350">
            <SectionTitle>{t("introductionTitle")}</SectionTitle>
            <p className="mt-5 text-base leading-8 text-stone-gray">
              {product.description}
            </p>
          </Container>
        </section>
      )}

      {product.specifications.length > 0 && (
        <section className="py-10 sm:py-14">
          <Container className="max-w-350">
            <SectionTitle>{t("specsTitle")}</SectionTitle>
            <div className="mt-6 overflow-hidden rounded-md border border-border-gray">
              <table className="w-full border-collapse text-left text-sm">
                <tbody>
                  {product.specifications.map((specification, index) => (
                    <tr
                      className={
                        index > 0 ? "border-t border-border-gray" : undefined
                      }
                      key={`${specification.key}-${specification.value}`}
                    >
                      <th className="w-2/5 bg-surface-muted px-4 py-3 font-semibold sm:px-6">
                        {specification.key}
                      </th>
                      <td className="px-4 py-3 text-stone-gray sm:px-6">
                        {specification.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      )}

      {(product.features.length > 0 || product.applications.length > 0) && (
        <section className="bg-surface-muted py-10 sm:py-14">
          <Container className="grid max-w-350 gap-10 md:grid-cols-2">
            {product.features.length > 0 && (
              <DetailList items={product.features} title={t("featuresTitle")} />
            )}
            {product.applications.length > 0 && (
              <DetailList
                items={product.applications}
                title={t("applicationsTitle")}
              />
            )}
          </Container>
        </section>
      )}

      {(product.galleryImages.length > 0 || product.coverImage) && (
        <section className="py-10 sm:py-14">
          <Container className="max-w-350">
            <SectionTitle>{t("galleryTitle")}</SectionTitle>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ...(product.coverImage ? [product.coverImage] : []),
                ...product.galleryImages,
              ].map((image) => (
                <div
                  className="relative aspect-[4/3] overflow-hidden rounded-md border border-border-gray bg-surface-muted"
                  key={image.id}
                >
                  <Image
                    alt={image.altText ?? product.name}
                    className="object-contain"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={image.url}
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-10 sm:py-14">
        <Container className="flex max-w-350 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-6 shrink-0 text-premium-red" />
            <div>
              <h2 className="text-base font-semibold uppercase text-premium-red">
                {t("warrantyLabel")}
              </h2>
              <p className="mt-1 text-base text-stone-gray">
                {product.warranty.terms ??
                  t("warrantyMonths", {
                    months: product.warranty.durationMonths,
                  })}
              </p>
            </div>
          </div>
          <button
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-premium-red px-6 text-sm font-semibold uppercase text-white transition-colors hover:bg-warm-red sm:bg-deep-black sm:hover:bg-premium-red"
            onClick={openPublicQuickChat}
            type="button"
          >
            <PhoneCall className="size-4" />
            {t("consultCta")}
          </button>
        </Container>
      </section>
    </main>
  );
}

function ProductDetailImage({ alt, src }: { alt: string; src: string | null }) {
  const t = useTranslations("ProductDetailPage");
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border-gray bg-surface-muted">
      {src && !hasError ? (
        <Image
          alt={alt}
          className="object-contain p-4"
          fill
          onError={() => setHasError(true)}
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          src={src}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-stone-gray">
          <ImageOff className="size-10" />
          <span className="text-sm font-medium">{t("noImage")}</span>
        </div>
      )}
    </div>
  );
}

function DetailList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li className="flex gap-3 text-base text-stone-gray" key={item}>
            <Check className="mt-1 size-4 shrink-0 text-premium-red" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-xl font-semibold uppercase text-premium-red sm:text-2xl">
      {children}
    </h2>
  );
}

function ProductDetailSkeleton() {
  return (
    <main className="min-h-screen bg-white py-12">
      <Container className="grid max-w-350 gap-8 lg:grid-cols-2 lg:items-center">
        <Skeleton className="aspect-[4/3] w-full rounded-md" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </Container>
    </main>
  );
}
