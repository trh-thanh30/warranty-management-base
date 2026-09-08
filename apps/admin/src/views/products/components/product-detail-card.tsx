"use client";

import { ActivationCodeStatusBadge } from "@/src/components/activation-code-status-badge";
import { formatDate, type ProductResponse } from "@repo/shared";
import { Badge, Button, Skeleton } from "@repo/ui";
import {
  CalendarDays,
  CalendarRange,
  Check,
  Clock3,
  Copy,
  Factory,
  Hash,
  KeyRound,
  MapPin,
  Package,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import Lightbox from "yet-another-react-lightbox";
import {
  getProductDisplayName,
  getProductInstallationPosition,
} from "../products.utils";
import { ProductStatusBadge } from "./product-status-badge";

type ProductDetailCardProps = {
  product: ProductResponse;
};

export function ProductDetailCard({ product }: ProductDetailCardProps) {
  const locale = useLocale();
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
  const emptyValue = t("notUpdated");

  return (
    <div className="space-y-4">
      <ProductSummaryHeader product={product} />

      <DetailSection
        icon={<KeyRound className="size-4" />}
        title={t("sections.activationCode")}
      >
        <AssignedActivationCodeDetails product={product} />
      </DetailSection>

      {product.assets.length ? (
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
            {t("images")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {product.assets.map((asset, index) => (
              <button
                aria-label={t("previewProductImage", {
                  name: asset.altText ?? product.name,
                })}
                className="group relative aspect-4/3 overflow-hidden rounded-md border border-slate-200 bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:focus-visible:ring-slate-50"
                key={asset.id}
                onClick={() => setPreviewIndex(index)}
                type="button"
              >
                <Image
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <DetailSection
          icon={<Package className="size-4" />}
          title={t("sections.product")}
        >
          <DetailItem
            label={t("displayName")}
            value={product.displayName || emptyValue}
          />
          <CopyableDetailItem
            icon={<Hash className="size-4" />}
            label={t("productCode")}
            value={product.productCode}
          />
          <DetailItem
            icon={<Factory className="size-4" />}
            label={t("brand")}
            value={product.brand || emptyValue}
          />
          <DetailItem
            icon={<Tag className="size-4" />}
            label={t("model")}
            value={product.model || emptyValue}
          />
          <DetailItem
            icon={<CalendarRange className="size-4" />}
            label={t("modelYear")}
            value={product.modelYear ? String(product.modelYear) : emptyValue}
          />
          <DetailItem
            icon={<MapPin className="size-4" />}
            label={t("installationPosition")}
            value={installationPosition || emptyValue}
          />
          <DetailItem
            icon={<CalendarDays className="size-4" />}
            label={t("createdAt")}
            value={formatDate(product.createdAt, { locale })}
          />
        </DetailSection>

        <DetailSection
          icon={<ShieldCheck className="size-4" />}
          title={t("sections.warrantyPolicy")}
        >
          <p className="border-b border-slate-200 py-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:text-slate-400">
            {t("warrantyPolicyDescription")}
          </p>
          <DetailItem
            icon={<Clock3 className="size-4" />}
            label={t("warrantyPolicyDuration")}
            value={
              product.warrantyDurationMonths
                ? t("durationValue", {
                    count: product.warrantyDurationMonths,
                  })
                : emptyValue
            }
          />
          <DetailItem
            icon={<ShieldCheck className="size-4" />}
            label={t("warrantyTerms")}
            value={product.warrantyTerms || emptyValue}
          />
        </DetailSection>
      </div>

      {product.description ? (
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
            {t("descriptionLabel")}
          </h2>
          <div
            className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section>
      ) : null}
    </div>
  );
}

function AssignedActivationCodeDetails({
  product,
}: {
  product: ProductResponse;
}) {
  const locale = useLocale();
  const t = useTranslations("Products");
  const activationCodes = product.assignedActivationCodes ?? [];

  if (activationCodes.length === 0) {
    return (
      <div className="py-4">
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-sm font-medium text-slate-950 dark:text-slate-50">
            {t("activationCodeUnassigned")}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {t("activationCodeUnassignedDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activationCodes.map((activationCode) => (
        <div
          className="rounded-md border border-slate-200 p-3 dark:border-slate-800"
          key={activationCode.id}
        >
          <div className="flex flex-wrap items-center gap-2">
            <CopyableDetailItem
              icon={<KeyRound className="size-4" />}
              label={t("activationCode")}
              value={activationCode.code}
            />
            <ActivationCodeStatusBadge status={activationCode.status} />
          </div>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <DetailItem
              icon={<Hash className="size-4" />}
              label={t("activationCodeBatch")}
              value={activationCode.batchCode}
            />
            <DetailItem
              icon={<CalendarDays className="size-4" />}
              label={t("activationCodeExpiresAt")}
              value={formatDate(activationCode.expiresAt, { locale })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductSummaryHeader({ product }: { product: ProductResponse }) {
  const t = useTranslations("Products");

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <Package className="size-5" />
        </div>
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-slate-950 sm:text-lg dark:text-slate-50">
              {getProductDisplayName(product)}
            </h2>
            <Badge variant="info">{product.categoryRef.name}</Badge>
          </div>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-slate-500 dark:text-slate-400">
            <span>{product.productCode}</span>
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="sr-only">{t("productStatus")}</span>
        <ProductStatusBadge status={product.status} />
      </div>
    </section>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <Skeleton className="h-112 w-full rounded-lg" />
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    </div>
  );
}

function DetailSection({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <header className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
          {title}
        </h2>
      </header>
      <dl className="divide-y divide-slate-100 px-4 dark:divide-slate-800">
        {children}
      </dl>
    </section>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="grid min-h-11 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 py-2.5 sm:flex sm:justify-between sm:gap-4">
      <dt className="flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-sm text-slate-500 sm:shrink-0 sm:overflow-visible sm:whitespace-normal dark:text-slate-400 [&>svg]:shrink-0">
        {icon}
        <span className="truncate sm:overflow-visible sm:whitespace-normal">
          {label}
        </span>
      </dt>
      <dd
        className="min-w-0 truncate text-right text-sm font-medium text-slate-950 sm:overflow-visible sm:text-clip sm:whitespace-normal sm:wrap-break-word dark:text-slate-50"
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function CopyableDetailItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
}) {
  const t = useTranslations("Products");
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t("copySuccess", { label }));
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t("copyError", { label }));
    }
  }

  return (
    <div className="grid min-h-11 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 py-2.5 sm:flex sm:justify-between sm:gap-4">
      <dt className="flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-sm text-slate-500 sm:shrink-0 sm:overflow-visible sm:whitespace-normal dark:text-slate-400 [&>svg]:shrink-0">
        {icon}
        <span className="truncate sm:overflow-visible sm:whitespace-normal">
          {label}
        </span>
      </dt>
      <dd className="flex min-w-0 items-center justify-end gap-1">
        <span
          className="min-w-0 truncate text-right font-mono text-xs font-medium text-slate-950 sm:overflow-visible sm:text-clip sm:whitespace-normal sm:break-all dark:text-slate-50"
          title={value ?? undefined}
        >
          {value || t("notUpdated")}
        </span>
        {value ? (
          <Button
            aria-label={t("copyValue", { label })}
            className="size-9 shrink-0"
            onClick={() => void copyValue()}
            size="icon"
            title={t("copyValue", { label })}
            type="button"
            variant="ghost"
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        ) : null}
      </dd>
    </div>
  );
}
