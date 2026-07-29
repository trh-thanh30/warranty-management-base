"use client";

import { useTranslations } from "next-intl";
import type { WarrantyStatus } from "@repo/shared";
import { Badge } from "@repo/ui";

export function WarrantyStatusBadge({
  status,
}: {
  status: WarrantyStatus | null | undefined;
}) {
  const t = useTranslations("Warranties.statuses");

  if (!status) return <span>-</span>;

  return (
    <Badge
      className="whitespace-nowrap"
      variant={status === "ACTIVE" ? "success" : "secondary"}
    >
      {t(status)}
    </Badge>
  );
}
