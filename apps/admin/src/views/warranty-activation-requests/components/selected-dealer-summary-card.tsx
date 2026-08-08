import { Building2, CheckCircle2, MapPin, Phone } from "lucide-react";
import type { DealerResponse } from "@repo/shared";
import {
  ActivationRequestSummaryCard,
  SummaryGrid,
  SummaryItem,
} from "./activation-request-summary-card";

type SelectedDealerSummaryCardProps = {
  dealer: DealerResponse;
  labels: {
    address: string;
    district: string;
    phone: string;
    province: string;
    selected: string;
  };
};

export function SelectedDealerSummaryCard({
  dealer,
  labels,
}: SelectedDealerSummaryCardProps) {
  return (
    <ActivationRequestSummaryCard
      badge={
        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          <CheckCircle2 aria-hidden="true" className="size-3.5" />
          {labels.selected}
        </span>
      }
      icon={<Building2 aria-hidden="true" className="size-4" />}
      meta={dealer.province}
      title={dealer.name}
    >
      <SummaryGrid columns="">
        <SummaryItem
          icon={<Phone aria-hidden="true" className="size-3.5" />}
          label={labels.phone}
          value={dealer.phone ?? "-"}
        />
        <SummaryItem
          icon={<MapPin aria-hidden="true" className="size-3.5" />}
          label={labels.address}
          value={dealer.address || "-"}
        />
        <SummaryItem label={labels.province} value={dealer.province || "-"} />
        <SummaryItem label={labels.district} value={dealer.district ?? "-"} />
      </SummaryGrid>
    </ActivationRequestSummaryCard>
  );
}
