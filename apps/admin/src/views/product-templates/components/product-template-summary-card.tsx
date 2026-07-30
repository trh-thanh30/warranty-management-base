"use client";

import { Boxes, Images, LibraryBig } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductTemplateSummary } from "@repo/shared";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { stripHtml } from "@/src/utils/rich-text";
import {
  getProductTemplateDetailSections,
  type ProductTemplateDetailSection,
} from "../product-templates.utils";
import { ProductTemplatePublicationBadge } from "./product-template-publication-badge";

type ProductTemplateSummaryCardProps = {
  template: ProductTemplateSummary;
};

const sectionIcons: Record<
  ProductTemplateDetailSection["key"],
  typeof LibraryBig
> = {
  catalog: LibraryBig,
  warrantyAndProducts: Boxes,
};

export function ProductTemplateSummaryCard({
  template,
}: ProductTemplateSummaryCardProps) {
  const t = useTranslations("ProductTemplates");
  const sections = getProductTemplateDetailSections(template);
  const subtitle = [template.brand, template.model].filter(Boolean).join(" / ");

  return (
    <Card>
      <CardHeader className="gap-4 border-b border-slate-200 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <LibraryBig aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="break-words text-xl">
              {template.name}
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle || "-"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Badge variant={template.isActive ? "success" : "secondary"}>
            {template.isActive ? t("active") : t("inactive")}
          </Badge>
          <ProductTemplatePublicationBadge isPublished={template.isPublished} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((section) => {
            const SectionIcon = sectionIcons[section.key];

            return (
              <section
                className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800"
                key={section.key}
              >
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                  <SectionIcon
                    aria-hidden="true"
                    className="size-4 text-slate-500"
                  />
                  <h3 className="font-medium text-slate-950 dark:text-slate-50">
                    {t(`detailSections.${section.key}`)}
                  </h3>
                </div>
                <dl className="divide-y divide-slate-200 px-4 dark:divide-slate-800">
                  {section.items.map((item) => (
                    <DetailRow
                      key={item.key}
                      label={t(item.key)}
                      value={
                        item.key === "defaultWarrantyDuration"
                          ? t("durationValue", {
                              count: Number(item.value),
                            })
                          : item.key === "products"
                            ? t("productCount", {
                                count: Number(item.value),
                              })
                            : item.value
                      }
                    />
                  ))}
                </dl>
              </section>
            );
          })}
        </div>

        {template.description ? (
          <section className="border-t border-slate-200 pt-5 dark:border-slate-800">
            <h3 className="text-sm font-medium text-slate-950 dark:text-slate-50">
              {t("descriptionLabel")}
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
              {stripHtml(template.description)}
            </p>
          </section>
        ) : null}

        {template.assets.length > 0 ? (
          <section className="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Images aria-hidden="true" className="size-4 text-slate-500" />
              <h3 className="text-sm font-medium text-slate-950 dark:text-slate-50">
                {t("galleryTitle")}
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {template.assets.map((asset) => (
                <figure
                  className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800"
                  key={asset.id}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={asset.altText ?? template.name}
                    className="aspect-video w-full object-cover"
                    src={asset.url}
                  />
                  <figcaption className="p-2 text-xs text-slate-500">
                    {t(`assetRoles.${asset.role}`)}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="break-words text-sm font-medium text-slate-950 sm:max-w-[65%] sm:text-right dark:text-slate-50">
        {value}
      </dd>
    </div>
  );
}
