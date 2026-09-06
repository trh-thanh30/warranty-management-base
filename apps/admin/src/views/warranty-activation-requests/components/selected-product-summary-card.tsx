import { CheckCircle2, Package } from "lucide-react";
import { useLocale } from "next-intl";
import {
  ActivationRequestSummaryCard,
  SummaryGrid,
  SummaryItem,
} from "./activation-request-summary-card";
import { formatActivationRequestDate } from "../warranty-activation-requests.utils";

type SelectedProductSummaryCardProps = {
  brand: string | null;
  categoryName: string;
  durationMonths?: number | null;
  endDate: string | null;
  model: string | null;
  productCode: string;
  productCodeLabel: string;
  productName: string;
  productStatusLabel: string;
  sku: string;
  skuLabel: string;
  startDate: string | null;
  statusLabel: string;
  summaryLabels: {
    activationStartPending: string;
    brandModel: string;
    category: string;
    durationMonths: string;
    monthUnit: string;
    productStatus: string;
    warrantyPeriod: string;
  };
};

export function SelectedProductSummaryCard({
  brand,
  categoryName,
  durationMonths,
  endDate,
  model,
  productCode,
  productCodeLabel,
  productName,
  productStatusLabel,
  sku,
  skuLabel,
  startDate,
  statusLabel,
  summaryLabels,
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
      meta={`${productCodeLabel}: ${productCode}`}
      title={productName}
    >
      <SummaryGrid>
        <SummaryItem label={skuLabel} value={sku || "-"} />
        <SummaryItem
          label={summaryLabels.brandModel}
          value={[brand, model].filter(Boolean).join(" / ") || "-"}
        />
        <SummaryItem label={summaryLabels.category} value={categoryName} />
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
          label={summaryLabels.productStatus}
          value={productStatusLabel}
        />
      </SummaryGrid>
    </ActivationRequestSummaryCard>
  );
}
