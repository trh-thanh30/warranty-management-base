"use client";

import type { ActivationCodeReportStatus } from "@repo/shared";
import { Badge } from "@repo/ui";
import { useTranslations } from "next-intl";

const STATUS_VARIANTS = {
  ACTIVATED: "info",
  AVAILABLE: "success",
  EXPIRED: "destructive",
  PENDING_APPROVAL: "warning",
  REPLACED: "secondary",
  REVOKED: "secondary",
} as const;

export function ProductActivationCodeStatusBadge({
  status,
}: {
  status: ActivationCodeReportStatus;
}) {
  const t = useTranslations("Products.activationCodeStatuses");

  return <Badge variant={STATUS_VARIANTS[status]}>{t(status)}</Badge>;
}
