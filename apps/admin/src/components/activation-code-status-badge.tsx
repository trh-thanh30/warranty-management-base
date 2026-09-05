"use client";

import type { ActivationCodeReportStatus } from "@repo/shared";
import { Badge, type BadgeProps } from "@repo/ui";
import { useTranslations } from "next-intl";

const STATUS_VARIANTS = {
  ACTIVATED: "success",
  AVAILABLE: "info",
  EXPIRED: "destructive",
  PENDING_APPROVAL: "warning",
  REPLACED: "secondary",
  REVOKED: "secondary",
} as const;

export function ActivationCodeStatusBadge({
  className,
  count,
  status,
}: {
  className?: BadgeProps["className"];
  count?: number;
  status: ActivationCodeReportStatus;
}) {
  const t = useTranslations("ActivationCodeStatuses");

  return (
    <Badge className={className} variant={STATUS_VARIANTS[status]}>
      {t(status)}
      {count !== undefined ? `: ${count}` : null}
    </Badge>
  );
}
