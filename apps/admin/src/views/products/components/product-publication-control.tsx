"use client";

import { useTranslations } from "next-intl";
import { Label, Switch } from "@repo/ui";
import { ProductPublicationBadge } from "./product-publication-badge";

type ProductPublicationControlProps = {
  disabled?: boolean;
  id: string;
  isPublished: boolean;
  onPublishedChange: (isPublished: boolean) => void;
};

export function ProductPublicationControl({
  disabled,
  id,
  isPublished,
  onPublishedChange,
}: ProductPublicationControlProps) {
  const t = useTranslations("Products");

  return (
    <div className="flex h-full items-center justify-between gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor={id}>{t("websiteVisibility")}</Label>
          <ProductPublicationBadge isPublished={isPublished} />
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t(
            isPublished
              ? "publishedStatusDescription"
              : "hiddenStatusDescription",
          )}
        </p>
      </div>
      <Switch
        aria-label={t("websiteVisibility")}
        checked={isPublished}
        className="shrink-0"
        disabled={disabled}
        id={id}
        onCheckedChange={onPublishedChange}
      />
    </div>
  );
}
