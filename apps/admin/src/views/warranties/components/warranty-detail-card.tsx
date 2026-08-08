"use client";

import { CalendarDays, Package, ShieldCheck, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate, type WarrantyListItem } from "@repo/shared";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@repo/ui";
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
        label: t("warrantyCode"),
        value: warranty.warrantyCode ?? "-",
      },
      {
        label: t("status"),
        value: <WarrantyStatusBadge status={warranty.status} />,
      },
      {
        label: t("startDate"),
        value: formatDate(warranty.startDate, { locale }),
      },
      {
        label: t("endDate"),
        value: formatDate(warranty.endDate, { locale }),
      },
      {
        label: t("duration"),
        value: t("durationValue", { count: warranty.durationMonths }),
      },
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
    ],
    [locale, t, warranty],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
      <Card>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-slate-500 dark:text-slate-400" />
            <CardTitle>{t("sections.coverage")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-slate-200 p-0 dark:divide-slate-800">
          {coverageItems.map((item) => (
            <DetailRow key={item.label} label={item.label} value={item.value} />
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-slate-500 dark:text-slate-400" />
              <CardTitle>{t("sections.product")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-slate-200 p-0 dark:divide-slate-800">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-slate-500 dark:text-slate-400" />
              <CardTitle>{t("sections.owner")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-slate-200 p-0 dark:divide-slate-800">
            <DetailRow
              label={t("owner")}
              value={formatWarrantyOwner(warranty)}
            />
            <DetailRow
              label={t("customerCode")}
              value={warranty.owner?.customerCode ?? "-"}
            />
          </CardContent>
        </Card>

        {warranty.terms ? (
          <Card>
            <CardHeader className="border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-slate-500 dark:text-slate-400" />
                <CardTitle>{t("warrantyTerms")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div
                className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: warranty.terms }}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
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
    <div className="grid min-w-0 gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
      <dt className="min-w-0 break-words text-sm text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm font-medium text-slate-950 sm:text-right dark:text-slate-50">
        {value}
      </dd>
    </div>
  );
}
