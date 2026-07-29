"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui";

export function ServiceCenterStatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("ServiceCenters");

  return (
    <Badge variant={isActive ? "success" : "secondary"}>
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}
