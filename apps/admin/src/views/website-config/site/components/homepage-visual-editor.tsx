"use client";

import { Puck, type Data } from "@puckeditor/core";
import type { WebsiteLocale } from "@repo/shared";
import { Button } from "@repo/ui";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { ImageUpload } from "@/src/components/common/image-upload";
import { assetsService } from "@/src/services/assets/assets.service";
import { useToast } from "@/src/hooks/use-toast";
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
  onPublish,
  standalone = false,
}: {
  disabled: boolean;
  form: SiteDraft;
  heroImageUrl: string;
  imageUrls: SiteAssetUrls;
  locale: WebsiteLocale;
  onChange: SiteDraftUpdater;
  onAssetsChange: SiteAssetUrlsUpdater;
  onPublish?: () => void | Promise<void>;
  standalone?: boolean;
}) {
  const t = useTranslations("WebsiteConfig.site");
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageSlot, setImageSlot] = useState<
    "brand-story" | "technology-origin" | null
  >(null);
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

  async function replaceImage(file: File | undefined) {
    if (!file || !imageSlot) return;
    try {
      const asset = await assetsService.uploadAsset(file, {
        accessType: "PUBLIC",
        folder: "website-config/homepage",
        type: "IMAGE",
      });
      const slot = imageSlot;
      onChange((current) => ({
        ...current,
        homepage: {
          ...current.homepage,
          ...(slot === "brand-story"
            ? { aboutImageAssetId: asset.id }
            : { sputterChamberImageAssetId: asset.id }),
        },
      }));
      onAssetsChange((current) => ({
        ...current,
        ...(slot === "brand-story"
          ? { brandStoryImageUrl: asset.url }
          : { technologyOriginImageUrl: asset.url }),
      }));
      toast.success(t("homepageEditor.imageReplaced"));
    } catch {
      toast.error(t("homepageEditor.imageReplaceFailed"));
    } finally {
      setImageSlot(null);
    }
  }

  return (
    <section className={standalone ? "min-h-screen" : "space-y-3"}>
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {!standalone ? (
        <div className="flex items-center justify-between gap-3">
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
        </div>
      ) : null}
      {!standalone ? (
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
      ) : null}
      <div
        className={
          standalone
            ? "relative min-h-screen overflow-hidden bg-white"
            : "relative min-h-[720px] overflow-hidden rounded-lg border bg-white"
        }
        onDoubleClick={(event) => {
          const image = (event.target as HTMLElement).closest<HTMLElement>(
            "[data-homepage-image]",
          );
          const slot = image?.dataset.homepageImage;
          if (
            !disabled &&
            (slot === "brand-story" || slot === "technology-origin")
          ) {
            setImageSlot(slot);
          }
        }}
      >
        {imageSlot ? (
          <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-md border bg-white p-2 shadow-lg">
            <span className="text-sm font-medium">
              {imageSlot === "brand-story"
                ? t("homepageEditor.brandStoryImage")
                : t("homepageEditor.technologyOriginImage")}
            </span>
            <Button
              onClick={() => imageInputRef.current?.click()}
              size="sm"
              type="button"
            >
              {t("homepageEditor.replaceImage")}
            </Button>
            <Button
              onClick={() => setImageSlot(null)}
              size="sm"
              type="button"
              variant="outline"
            >
              {t("homepageEditor.cancelImageReplace")}
            </Button>
          </div>
        ) : null}
        <input
          ref={imageInputRef}
          accept="image/*"
          className="hidden"
          onChange={(event) => void replaceImage(event.target.files?.[0])}
          type="file"
        />
        <Puck
          config={config}
          data={data}
          height={standalone ? "calc(100vh - 1rem)" : "720px"}
          iframe={{ enabled: false }}
          onChange={update}
          onPublish={() => void onPublish?.()}
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
