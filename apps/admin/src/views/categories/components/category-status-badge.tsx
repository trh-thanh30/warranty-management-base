"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui";

type CategoryStatusBadgeProps = {
  isActive: boolean;
};

export function CategoryStatusBadge({ isActive }: CategoryStatusBadgeProps) {
  const t = useTranslations("Categories");

  return (
    <Badge variant={isActive ? "success" : "secondary"}>
      {isActive ? t("active") : t("inactive")}
    </Badge>
  );
}
