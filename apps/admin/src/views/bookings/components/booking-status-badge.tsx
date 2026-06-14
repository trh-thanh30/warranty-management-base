import { Badge } from "@repo/ui";
import type { BookingStatus } from "@repo/shared";
import { useTranslations } from "next-intl";

const statusConfig: Record<
  BookingStatus,
  {
    labelKey: `filters.${BookingStatus}`;
    variant: "secondary" | "success" | "warning" | "destructive";
  }
> = {
  cancelled: { labelKey: "filters.cancelled", variant: "destructive" },
  completed: { labelKey: "filters.completed", variant: "secondary" },
  confirmed: { labelKey: "filters.confirmed", variant: "success" },
  pending: { labelKey: "filters.pending", variant: "warning" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const t = useTranslations("Bookings");
  const config = statusConfig[status];

  if (!config) {
    return <Badge variant="secondary">{status}</Badge>;
  }

  return <Badge variant={config.variant}>{t(config.labelKey)}</Badge>;
}
