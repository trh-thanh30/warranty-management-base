"use client";

import { useTranslations } from "next-intl";
import type { ProductStatus, WarrantyStatus } from "@repo/shared";
import { Badge, type BadgeProps } from "@repo/ui";

const PRODUCT_STATUS_VARIANTS = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  DELETED: "destructive",
} satisfies Record<ProductStatus, BadgeProps["variant"]>;

const WARRANTY_STATUS_VARIANTS = {
  DRAFT: "secondary",
  ACTIVE: "success",
  EXPIRED: "warning",
  VOIDED: "destructive",
} satisfies Record<WarrantyStatus, BadgeProps["variant"]>;

export function WarrantyClaimProductStatusBadge({
  status,
}: {
  status: ProductStatus | null | undefined;
}) {
  const t = useTranslations("WarrantyClaims.productStatuses");

  if (!status) return <span>-</span>;

  return (
    <Badge
      className="whitespace-nowrap"
      variant={PRODUCT_STATUS_VARIANTS[status]}
    >
      {t(status)}
    </Badge>
  );
}

export function WarrantyClaimWarrantyStatusBadge({
  status,
}: {
  status: WarrantyStatus | null | undefined;
}) {
  const t = useTranslations("WarrantyClaims.warrantyStatuses");

  if (!status) return <span>-</span>;

  return (
    <Badge
      className="whitespace-nowrap"
      variant={WARRANTY_STATUS_VARIANTS[status]}
    >
      {t(status)}
    </Badge>
  );
}
