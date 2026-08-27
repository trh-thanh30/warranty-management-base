import type { ServiceCenterStatusFilter } from "./service-centers.types";

export function toServiceCenterActiveQuery(
  status: ServiceCenterStatusFilter,
): "true" | "false" | "all" {
  if (status === "ACTIVE") return "true";
  if (status === "INACTIVE") return "false";

  return "all";
}
