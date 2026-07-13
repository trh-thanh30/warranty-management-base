"use client";

import { useTranslations } from "next-intl";
import type { ProductStatus } from "@repo/shared";
import { Badge } from "@repo/ui";

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const t = useTranslations("Products.statuses");

  return (
    <Badge variant={status === "ACTIVE" ? "success" : "secondary"}>
      {t(status)}
    </Badge>
  );
}
