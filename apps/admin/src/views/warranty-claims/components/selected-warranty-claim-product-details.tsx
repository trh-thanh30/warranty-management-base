"use client";

import type { CustomerSummary, ProductResponse } from "@repo/shared";
import { Loader2, Package, ShieldCheck, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { formatClaimDate } from "../warranty-claims.utils";

type SelectedWarrantyClaimProductDetailsProps = {
  customer: CustomerSummary | null;
  isCustomerError: boolean;
  isCustomerLoading: boolean;
  product: ProductResponse;
};

export function SelectedWarrantyClaimProductDetails({
  customer,
  isCustomerError,
  isCustomerLoading,
  product,
}: SelectedWarrantyClaimProductDetailsProps) {
  const t = useTranslations("WarrantyClaims");
  const locale = useLocale();
  const warranty = product.warranty;

  return (
    <div aria-live="polite" className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <DetailsTable
          icon={<Package aria-hidden="true" className="size-4" />}
          rows={[
            [t("product"), product.name],
            [t("productCode"), product.productCode],
            [t("serialNumber"), product.serialNumber ?? "-"],
            [t("category"), product.categoryRef.name],
            [
              t("brandModel"),
              [product.brand, product.model].filter(Boolean).join(" / ") || "-",
            ],
            [
              t("modelYear"),
              product.modelYear ? String(product.modelYear) : "-",
            ],
            [t("productStatus"), t(`productStatuses.${product.status}`)],
          ]}
          title={t("productInfo")}
        />

        <DetailsTable
          icon={<ShieldCheck aria-hidden="true" className="size-4" />}
          rows={[
            [t("warrantyCode"), product.warrantyCode ?? "-"],
            [
              t("warrantyStatus"),
              warranty?.status ? t(`warrantyStatuses.${warranty.status}`) : "-",
            ],
            [t("startDate"), formatClaimDate(warranty?.startDate, locale)],
            [t("endDate"), formatClaimDate(warranty?.endDate, locale)],
            [
              t("durationMonths"),
              warranty
                ? t("durationMonthsValue", {
                    count: warranty.durationMonths,
                  })
                : "-",
            ],
            [
              t("coverageLimitAmount"),
              formatMoneyLimit(warranty?.coverageLimitAmount, locale, t),
            ],
            [
              t("maxClaimCount"),
              warranty?.maxClaimCount === null ||
              warranty?.maxClaimCount === undefined
                ? t("unlimited")
                : String(warranty.maxClaimCount),
            ],
            [
              t("maxAmountPerClaim"),
              formatMoneyLimit(warranty?.maxAmountPerClaim, locale, t),
            ],
            [t("terms"), warranty?.terms ?? "-"],
          ]}
          title={t("warrantyInfo")}
        />
      </div>

      {isCustomerLoading ? (
        <div
          className="flex min-h-24 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
          role="status"
        >
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          {t("loadingCustomer")}
        </div>
      ) : isCustomerError ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {t("customerLoadError")}
        </div>
      ) : customer ? (
        <DetailsTable
          icon={<UserRound aria-hidden="true" className="size-4" />}
          rows={[
            [t("customer"), customer.fullName],
            [t("customerCode"), customer.customerCode],
            [t("phone"), customer.phone ?? "-"],
            [t("email"), customer.email ?? "-"],
            [t("address"), customer.address ?? "-"],
            [
              t("purchaseDate"),
              formatClaimDate(product.owner?.purchaseDate, locale),
            ],
            [
              t("activatedAt"),
              formatClaimDate(product.owner?.activatedAt, locale),
            ],
          ]}
          title={t("customerInfo")}
        />
      ) : (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          {t("noOwnerInformation")}
        </div>
      )}
    </div>
  );
}

function DetailsTable({
  icon,
  rows,
  title,
}: {
  icon: ReactNode;
  rows: Array<[string, string]>;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <span className="text-blue-600 dark:text-blue-300">{icon}</span>
        <h4 className="font-semibold text-slate-950 dark:text-slate-50">
          {title}
        </h4>
      </div>
      <table className="w-full table-fixed text-sm">
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th
                className="w-2/5 px-4 py-2.5 text-left align-top font-medium text-slate-500 dark:text-slate-400"
                scope="row"
              >
                {label}
              </th>
              <td className="wrap-break-word px-4 py-2.5 text-slate-950 dark:text-slate-50">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function formatMoneyLimit(
  value: string | null | undefined,
  locale: string,
  translate: (key: string) => string,
) {
  if (!value) return translate("unlimited");

  const amount = Number(value);
  if (!Number.isFinite(amount)) return `${value} VND`;

  return `${new Intl.NumberFormat(locale).format(amount)} VND`;
}
