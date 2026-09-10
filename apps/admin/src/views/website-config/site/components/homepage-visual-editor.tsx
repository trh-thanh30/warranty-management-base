"use client";

import { Puck, type Data } from "@puckeditor/core";
import type { WebsiteLocale } from "@repo/shared";
import { Maximize2, Minimize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ImageUpload } from "@/src/components/common/image-upload";
import type {
  SiteAssetUrls,
  SiteAssetUrlsUpdater,
  SiteDraft,
  SiteDraftUpdater,
} from "../website-site-config.types";
import { toPreviewUrl } from "../homepage-hero-editor";
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
  "brandStory",
  "technologyOrigin",
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
  imageUrls,
  locale,
  onChange,
  onAssetsChange,
}: {
  disabled: boolean;
  form: SiteDraft;
  heroImageUrl: string;
  imageUrls: SiteAssetUrls;
  locale: WebsiteLocale;
  onChange: SiteDraftUpdater;
  onAssetsChange: SiteAssetUrlsUpdater;
}) {
  const t = useTranslations("WebsiteConfig.site");
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    () =>
      createHomepagePuckConfig({
        brandStoryImageUrl: toPreviewUrl(
          imageUrls.brandStoryImageUrl || "/hero/hero_6.jpg",
        ),
        heroImageUrl,
        labels,
        technologyOriginImageUrl: toPreviewUrl(
          imageUrls.technologyOriginImageUrl || "/hero/hero_7.jpg",
        ),
      }),
    [
      heroImageUrl,
      imageUrls.brandStoryImageUrl,
      imageUrls.technologyOriginImageUrl,
      labels,
    ],
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
    <section
      className={
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-background p-4"
          : "space-y-3"
      }
    >
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <div className={isFullscreen ? "sr-only" : undefined}>
          <h3 className="font-semibold text-slate-950 dark:text-slate-50">
            {t("homepageEditor.title")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {disabled
              ? t("homepageEditor.readOnly")
              : t("homepageEditor.description")}
          </p>
        </div>
        <button
          aria-label={
            isFullscreen
              ? t("homepageEditor.closeFullscreen")
              : t("homepageEditor.openFullscreen")
          }
          className="inline-flex shrink-0 items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
          onClick={() => setIsFullscreen((current) => !current)}
          type="button"
        >
          {isFullscreen ? (
            <Minimize2 aria-hidden="true" className="size-4" />
          ) : (
            <Maximize2 aria-hidden="true" className="size-4" />
          )}
          <span className="hidden sm:inline">
            {isFullscreen
              ? t("homepageEditor.closeFullscreen")
              : t("homepageEditor.openFullscreen")}
          </span>
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <HomepageImageField
          disabled={disabled}
          id="homepage-brand-story-image"
          label={t("homepageEditor.brandStoryImage")}
          persistedUrl={imageUrls.brandStoryImageUrl}
          url={imageUrls.brandStoryImageUrl}
          onChange={(assetId, url) => {
            onChange((current) => ({
              ...current,
              homepage: {
                ...current.homepage,
                aboutImageAssetId: assetId,
              },
            }));
            onAssetsChange((current) => ({
              ...current,
              brandStoryImageUrl: url,
            }));
          }}
        />
        <HomepageImageField
          disabled={disabled}
          id="homepage-technology-origin-image"
          label={t("homepageEditor.technologyOriginImage")}
          persistedUrl={imageUrls.technologyOriginImageUrl}
          url={imageUrls.technologyOriginImageUrl}
          onChange={(assetId, url) => {
            onChange((current) => ({
              ...current,
              homepage: {
                ...current.homepage,
                sputterChamberImageAssetId: assetId,
              },
            }));
            onAssetsChange((current) => ({
              ...current,
              technologyOriginImageUrl: url,
            }));
          }}
        />
      </div>
      <div
        className={
          isFullscreen
            ? "relative min-h-0 flex-1 overflow-hidden rounded-lg border bg-white"
            : "min-h-[720px] overflow-hidden rounded-lg border bg-white"
        }
      >
        <Puck
          config={config}
          data={data}
          height={isFullscreen ? "100%" : "720px"}
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

function HomepageImageField({
  disabled,
  id,
  label,
  onChange,
  persistedUrl,
  url,
}: {
  disabled: boolean;
  id: string;
  label: string;
  onChange: (assetId: string | null, url: string) => void;
  persistedUrl: string;
  url: string;
}) {
  return (
    <div className="rounded-md border bg-white p-3">
      <p className="mb-2 text-sm font-medium">{label}</p>
      <ImageUpload
        compact
        disabled={disabled}
        id={id}
        onAssetChange={(asset) => onChange(asset?.id ?? null, asset?.url ?? "")}
        onChange={(value) => {
          if (!value) onChange(null, "");
        }}
        persistedValue={persistedUrl}
        uploadOptions={{
          accessType: "PUBLIC",
          folder: "website-config/homepage",
        }}
        value={url}
      />
    </div>
  );
}
