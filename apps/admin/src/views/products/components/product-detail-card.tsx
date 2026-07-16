"use client";

import type { ReactNode } from "react";
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
import { formatProductCreatedAt, formatProductOwner } from "../products.utils";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <DetailSection title={t("sections.product")}>
          <DetailItem label={t("name")} value={product.name} />
          <DetailItem label={t("productCode")} value={product.productCode} />
          <DetailItem label={t("warrantyCode")} value={product.warrantyCode} />
          <DetailItem
            label={t("serialNumber")}
            value={product.serialNumber ?? "-"}
          />
          <DetailItem
            label={t("dynamicCategory")}
            value={product.categoryRef?.name ?? product.category}
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
          <div className="lg:col-span-2 space-y-3 rounded-md border border-slate-200 p-4 dark:border-slate-800">
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
