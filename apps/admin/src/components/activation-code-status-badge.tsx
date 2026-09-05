"use client";

import type { ActivationCodeReportStatus } from "@repo/shared";
import { Badge, type BadgeProps } from "@repo/ui";
import { useTranslations } from "next-intl";

const STATUS_VARIANTS = {
  ACTIVATED: "info",
  AVAILABLE: "success",
  EXPIRED: "destructive",
  PENDING_APPROVAL: "warning",
  REPLACED: "secondary",
  REVOKED: "secondary",
} as const;

export function ActivationCodeStatusBadge({
  className,
  status,
}: {
  className?: BadgeProps["className"];
  status: ActivationCodeReportStatus;
}) {
  const t = useTranslations("ActivationCodeStatuses");

  return (
    <Badge className={className} variant={STATUS_VARIANTS[status]}>
      {t(status)}
    </Badge>
  );
}
