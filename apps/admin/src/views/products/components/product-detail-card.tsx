"use client";

import { useMemo, useState, type ReactNode } from "react";
import Lightbox from "yet-another-react-lightbox";
import type { ProductResponse } from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui";
import { useTranslations } from "next-intl";
import {
  formatProductCreatedAt,
  formatProductOwner,
  getProductInstallationPosition,
} from "../products.utils";
import { ProductStatusBadge } from "./product-status-badge";
import { WarrantyStatusBadge } from "./warranty-status-badge";

type ProductDetailCardProps = {
  description: string;
  product: ProductResponse;
  title: string;
};

export function ProductDetailCard({
  description,
  product,
  title,
}: ProductDetailCardProps) {
  const t = useTranslations("Products");
  const [previewIndex, setPreviewIndex] = useState(-1);
  const installationPosition = getProductInstallationPosition(product.metadata);
  const slides = useMemo(
    () =>
      product.assets.map((asset) => ({
        src: asset.url,
        alt: asset.altText ?? product.name,
      })),
    [product.assets, product.name],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        {product.assets.length ? (
          <section className="space-y-3 lg:col-span-2">
            <h2 className="font-medium text-slate-950 dark:text-slate-50">
              {t("images")}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {product.assets.map((asset, index) => (
                <button
                  aria-label={t("previewProductImage", {
                    name: asset.altText ?? product.name,
                  })}
                  className="group relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:focus-visible:ring-slate-50"
                  key={asset.id}
                  onClick={() => setPreviewIndex(index)}
                  type="button"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={asset.altText ?? product.name}
                    className="size-full object-cover transition-transform group-hover:scale-[1.02]"
                    src={asset.url}
                  />
                  <span className="absolute bottom-2 left-2 rounded bg-slate-950/80 px-2 py-1 text-xs text-white">
                    {t(`assetRoles.${asset.role}`)}
                  </span>
                </button>
              ))}
            </div>
            <Lightbox
              close={() => setPreviewIndex(-1)}
              index={Math.max(previewIndex, 0)}
              open={previewIndex >= 0}
              slides={slides}
            />
          </section>
        ) : null}

        <DetailSection title={t("sections.product")}>
          <DetailItem label={t("name")} value={product.name} />
          <DetailItem
            label={t("displayName")}
            value={product.displayName ?? "-"}
          />
          <DetailItem label={t("templateSku")} value={product.template.sku} />
          <DetailItem label={t("productCode")} value={product.productCode} />
          <DetailItem label={t("slug")} value={product.slug} />
          <DetailItem
            label={t("warrantyCode")}
            value={product.warrantyCode ?? "-"}
          />
          <DetailItem
            label={t("serialNumber")}
            value={product.serialNumber ?? "-"}
          />
          <DetailItem
            label={t("dynamicCategory")}
            value={product.categoryRef.name}
          />
          {product.categoryId !== product.template.categoryId ? (
            <DetailItem
              label={t("templateCategory")}
              value={product.template.categoryRef?.name ?? "-"}
            />
          ) : null}
          <DetailItem
            label={t("modelYear")}
            value={String(product.modelYear ?? "-")}
          />
          <DetailItem
            label={t("installationPosition")}
            value={installationPosition || "-"}
          />
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t("productStatus")}
            </span>
            <ProductStatusBadge status={product.status} />
          </div>
          <DetailItem
            label={t("createdAt")}
            value={formatProductCreatedAt(product.createdAt)}
          />
        </DetailSection>

        <DetailSection title={t("sections.ownerWarranty")}>
          <DetailItem label={t("owner")} value={formatProductOwner(product)} />
          <DetailItem
            label={t("customerCode")}
            value={product.owner?.customerCode ?? "-"}
          />
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t("warrantyStatus")}
            </span>
            <WarrantyStatusBadge status={product.warranty?.status} />
          </div>
          <DetailItem
            label={t("startDate")}
            value={product.warranty?.startDate ?? "-"}
          />
          <DetailItem
            label={t("endDate")}
            value={product.warranty?.endDate ?? "-"}
          />
          <DetailItem
            label={t("duration")}
            value={
              product.warranty
                ? t("durationValue", {
                    count: product.warranty.durationMonths,
                  })
                : "-"
            }
          />
        </DetailSection>

        {product.description ? (
          <div className="space-y-3 rounded-md border border-slate-200 p-4 lg:col-span-2 dark:border-slate-800">
            <h2 className="font-medium text-slate-950 dark:text-slate-50">
              {t("descriptionLabel")}
            </h2>
            <div
              className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-950 dark:text-slate-50"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ProductDetailSkeleton({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </CardContent>
    </Card>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-3 rounded-md border border-slate-200 p-4 dark:border-slate-800">
      <h2 className="font-medium text-slate-950 dark:text-slate-50">{title}</h2>
      <dl className="space-y-3">{children}</dl>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-950 dark:text-slate-50">
        {value}
      </dd>
    </div>
  );
}
