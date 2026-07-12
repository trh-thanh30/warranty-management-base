"use client";

import { useTranslations } from "next-intl";
import type { CategoryType } from "@repo/shared";
import { Badge } from "@repo/ui";

type CategoryTypeBadgeProps = {
  type: CategoryType;
};

export function CategoryTypeBadge({ type }: CategoryTypeBadgeProps) {
  const t = useTranslations("Categories.types");

  return <Badge variant="secondary">{t(type)}</Badge>;
}
