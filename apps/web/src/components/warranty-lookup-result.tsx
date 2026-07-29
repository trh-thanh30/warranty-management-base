"use client";

import { warrantyLookupEmptyValue } from "@/src/constants/warranty.constants";
import { getPopulatedWarrantyFilmItems } from "@/src/utils/warranty-lookup.utils";
import type { WarrantyLookupResult } from "@repo/shared";
import {
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  Clock3,
  Hash,
  MapPin,
  Package,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type WarrantyLookupResultProps = {
  result: WarrantyLookupResult;
};

type ResultRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
};

function ResultRow({ icon, label, value }: ResultRowProps) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase text-stone-gray sm:min-w-40">
        {icon}
        {label}
      </span>
      <span className="break-words text-sm font-semibold text-deep-black sm:text-right">
        {value || warrantyLookupEmptyValue}
      </span>
    </div>
  );
}

function formatWarrantyDate(
  value: string | null,
  locale: string,
): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function WarrantyLookupResultDetails({
  result,
}: WarrantyLookupResultProps) {
  const locale = useLocale();
  const t = useTranslations("WarrantyLookupResult");
  const { product, warranty } = result;
  const installation = result.installation;
  const productIdentity = [product.brand, product.model]
    .filter(Boolean)
    .join(" / ");
  const warrantyCode = warranty.warrantyCode ?? product.warrantyCode;
  const dealerAddress = installation?.dealer
    ? [
        installation.dealer.address,
        installation.dealer.district,
        installation.dealer.province,
      ]
        .filter(Boolean)
        .join(", ")
    : null;
  const filmItems = getPopulatedWarrantyFilmItems(
    installation?.filmItems ?? null,
  );
  const hasInstallationDetails = Boolean(
    installation?.installedAt ||
    installation?.vehicleModel ||
    installation?.dealer ||
    filmItems.length,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 border-b border-border-gray pb-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase text-premium-red">
            <CheckCircle2 className="size-4" />
            {t(`statuses.${warranty.status}`)}
          </span>
          <h3 className="text-lg font-semibold uppercase text-deep-black sm:text-xl">
            {product.displayName || product.name}
          </h3>
        </div>
        <span className="self-start rounded-md bg-premium-red px-3 py-1.5 text-xs font-semibold uppercase text-white sm:self-center">
          {warrantyCode || warrantyLookupEmptyValue}
        </span>
      </div>

      <div className="divide-y divide-border-gray">
        <ResultRow
          icon={<Package className="size-4" />}
          label={t("product")}
          value={product.name}
        />
        <ResultRow
          icon={<Hash className="size-4" />}
          label={t("productCode")}
          value={product.productCode}
        />
        <ResultRow
          icon={<Tag className="size-4" />}
          label={t("category")}
          value={product.category?.name}
        />
        <ResultRow
          icon={<Tag className="size-4" />}
          label={t("brandModel")}
          value={productIdentity}
        />
        <ResultRow
          icon={<Hash className="size-4" />}
          label={t("serial")}
          value={product.serialNumber}
        />
        <ResultRow
          icon={<ShieldCheck className="size-4" />}
          label={t("warrantyCode")}
          value={warrantyCode}
        />
        <ResultRow
          icon={<Calendar className="size-4" />}
          label={t("startDate")}
          value={formatWarrantyDate(warranty.startDate, locale)}
        />
        <ResultRow
          icon={<Calendar className="size-4" />}
          label={t("endDate")}
          value={formatWarrantyDate(warranty.endDate, locale)}
        />
        <ResultRow
          icon={<Clock3 className="size-4" />}
          label={t("duration")}
          value={t("durationValue", { count: warranty.durationMonths })}
        />
        <ResultRow
          icon={<ShieldCheck className="size-4" />}
          label={t("terms")}
          value={warranty.terms}
        />
      </div>

      {hasInstallationDetails && (
        <div className="border-t border-border-gray pt-4">
          <h4 className="text-sm font-semibold uppercase text-premium-red">
            {t("installation")}
          </h4>
          <div className="mt-2 divide-y divide-border-gray">
            {installation?.installedAt && (
              <ResultRow
                icon={<Calendar className="size-4" />}
                label={t("installedAt")}
                value={formatWarrantyDate(installation.installedAt, locale)}
              />
            )}
            {installation?.vehicleModel && (
              <ResultRow
                icon={<Car className="size-4" />}
                label={t("vehicleModel")}
                value={installation.vehicleModel}
              />
            )}
            {installation?.dealer?.name && (
              <ResultRow
                icon={<Building2 className="size-4" />}
                label={t("dealer")}
                value={installation.dealer.name}
              />
            )}
            {installation?.dealer?.phone && (
              <ResultRow
                icon={<Building2 className="size-4" />}
                label={t("dealerPhone")}
                value={installation.dealer.phone}
              />
            )}
            {dealerAddress && (
              <ResultRow
                icon={<MapPin className="size-4" />}
                label={t("dealerAddress")}
                value={dealerAddress}
              />
            )}
          </div>
        </div>
      )}

      {filmItems.length > 0 && (
        <div className="border-t border-border-gray pt-4">
          <h4 className="text-sm font-semibold uppercase text-premium-red">
            {t("filmPositions")}
          </h4>
          <div className="mt-2 divide-y divide-border-gray">
            {filmItems.map(({ key, value }) => (
              <ResultRow
                key={key}
                icon={<Tag className="size-4" />}
                label={t(`positions.${key}`)}
                value={value}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
