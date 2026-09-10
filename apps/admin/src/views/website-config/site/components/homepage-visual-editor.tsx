"use client";

import { Puck, type Data } from "@puckeditor/core";
import type { WebsiteLocale } from "@repo/shared";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { SiteDraft, SiteDraftUpdater } from "../website-site-config.types";
import {
  fromHomepagePuckData,
  type HomepagePuckComponents,
  toHomepagePuckData,
} from "./homepage-puck.adapters";
import {
  createHomepagePuckConfig,
  getHomepageEditorPermissions,
} from "./homepage-puck.config";

const sectionKeys = [
  "hero",
  "brandHeritage",
  "coreTech",
  "milestones",
  "pillars",
  "network",
  "testimonials",
  "b2b",
] as const;

const fieldKeys = [
  "eyebrow",
  "title",
  "titlePrefix",
  "titleHighlight",
  "titleSuffix",
  "description",
  "primaryCta",
  "dealerCta",
  "uvPercent",
  "originPercent",
  "warrantyYears",
  "uvLabel",
  "originLabel",
  "warrantyLabel",
  "yearsSuffix",
  "brandLabel",
  "headlineLine1",
  "headlineLine2Prefix",
  "headlineHighlight",
  "headlineLine3",
  "descriptionPrimary",
  "descriptionSecondary",
  "originEyebrow",
  "originTitle",
  "originDescriptionPrimary",
  "originDescriptionSecondary",
  "viewDealersCta",
  "partnerCta",
] as const;

export function HomepageVisualEditor({
  disabled,
  form,
  heroImageUrl,
  locale,
  onChange,
}: {
  disabled: boolean;
  form: SiteDraft;
  heroImageUrl: string;
  locale: WebsiteLocale;
  onChange: SiteDraftUpdater;
}) {
  const t = useTranslations("WebsiteConfig.site");
  const [error, setError] = useState<string | null>(null);
  const copy = form.homepage.content[locale].landing;
  const data = useMemo(() => toHomepagePuckData(copy), [copy]);
  const labels = useMemo(
    () => ({
      align: t("homepageEditor.styles.align"),
      bold: t("homepageEditor.styles.bold"),
      color: t("homepageEditor.styles.color"),
      font: t("homepageEditor.styles.font"),
      italic: t("homepageEditor.styles.italic"),
      sectionFields: Object.fromEntries(
        fieldKeys.map((key) => [key, t(`homepageContent.fields.${key}`)]),
      ),
      sections: Object.fromEntries(
        sectionKeys.map((key) => [key, t(`homepageContent.sections.${key}`)]),
      ) as Record<(typeof sectionKeys)[number], string>,
      size: t("homepageEditor.styles.size"),
    }),
    [t],
  );
  const config = useMemo(
    () => createHomepagePuckConfig({ heroImageUrl, labels }),
    [heroImageUrl, labels],
  );

  function update(next: Data<HomepagePuckComponents>) {
    try {
      const landing = fromHomepagePuckData(next);
      setError(null);
      onChange((current) => ({
        ...current,
        homepage: {
          ...current.homepage,
          content: {
            ...current.homepage.content,
            [locale]: {
              ...current.homepage.content[locale],
              landing,
            },
          },
        },
      }));
    } catch {
      setError(t("homepageEditor.invalidData"));
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-semibold text-slate-950 dark:text-slate-50">
          {t("homepageEditor.title")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {disabled
            ? t("homepageEditor.readOnly")
            : t("homepageEditor.description")}
        </p>
      </div>
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="min-h-[720px] overflow-hidden rounded-lg border bg-white">
        <Puck
          config={config}
          data={data}
          height="720px"
          iframe={{ enabled: false }}
          onChange={update}
          permissions={getHomepageEditorPermissions(disabled)}
          ui={{
            leftSideBarVisible: false,
            previewMode: disabled ? "interactive" : "edit",
            rightSideBarVisible: true,
          }}
          viewports={[
            { label: t("homepageEditor.viewports.desktop"), width: 1440 },
            { label: t("homepageEditor.viewports.tablet"), width: 768 },
            { label: t("homepageEditor.viewports.mobile"), width: 390 },
          ]}
        />
      </div>
    </section>
  );
}
