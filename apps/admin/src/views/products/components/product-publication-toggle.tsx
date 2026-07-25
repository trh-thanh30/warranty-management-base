"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { HttpClientError, type ProductResponse } from "@repo/shared";
import { Label, Switch } from "@repo/ui";
import { useToast } from "@/src/hooks/use-toast";
import { useUpdateProductPublication } from "../hooks/use-products";
import { ProductPublicationBadge } from "./product-publication-badge";

export function ProductPublicationToggle({
  product,
}: {
  product: ProductResponse;
}) {
  const t = useTranslations("Products");
  const locale = useLocale();
  const toast = useToast();
  const [isPublished, setIsPublished] = useState(product.isPublished);
  const updatePublication = useUpdateProductPublication(product.id);

  useEffect(() => {
    setIsPublished(product.isPublished);
  }, [product.id, product.isPublished]);

  function changePublication(nextValue: boolean) {
    setIsPublished(nextValue);
    updatePublication.mutate(
      { isPublished: nextValue },
      {
        onError: (error) => {
          setIsPublished(product.isPublished);
          toast.error(
            error instanceof HttpClientError
              ? error.message
              : t("publicationUpdateError"),
          );
        },
        onSuccess: () => {
          toast.success(
            t(nextValue ? "publicationEnabled" : "publicationDisabled"),
          );
        },
      },
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-md border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor="product-publication-toggle">
            {t("websiteVisibility")}
          </Label>
          <ProductPublicationBadge isPublished={isPublished} />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(
            isPublished
              ? "publishedStatusDescription"
              : "hiddenStatusDescription",
          )}
        </p>
        {product.publishedAt ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("publishedAt", {
              date: new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(product.publishedAt)),
            })}
          </p>
        ) : null}
      </div>
      <Switch
        aria-label={t("websiteVisibility")}
        checked={isPublished}
        className="shrink-0"
        disabled={updatePublication.isPending}
        id="product-publication-toggle"
        onCheckedChange={changePublication}
      />
    </section>
  );
}
