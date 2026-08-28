import { Button } from "@repo/ui";
import {
  CheckCircle2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react";
import {
  ActivationRequestSummaryCard,
  SummaryGrid,
  SummaryItem,
} from "./activation-request-summary-card";
import { deduplicateAddressSuffix } from "../../customers/customers.utils";

type SelectedCustomerSummaryCardProps = {
  address: string | null;
  addressError?: string;
  customerCode: string;
  email: string | null;
  fullName: string;
  labels: {
    address: string;
    customerCode: string;
    editAddress: string;
    email: string;
    phone: string;
    selected: string;
  };
  onEditAddress: () => void;
  phone: string | null;
};

export function SelectedCustomerSummaryCard({
  address,
  addressError,
  customerCode,
  email,
  fullName,
  labels,
  onEditAddress,
  phone,
}: SelectedCustomerSummaryCardProps) {
  return (
    <ActivationRequestSummaryCard
      badge={
        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
          <CheckCircle2 aria-hidden="true" className="size-3.5" />
          {labels.selected}
        </span>
      }
      icon={<UserRound aria-hidden="true" className="size-4" />}
      meta={`${labels.customerCode}: ${customerCode}`}
      title={fullName}
    >
      <SummaryGrid columns="">
        <SummaryItem
          icon={<Phone aria-hidden="true" className="size-3.5" />}
          label={labels.phone}
          value={phone ?? "-"}
        />
        <SummaryItem
          icon={<Mail aria-hidden="true" className="size-3.5" />}
          label={labels.email}
          value={email ?? "-"}
        />
        <SummaryItem
          action={
            <Button
              aria-label={labels.editAddress}
              className="-mr-1 size-8 shrink-0 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-50"
              onClick={onEditAddress}
              size="icon"
              title={labels.editAddress}
              type="button"
              variant="ghost"
            >
              <Pencil aria-hidden="true" className="size-3.5" />
            </Button>
          }
          error={addressError}
          icon={<MapPin aria-hidden="true" className="size-3.5" />}
          label={labels.address}
          value={address ? deduplicateAddressSuffix(address) : "-"}
        />
        <SummaryItem label={labels.customerCode} value={customerCode} />
      </SummaryGrid>
    </ActivationRequestSummaryCard>
  );
}
