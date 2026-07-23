import { formatDate } from "@repo/shared";
import type { DealerStatusFilter } from "./dealers.types";

export function formatDealerCreatedAt(createdAt: string) {
  return formatDate(createdAt);
}

export function toDealerActiveQuery(status: DealerStatusFilter) {
  if (status === "ACTIVE") return "true";
  if (status === "INACTIVE") return "false";

  return undefined;
}
