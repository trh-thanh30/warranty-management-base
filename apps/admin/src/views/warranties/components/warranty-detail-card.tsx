"use client";

import { CalendarDays, Package, ShieldCheck, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate, type WarrantyListItem } from "@repo/shared";
import { Skeleton } from "@repo/ui";
import {
  formatWarrantyMoneyLimit,
  formatWarrantyOwner,
  formatWarrantyUser,
  getWarrantyProductDisplayName,
} from "../warranties.utils";
import { WarrantyStatusBadge } from "./warranty-status-badge";

type WarrantyDetailCardProps = {
  warranty: WarrantyListItem;
};

export function WarrantyDetailCard({ warranty }: WarrantyDetailCardProps) {
  const t = useTranslations("Warranties");
  const locale = useLocale();
  const productDisplayName = getWarrantyProductDisplayName(warranty);
  const coverageItems = useMemo(
    () => [
      {
        label: t("coverageLimitAmount"),
        value: formatWarrantyMoneyLimit(
          warranty.coverageLimitAmount,
          locale,
          t("unlimited"),
        ),
      },
      {
        label: t("maxClaimCount"),
        value:
          warranty.maxClaimCount === null
            ? t("unlimited")
            : t("claimCountValue", { count: warranty.maxClaimCount }),
      },
      {
        label: t("maxAmountPerClaim"),
        value: formatWarrantyMoneyLimit(
          warranty.maxAmountPerClaim,
          locale,
          t("unlimited"),
        ),
      },
      {
        label: t("createdAt"),
        value: formatDate(warranty.createdAt, { locale }),
      },
      {
        label: t("activatedBy"),
        value: formatWarrantyUser(
          warranty.activatedByUser,
          warranty.activatedByUserId,
        ),
      },
    ],
    [locale, t, warranty],
  );
  const voidItems =
    warranty.status === "VOIDED"
      ? [
          {
            label: t("voidedAt"),
            value: formatDate(warranty.voidedAt, { locale }),
          },
          {
            label: t("voidedBy"),
            value: formatWarrantyUser(
              warranty.voidedByUser,
              warranty.voidedByUserId,
            ),
          },
          {
            label: t("voidReasonValue"),
            value: warranty.voidReason ?? "-",
          },
        ]
      : [];

  return (
    <div className="space-y-4">
      <WarrantySummaryHeader warranty={warranty} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <DetailSection
          className="self-start"
          icon={<ShieldCheck className="size-4" />}
          title={t("sections.coverage")}
        >
          {coverageItems.map((item) => (
            <DetailRow key={item.label} label={item.label} value={item.value} />
          ))}
        </DetailSection>

        <div className="space-y-4">
          <DetailSection
            icon={<Package className="size-4" />}
            title={t("sections.product")}
          >
            <DetailRow label={t("product")} value={warranty.product.name} />
            <DetailRow
              label={t("productCode")}
              value={warranty.product.productCode}
            />
            <DetailRow
              label={t("serialNumber")}
              value={warranty.product.serialNumber ?? "-"}
            />
            <DetailRow label={t("model")} value={productDisplayName} />
          </DetailSection>

          <DetailSection
            icon={<UserRound className="size-4" />}
            title={t("sections.owner")}
          >
            <DetailRow
              label={t("owner")}
              value={formatWarrantyOwner(warranty)}
            />
            <DetailRow
              label={t("customerCode")}
              value={warranty.owner?.customerCode ?? "-"}
            />
          </DetailSection>

          {warranty.terms ? (
            <DetailSection
              icon={<CalendarDays className="size-4" />}
              title={t("warrantyTerms")}
            >
              <div
                className="prose prose-slate max-w-none py-4 text-sm text-slate-700 dark:prose-invert dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: warranty.terms }}
              />
            </DetailSection>
          ) : null}

          {voidItems.length ? (
            <DetailSection
              icon={<ShieldCheck className="size-4" />}
              title={t("void")}
              tone="rose"
            >
              {voidItems.map((item) => (
                <DetailRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </DetailSection>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function WarrantySummaryHeader({ warranty }: WarrantyDetailCardProps) {
  const locale = useLocale();
  const t = useTranslations("Warranties");

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <ShieldCheck className="size-5" />
          </div>
          <div className="min-w-0 pt-1">
            <h2 className="truncate text-base font-semibold text-slate-950 sm:text-lg dark:text-slate-50">
              {warranty.warrantyCode ?? t("notUpdated")}
            </h2>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {getWarrantyProductDisplayName(warranty)}
            </p>
          </div>
        </div>
        <div className="hidden shrink-0 sm:block">
          <WarrantyStatusBadge status={warranty.status} />
        </div>
      </div>
      <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-sm sm:grid-cols-3 dark:border-slate-800">
        <SummaryMetric
          label={t("duration")}
          value={t("durationValue", { count: warranty.durationMonths })}
        />
        <SummaryMetric
          label={t("startDate")}
          value={formatDate(warranty.startDate, { locale })}
        />
        <SummaryMetric
          label={t("endDate")}
          value={formatDate(warranty.endDate, { locale })}
        />
        <div className="flex items-center gap-2 sm:hidden">
          <span className="text-slate-500 dark:text-slate-400">
            {t("status")}:
          </span>
          <WarrantyStatusBadge status={warranty.status} />
        </div>
      </div>
    </section>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

export function WarrantyDetailSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
      <Skeleton className="h-80 w-full" />
      <div className="space-y-4">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
      <dt className="min-w-0 break-words text-sm text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm font-medium text-slate-950 sm:text-right dark:text-slate-50">
        {value}
      </dd>
    </div>
  );
}

function DetailSection({
  className,
  children,
  icon,
  title,
  tone = "default",
}: {
  className?: string;
  children: ReactNode;
  icon: ReactNode;
  title: string;
  tone?: "default" | "rose";
}) {
  const isRose = tone === "rose";

  return (
    <section
      className={`overflow-hidden rounded-lg border bg-white dark:bg-slate-950 ${className ?? ""} ${
        isRose
          ? "border-rose-200 dark:border-rose-900/70"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <header
        className={`flex items-center gap-2 border-b px-4 py-3 ${
          isRose
            ? "border-rose-200 text-rose-700 dark:border-rose-900/70 dark:text-rose-300"
            : "border-slate-200 text-slate-950 dark:border-slate-800 dark:text-slate-50"
        }`}
      >
        <span
          className={
            isRose
              ? "text-rose-600 dark:text-rose-400"
              : "text-slate-500 dark:text-slate-400"
          }
        >
          {icon}
        </span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </header>
      <dl className="divide-y divide-slate-100 px-4 dark:divide-slate-800">
        {children}
      </dl>
    </section>
  );
}
