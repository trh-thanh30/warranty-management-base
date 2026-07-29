"use client";

import { useToast } from "@/src/hooks/use-toast";
import {
  type AssetResponse,
  assetsService,
  type UploadAssetOptions,
} from "@/src/services/assets/assets.service";
import { Button, cn } from "@repo/ui";
import { Eye, ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";

export type ImageUploadLabels = {
  choose: string;
  closePreview: string;
  clear: string;
  deleteFailed: string;
  deleted: string;
  hint: string;
  invalid: string;
  previewAlt: string;
  previewImage: string;
  removalPending: string;
  replace: string;
  uploadFailed: string;
  uploaded: string;
  uploading: string;
};

type ImageUploadProps = {
  allowClear?: boolean;
  compact?: boolean;
  disabled?: boolean;
  id: string;
  labels?: Partial<ImageUploadLabels>;
  onAssetChange?: (asset: AssetResponse | null) => void;
  onChange: (value: string) => void;
  persistedValue?: string;
  uploadOptions: Omit<UploadAssetOptions, "folder"> & {
    folder: string;
  };
  value: string;
};

export function ImageUpload({
  allowClear = true,
  compact = false,
  disabled,
  id,
  labels,
  onAssetChange,
  onChange,
  persistedValue = "",
  uploadOptions,
  value,
}: ImageUploadProps) {
  const t = useTranslations("Common");
  const toast = useToast();
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const copy: ImageUploadLabels = {
    choose: labels?.choose ?? t("chooseImage"),
    closePreview: labels?.closePreview ?? t("closeImagePreview"),
    clear: labels?.clear ?? t("clearImage"),
    deleteFailed: labels?.deleteFailed ?? t("imageDeleteFailed"),
    deleted: labels?.deleted ?? t("imageDeleted"),
    hint: labels?.hint ?? t("imageUploadHint"),
    invalid: labels?.invalid ?? t("imageUploadInvalid"),
    previewAlt: labels?.previewAlt ?? t("imagePreviewAlt"),
    previewImage: labels?.previewImage ?? t("previewImage"),
    removalPending: labels?.removalPending ?? t("imageRemovalPending"),
    replace: labels?.replace ?? t("replaceImage"),
    uploadFailed: labels?.uploadFailed ?? t("imageUploadFailed"),
    uploaded: labels?.uploaded ?? t("imageUploaded"),
    uploading: labels?.uploading ?? t("uploadingImage"),
  };
  const previewSlides = useMemo(
    () => (value ? [{ src: value, alt: copy.previewAlt }] : []),
    [copy.previewAlt, value],
  );

  async function uploadImage(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(copy.invalid);
      toast.error(copy.invalid);
      return;
    }

    try {
      setError("");
      setUploading(true);
      const previousValue = value;
      const asset = await assetsService.uploadAsset(file, {
        ...uploadOptions,
        type: uploadOptions.type ?? "IMAGE",
      });
      onChange(asset.url);
      onAssetChange?.(asset);
      toast.success(copy.uploaded);

      if (previousValue && previousValue !== persistedValue) {
        try {
          await assetsService.deleteAssetByUrl(previousValue);
        } catch {
          toast.error(copy.deleteFailed);
        }
      }
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : copy.uploadFailed;
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  async function clearImage() {
    if (!value) return;

    if (value === persistedValue) {
      setPreviewOpen(false);
      onChange("");
      onAssetChange?.(null);
      toast.info(copy.removalPending);
      return;
    }

    try {
      setUploading(true);
      await assetsService.deleteAssetByUrl(value);
      setPreviewOpen(false);
      onChange("");
      onAssetChange?.(null);
      toast.success(copy.deleted);
    } catch {
      toast.error(copy.deleteFailed);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-3">
      {value ? (
        <div className="w-full min-w-0 max-w-full overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div
            className={cn(
              "group relative flex items-center justify-center bg-slate-100 p-3 dark:bg-slate-900",
              compact ? "h-36" : "h-52",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={copy.previewAlt}
              className="max-h-full max-w-full rounded object-contain"
              src={value}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/30 group-focus-within:bg-slate-950/30">
              <Button
                aria-label={copy.previewImage}
                className="pointer-events-auto size-11 rounded-full bg-white text-slate-950 opacity-100 shadow-md transition-opacity hover:bg-white focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                onClick={() => setPreviewOpen(true)}
                size="icon"
                title={copy.previewImage}
                type="button"
                variant="outline"
              >
                <Eye aria-hidden="true" className="size-5" />
              </Button>
            </div>
          </div>
          <div className="flex min-w-0 flex-col items-stretch gap-2 border-t border-slate-200 px-3 py-2 dark:border-slate-800">
            <span className="block w-full min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">
              {value}
            </span>
            {allowClear ? (
              <Button
                className="w-full sm:w-auto sm:self-start"
                disabled={disabled || uploading}
                onClick={() => void clearImage()}
                size="sm"
                type="button"
                variant="secondary"
              >
                <X aria-hidden="true" className="size-4" />
                {copy.clear}
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900",
            compact ? "min-h-32 py-4" : "min-h-40 py-6",
          )}
          data-disabled={disabled || uploading}
          htmlFor={id}
        >
          <ImageIcon aria-hidden="true" className="size-6" />
          <span className="font-medium">{copy.choose}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {copy.hint}
          </span>
        </label>
      )}

      <input
        accept="image/*"
        className="sr-only"
        disabled={disabled || uploading}
        id={id}
        onChange={(event) => {
          void uploadImage(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
        type="file"
      />

      {value ? (
        <label
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 underline-offset-4 hover:underline data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 dark:text-slate-300"
          data-disabled={disabled || uploading}
          htmlFor={id}
        >
          {uploading ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <UploadCloud aria-hidden="true" className="size-4" />
          )}
          {copy.replace}
        </label>
      ) : null}

      {uploading && !value ? (
        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          {copy.uploading}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <Lightbox
        carousel={{ finite: true, imageFit: "contain" }}
        close={() => setPreviewOpen(false)}
        controller={{
          closeOnBackdropClick: true,
          disableSwipeNavigation: true,
        }}
        labels={{ Close: copy.closePreview }}
        open={previewOpen && Boolean(value)}
        render={{
          buttonNext: () => null,
          buttonPrev: () => null,
        }}
        slides={previewSlides}
      />
    </div>
  );
}
