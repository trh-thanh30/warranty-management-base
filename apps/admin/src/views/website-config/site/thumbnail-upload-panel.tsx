"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Lightbox from "yet-another-react-lightbox";
import { Button } from "@repo/ui";
import { ImageUpload } from "@/src/components/common/image-upload";
import { useToast } from "@/src/hooks/use-toast";
import {
  type AssetResponse,
  assetsService,
} from "@/src/services/assets/assets.service";

export function ThumbnailUploadPanel({ disabled }: { disabled: boolean }) {
  const t = useTranslations("WebsiteConfig");
  const commonT = useTranslations("Common");
  const toast = useToast();
  const [items, setItems] = useState<AssetResponse[]>([]);
  const [uploadValue, setUploadValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<AssetResponse | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const result = await assetsService.listThumbnails();
      setItems(result.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(asset: AssetResponse) {
    try {
      setDeletingId(asset.id);
      await assetsService.deleteAsset(asset.id);
      setItems((current) => current.filter((item) => item.id !== asset.id));
      setPreviewAsset((current) => (current?.id === asset.id ? null : current));
      toast.success(t("site.thumbnailDeleted"));
    } catch {
      toast.error(t("site.thumbnailDeleteFailed"));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl space-y-1">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {t("site.thumbnailUploadTitle")}
          </p>
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("site.thumbnailUploadDescription")}
          </p>
        </div>
        <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {t("site.thumbnailCount", { count: items.length })}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
          <ImageUpload
            compact
            disabled={disabled}
            id="website-thumbnail-upload"
            labels={{
              choose: t("site.thumbnailChoose"),
              hint: t("site.thumbnailUploadHint"),
              uploaded: t("site.thumbnailUploaded"),
            }}
            onAssetChange={(asset) => {
              if (!asset) return;
              setItems((current) => [
                asset,
                ...current.filter((item) => item.id !== asset.id),
              ]);
              setUploadValue("");
            }}
            onChange={setUploadValue}
            uploadOptions={{
              accessType: "PUBLIC",
              folder: "website-thumbnails",
              type: "THUMBNAIL",
            }}
            value={uploadValue}
          />
        </div>
        {loading ? (
          <div className="flex min-h-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 sm:col-span-2 lg:col-span-3 xl:col-span-4 dark:border-slate-800 dark:bg-slate-900/40">
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-red-300 px-4 text-center sm:col-span-2 lg:col-span-3 xl:col-span-4 dark:border-red-900">
            <p className="text-sm text-red-600 dark:text-red-400">
              {t("site.thumbnailLoadFailed")}
            </p>
            <Button onClick={() => void load()} type="button" variant="outline">
              <RefreshCw aria-hidden="true" className="size-4" />
              {t("actions.reload")}
            </Button>
          </div>
        ) : items.length > 0 ? (
          items.map((asset) => (
            <div
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
              key={asset.id}
            >
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={asset.original_name}
                  className="size-full object-cover"
                  src={asset.url}
                />
                <div className="absolute right-2 top-2 flex gap-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <Button
                    aria-label={commonT("previewImage")}
                    className="bg-white text-slate-950 shadow-sm hover:bg-slate-100"
                    onClick={() => setPreviewAsset(asset)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Eye aria-hidden="true" className="size-4" />
                  </Button>
                  <Button
                    aria-label={t("site.thumbnailRemove")}
                    className="shadow-sm"
                    disabled={disabled || deletingId === asset.id}
                    onClick={() => void remove(asset)}
                    size="icon"
                    type="button"
                    variant="destructive"
                  >
                    {deletingId === asset.id ? (
                      <Loader2
                        aria-hidden="true"
                        className="size-4 animate-spin"
                      />
                    ) : (
                      <Trash2 aria-hidden="true" className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p
                className="truncate border-t border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400"
                title={asset.original_name}
              >
                {asset.original_name}
              </p>
            </div>
          ))
        ) : null}
      </div>
      <Lightbox
        carousel={{ finite: true, imageFit: "contain" }}
        close={() => setPreviewAsset(null)}
        controller={{
          closeOnBackdropClick: true,
          disableSwipeNavigation: true,
        }}
        labels={{ Close: commonT("closeImagePreview") }}
        open={Boolean(previewAsset)}
        render={{
          buttonNext: () => null,
          buttonPrev: () => null,
        }}
        slides={
          previewAsset
            ? [{ alt: previewAsset.original_name, src: previewAsset.url }]
            : []
        }
      />
    </div>
  );
}
