"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui";

export function ProductPublicationBadge({
  isPublished,
}: {
  isPublished: boolean;
}) {
  const t = useTranslations("Products.publicationStatuses");

  return (
    <Badge variant={isPublished ? "success" : "secondary"}>
      {t(isPublished ? "PUBLISHED" : "HIDDEN")}
    </Badge>
  );
}
