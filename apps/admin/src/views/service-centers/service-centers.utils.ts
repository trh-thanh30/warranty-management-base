import type { ServiceCenterStatusFilter } from "./service-centers.types";

export function toServiceCenterActiveQuery(status: ServiceCenterStatusFilter) {
  if (status === "ACTIVE") return "true";
  if (status === "INACTIVE") return "false";

  return undefined;
}
