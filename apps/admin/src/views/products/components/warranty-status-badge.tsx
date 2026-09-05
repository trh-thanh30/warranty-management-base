"use client";

import { useTranslations } from "next-intl";
import type { WarrantyStatus } from "@repo/shared";
import { Badge } from "@repo/ui";

export function WarrantyStatusBadge({
  status,
}: {
  status: WarrantyStatus | null | undefined;
}) {
  const t = useTranslations("Products.warrantyStatuses");

  if (!status) {
    return <Badge variant="secondary">{t("NOT_ISSUED")}</Badge>;
  }

  return (
    <Badge variant={status === "ACTIVE" ? "success" : "secondary"}>
      {t(status)}
    </Badge>
  );
}
