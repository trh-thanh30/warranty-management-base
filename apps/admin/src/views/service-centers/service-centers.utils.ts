import { formatDate } from "@repo/shared";
import type { ServiceCenterStatusFilter } from "./service-centers.types";

export function formatServiceCenterCreatedAt(createdAt: string) {
  return formatDate(createdAt);
}

export function toServiceCenterActiveQuery(status: ServiceCenterStatusFilter) {
  if (status === "ACTIVE") return "true";
  if (status === "INACTIVE") return "false";

  return undefined;
}
