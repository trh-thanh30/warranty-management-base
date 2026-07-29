"use client";

import { useTranslations } from "next-intl";
import type { ProductStatus } from "@repo/shared";
import { Badge } from "@repo/ui";

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const t = useTranslations("Products.statuses");
  const variant =
    status === "ACTIVE"
      ? "success"
      : status === "DELETED"
        ? "destructive"
        : "secondary";

  return <Badge variant={variant}>{t(status)}</Badge>;
}
