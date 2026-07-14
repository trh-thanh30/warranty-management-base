"use client";

import { useTranslations } from "next-intl";
import type {
  WarrantyClaimPriority,
  WarrantyClaimStatus,
  WarrantyClaimSummary,
} from "@repo/shared";
import { Badge } from "@repo/ui";
import {
  getClaimSlaLabel,
  getPriorityBadgeVariant,
  getStatusBadgeVariant,
  isClaimOverdue,
} from "../warranty-claims.utils";

export function WarrantyClaimStatusBadge({
  status,
}: {
  status: WarrantyClaimStatus;
}) {
  const t = useTranslations("WarrantyClaims.statuses");

  return <Badge variant={getStatusBadgeVariant(status)}>{t(status)}</Badge>;
}

export function WarrantyClaimPriorityBadge({
  priority,
}: {
  priority: WarrantyClaimPriority;
}) {
  const t = useTranslations("WarrantyClaims.priorities");

  return (
    <Badge variant={getPriorityBadgeVariant(priority)}>{t(priority)}</Badge>
  );
}

export function WarrantyClaimOverdueBadge({
  claim,
}: {
  claim: WarrantyClaimSummary;
}) {
  const t = useTranslations("WarrantyClaims");
  const label = getClaimSlaLabel(claim);

  return (
    <Badge variant={isClaimOverdue(claim) ? "destructive" : "secondary"}>
      {t(`sla.${label}`)}
    </Badge>
  );
}
