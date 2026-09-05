import { CheckCircle2, Package, ShieldCheck } from "lucide-react";
import { useLocale } from "next-intl";
import {
  ActivationRequestSummaryCard,
  SummaryGrid,
  SummaryItem,
} from "./activation-request-summary-card";
import { formatActivationRequestDate } from "../warranty-activation-requests.utils";

type SelectedProductSummaryCardProps = {
  brand: string | null;
  durationMonths?: number | null;
  endDate: string | null;
  model: string | null;
  ownerName?: string | null;
  productCode: string;
  productCodeLabel: string;
  productName: string;
  sku: string;
  skuLabel: string;
  startDate: string | null;
  statusLabel: string;
  summaryLabels: {
    activationStartPending: string;
    brandModel: string;
    currentOwner: string;
    durationMonths: string;
    monthUnit: string;
    warrantyPeriod: string;
  };
  warrantyCode: string | null;
  warrantyCodeLabel: string;
};

export function SelectedProductSummaryCard({
  brand,
  durationMonths,
  endDate,
  model,
  ownerName,
  productCode,
  productCodeLabel,
  productName,
  sku,
  skuLabel,
  startDate,
  statusLabel,
  summaryLabels,
  warrantyCode,
  warrantyCodeLabel,
}: SelectedProductSummaryCardProps) {
  const locale = useLocale();
  const period =
    startDate || endDate
      ? `${formatActivationRequestDate(startDate, locale)} - ${formatActivationRequestDate(endDate, locale)}`
      : durationMonths
        ? `${durationMonths} ${summaryLabels.monthUnit} · ${summaryLabels.activationStartPending}`
        : "-";

  return (
    <ActivationRequestSummaryCard
      badge={
        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 aria-hidden="true" className="size-3.5" />
          {statusLabel}
        </span>
      }
      icon={<Package aria-hidden="true" className="size-4" />}
      meta={`${productCodeLabel}: ${productCode} • ${warrantyCodeLabel}: ${
        warrantyCode ?? "-"
      }`}
      title={productName}
    >
      <SummaryGrid>
        <SummaryItem label={skuLabel} value={sku || "-"} />
        <SummaryItem
          label={summaryLabels.brandModel}
          value={[brand, model].filter(Boolean).join(" / ") || "-"}
        />
        <SummaryItem
          label={summaryLabels.currentOwner}
          value={ownerName ?? "-"}
        />
        <SummaryItem label={summaryLabels.warrantyPeriod} value={period} />
        <SummaryItem
          label={summaryLabels.durationMonths}
          value={
            durationMonths
              ? `${durationMonths} ${summaryLabels.monthUnit}`
              : "-"
          }
        />
        <SummaryItem
          icon={<ShieldCheck aria-hidden="true" className="size-3.5" />}
          label={warrantyCodeLabel}
          value={warrantyCode ?? "-"}
        />
      </SummaryGrid>
    </ActivationRequestSummaryCard>
  );
}
