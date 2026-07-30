"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui";

type ProductTemplatePublicationBadgeProps = {
  isPublished: boolean;
};

export function ProductTemplatePublicationBadge({
  isPublished,
}: ProductTemplatePublicationBadgeProps) {
  const t = useTranslations("ProductTemplates");

  return (
    <Badge
      className={
        isPublished
          ? "whitespace-nowrap bg-green-50 text-green-500 dark:bg-green-950 dark:text-green-300"
          : "whitespace-nowrap bg-yellow-50 text-yellow-500 dark:bg-yellow-950 dark:text-yellow-300"
      }
      variant={isPublished ? "success" : "warning"}
    >
      {isPublished ? t("published") : t("hidden")}
    </Badge>
  );
}
