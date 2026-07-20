import type { WarrantyActivationRequestStatus } from "@repo/shared";
import { Badge } from "@repo/ui";

const STATUS_VARIANTS = {
  ACTIVATED: "success",
  APPROVED: "secondary",
  CANCELLED: "secondary",
  PENDING: "warning",
  REJECTED: "destructive",
} as const satisfies Record<
  WarrantyActivationRequestStatus,
  "destructive" | "secondary" | "success" | "warning"
>;

export function WarrantyActivationRequestStatusBadge({
  label,
  status,
}: {
  label: string;
  status: WarrantyActivationRequestStatus;
}) {
  return <Badge variant={STATUS_VARIANTS[status]}>{label}</Badge>;
}
