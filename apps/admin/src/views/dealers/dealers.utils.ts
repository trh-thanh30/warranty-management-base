import type { DealerStatusFilter } from "./dealers.types";

export function toDealerActiveQuery(
  status: DealerStatusFilter,
): "true" | "false" | "all" {
  if (status === "ACTIVE") return "true";
  if (status === "INACTIVE") return "false";

  return "all";
}
