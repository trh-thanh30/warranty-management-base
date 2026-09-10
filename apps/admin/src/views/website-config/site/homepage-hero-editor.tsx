"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Monitor,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  UpdateWebsiteSiteSettingBody,
  WebsiteHeroSlide,
} from "@repo/shared";
import { DEFAULT_HOME_HERO_SLIDES } from "@repo/shared/constants";
import { Button, Card, CardContent, Switch } from "@repo/ui";
import { FormSection } from "@/src/components/common/form-section";
import { ImageUpload } from "@/src/components/common/image-upload";

type HeroSlideDraft = UpdateWebsiteSiteSettingBody["heroSlides"][number];
const publicWebUrl = (
  process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:4101"
).replace(/\/$/, "");

export function toPreviewUrl(url: string) {
  return url.startsWith("/") ? `${publicWebUrl}${url}` : url;
}

export function createDefaultHeroSlideDrafts(): HeroSlideDraft[] {
  return DEFAULT_HOME_HERO_SLIDES.map((slide) => ({
    desktopAssetId: null,
    id: slide.id,
    isActive: true,
    key: slide.key,
    mobileAssetId: null,
    sortOrder: slide.sortOrder,
  }));
}

export function HomepageHeroEditor({
  configuredSlides,
  disabled,
  slides,
  onChange,
}: {
  configuredSlides: WebsiteHeroSlide[];
  disabled: boolean;
  slides: HeroSlideDraft[];
  onChange: (slides: HeroSlideDraft[]) => void;
}) {
  const t = useTranslations("WebsiteConfig");
  const fallbackByKey = useMemo(
    () =>
      new Map<string, (typeof DEFAULT_HOME_HERO_SLIDES)[number]>(
        DEFAULT_HOME_HERO_SLIDES.map((slide) => [slide.key, slide]),
      ),
    [],
  );
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const sourceSlides =
      configuredSlides.length > 0
        ? configuredSlides.map((slide) => ({
            id: slide.id,
            key: slide.key,
          }))
        : DEFAULT_HOME_HERO_SLIDES;

    setUrls(
      Object.fromEntries(
        sourceSlides.flatMap((slide) => {
          const configured = configuredSlides.find(
            (item) => item.key === slide.key,
          );
          const fallback = fallbackByKey.get(slide.key);
          return [
            [
              `${slide.id}:desktop`,
              configured?.desktopImage?.url ??
                (fallback ? toPreviewUrl(fallback.desktopUrl) : ""),
            ],
            [
              `${slide.id}:mobile`,
              configured?.mobileImage?.url ??
                (fallback ? toPreviewUrl(fallback.mobileUrl) : ""),
            ],
          ];
        }),
      ),
    );
  }, [configuredSlides, fallbackByKey]);

  const updateSlide = (
    id: string,
    updater: (slide: HeroSlideDraft) => HeroSlideDraft,
  ) =>
    onChange(slides.map((slide) => (slide.id === id ? updater(slide) : slide)));

  const reorderSlide = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const reordered = [...slides];
    const currentSlide = reordered[index];
    const targetSlide = reordered[targetIndex];
    if (!currentSlide || !targetSlide) return;
    reordered[index] = targetSlide;
    reordered[targetIndex] = currentSlide;
    onChange(reordered.map((slide, sortOrder) => ({ ...slide, sortOrder })));
  };

  const removeSlide = (id: string) => {
    setUrls((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([key]) => !key.startsWith(`${id}:`)),
      ),
    );
    onChange(
      slides
        .filter((slide) => slide.id !== id)
        .map((slide, sortOrder) => ({ ...slide, sortOrder })),
    );
  };

  const addSlide = () => {
    const id = crypto.randomUUID();
    onChange([
      ...slides,
      {
        desktopAssetId: null,
        id,
        isActive: true,
        key: `custom-${id}`,
        mobileAssetId: null,
        sortOrder: slides.length,
      },
    ]);
  };

  return (
    <FormSection
      description={t("site.heroDescription")}
      title={t("site.heroTitle")}
    >
      <div className="space-y-4">
        {slides.map((slide, index) => {
          const configured = configuredSlides.find(
            (item) => item.key === slide.key,
          );
          const fallback = fallbackByKey.get(slide.key);

          return (
            <Card className="min-w-0 max-w-full" key={slide.id}>
              <CardContent className="min-w-0 space-y-4 p-4 sm:p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-950 dark:text-slate-50">
                      {t("site.heroSlide", { index: index + 1 })}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {slide.key}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      aria-label={t("site.heroMoveUp", { index: index + 1 })}
                      disabled={disabled || index === 0}
                      onClick={() => reorderSlide(index, -1)}
                      size="icon"
                      title={t("site.heroMoveUp", { index: index + 1 })}
                      type="button"
                      variant="ghost"
                    >
                      <ArrowUp aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      aria-label={t("site.heroMoveDown", {
                        index: index + 1,
                      })}
                      disabled={disabled || index === slides.length - 1}
                      onClick={() => reorderSlide(index, 1)}
                      size="icon"
                      title={t("site.heroMoveDown", { index: index + 1 })}
                      type="button"
                      variant="ghost"
                    >
                      <ArrowDown aria-hidden="true" className="size-4" />
                    </Button>
                    {!fallback ? (
                      <Button
                        aria-label={t("site.heroRemove", {
                          index: index + 1,
                        })}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                        disabled={disabled}
                        onClick={() => removeSlide(slide.id)}
                        size="icon"
                        title={t("site.heroRemove", { index: index + 1 })}
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="col-span-2 flex w-full items-center justify-between gap-2 border-t border-slate-100 pt-2 sm:col-span-1 sm:w-auto sm:justify-start sm:border-0 sm:pt-0 dark:border-slate-800">
                    <span className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {t("site.active")}
                    </span>
                    <Switch
                      aria-label={t("site.heroSlideActive", {
                        index: index + 1,
                      })}
                      checked={slide.isActive}
                      disabled={disabled}
                      onCheckedChange={(isActive) =>
                        updateSlide(slide.id, (current) => ({
                          ...current,
                          isActive,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
                  <HeroImageField
                    assetId={slide.desktopAssetId}
                    disabled={disabled}
                    fallbackUrl={
                      fallback ? toPreviewUrl(fallback.desktopUrl) : ""
                    }
                    icon={Monitor}
                    id={`website-hero-${slide.id}-desktop`}
                    label={t("site.heroDesktop")}
                    onChange={(assetId, url) => {
                      setUrls((current) => ({
                        ...current,
                        [`${slide.id}:desktop`]:
                          url ||
                          (fallback ? toPreviewUrl(fallback.desktopUrl) : ""),
                      }));
                      updateSlide(slide.id, (current) => ({
                        ...current,
                        desktopAssetId: assetId,
                      }));
                    }}
                    persistedUrl={
                      configured?.desktopImage?.url ??
                      (fallback ? toPreviewUrl(fallback.desktopUrl) : "")
                    }
                    url={urls[`${slide.id}:desktop`] ?? ""}
                  />
                  <HeroImageField
                    assetId={slide.mobileAssetId}
                    disabled={disabled}
                    fallbackUrl={
                      fallback ? toPreviewUrl(fallback.mobileUrl) : ""
                    }
                    icon={Smartphone}
                    id={`website-hero-${slide.id}-mobile`}
                    label={t("site.heroMobile")}
                    onChange={(assetId, url) => {
                      setUrls((current) => ({
                        ...current,
                        [`${slide.id}:mobile`]:
                          url ||
                          (fallback ? toPreviewUrl(fallback.mobileUrl) : ""),
                      }));
                      updateSlide(slide.id, (current) => ({
                        ...current,
                        mobileAssetId: assetId,
                      }));
                    }}
                    persistedUrl={
                      configured?.mobileImage?.url ??
                      (fallback ? toPreviewUrl(fallback.mobileUrl) : "")
                    }
                    url={urls[`${slide.id}:mobile`] ?? ""}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
        <Button
          className="w-full sm:w-auto"
          disabled={disabled}
          onClick={addSlide}
          type="button"
          variant="outline"
        >
          <Plus aria-hidden="true" className="size-4" />
          {t("site.heroAdd")}
        </Button>
      </div>
    </FormSection>
  );
}

function HeroImageField({
  assetId,
  disabled,
  fallbackUrl,
  icon: Icon,
  id,
  label,
  onChange,
  persistedUrl,
  url,
}: {
  assetId: string | null;
  disabled: boolean;
  fallbackUrl: string;
  icon: typeof Monitor;
  id: string;
  label: string;
  onChange: (assetId: string | null, url: string) => void;
  persistedUrl: string;
  url: string;
}) {
  const t = useTranslations("WebsiteConfig");

  return (
    <div className="min-w-0 max-w-full space-y-3 rounded-md border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/30">
      <div className="grid gap-1 sm:flex sm:items-start sm:justify-between sm:gap-2">
        <p className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
          <Icon aria-hidden="true" className="size-4" />
          {label}
        </p>
        {!assetId && fallbackUrl ? (
          <span className="text-xs text-slate-500 sm:text-right dark:text-slate-400">
            {t("site.heroUsingDefault")}
          </span>
        ) : null}
      </div>
      <ImageUpload
        allowClear={Boolean(assetId)}
        compact
        disabled={disabled}
        id={id}
        onAssetChange={(asset) => onChange(asset?.id ?? null, asset?.url ?? "")}
        onChange={(value) => {
          if (!value) onChange(null, "");
        }}
        labels={{ removalPending: t("site.heroRemovalPending") }}
        persistedValue={persistedUrl}
        uploadOptions={{
          accessType: "PUBLIC",
          folder: "website-config/homepage-hero",
        }}
        value={url}
      />
    </div>
  );
}
