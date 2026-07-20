"use client";

import { useState, type ReactNode } from "react";
import { Controller } from "react-hook-form";
import { ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryResponse } from "@repo/shared";
import { Button, Input, Label, Switch } from "@repo/ui";
import { RichTextEditor } from "@/src/components/common/rich-text-editor";
import { SelectControl } from "@/src/components/common/select-control";
import { assetsService } from "@/src/services/assets/assets.service";
import { CATEGORY_TYPES } from "../categories.constants";
import {
  clearParentOnTypeChange,
  useCategoryForm,
} from "../hooks/use-category-form";
import { CategoryParentPicker } from "./category-parent-picker";

type CategoryFormProps = {
  category: CategoryResponse | null;
  onCancel: () => void;
  onSaved: () => void;
};

export function CategoryForm({
  category,
  onCancel,
  onSaved,
}: CategoryFormProps) {
  const t = useTranslations("Categories");
  const {
    control,
    creating,
    errors,
    isSubmitting,
    onSubmit,
    register,
    setValue,
    watch,
  } = useCategoryForm({ category, onSaved });
  const selectedType = watch("type");
  const selectedParentId = watch("parentId");

  return (
    <form className="space-y-6" noValidate onSubmit={onSubmit}>
      {errors.root?.message ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {errors.root.message}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={formatFieldError(errors.type?.message, t)}
          id="category-type"
          label={t("type")}
        >
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <SelectControl
                disabled={!creating}
                id="category-type"
                onValueChange={(value) => {
                  field.onChange(value);
                  clearParentOnTypeChange(setValue);
                }}
                options={CATEGORY_TYPES.map((categoryType) => ({
                  label: t(`types.${categoryType}`),
                  value: categoryType,
                }))}
                value={field.value}
              />
            )}
          />
        </Field>

        <Field
          error={formatFieldError(errors.parentId?.message, t)}
          id="category-parent"
          label={t("parent")}
        >
          <CategoryParentPicker
            currentCategoryId={category?.id}
            onChange={(parentId) =>
              setValue("parentId", parentId, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            type={selectedType}
            value={selectedParentId}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={formatFieldError(errors.name?.message, t)}
          id="category-name"
          label={t("name")}
        >
          <Input
            autoComplete="off"
            id="category-name"
            placeholder={t("namePlaceholder")}
            {...register("name")}
          />
        </Field>

        <Field
          error={formatFieldError(errors.slug?.message, t)}
          id="category-slug"
          label={t("slug")}
        >
          <Input
            autoComplete="off"
            id="category-slug"
            placeholder={t("slugPlaceholder")}
            {...register("slug")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={formatFieldError(errors.code?.message, t)}
          id="category-code"
          label={t("code")}
        >
          <Input
            autoComplete="off"
            id="category-code"
            placeholder={t("codePlaceholder")}
            {...register("code")}
          />
        </Field>

        <Field
          error={formatFieldError(errors.order?.message, t)}
          id="category-order"
          label={t("order")}
        >
          <Input
            id="category-order"
            inputMode="numeric"
            type="number"
            {...register("order")}
          />
        </Field>
      </div>

      <Field
        error={formatFieldError(errors.description?.message, t)}
        id="category-description"
        label={t("descriptionLabel")}
      >
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <RichTextEditor
              disabled={isSubmitting}
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
      </Field>

      <Controller
        control={control}
        name="imageUrl"
        render={({ field }) => (
          <Field
            error={formatFieldError(errors.imageUrl?.message, t)}
            id="category-image-url"
            label={t("imageUrl")}
          >
            <CategoryImageUpload
              disabled={isSubmitting}
              onChange={field.onChange}
              value={field.value}
            />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <div>
              <Label htmlFor="category-is-active">{t("active")}</Label>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("activeDescription")}
              </p>
            </div>
            <Switch
              checked={field.value}
              id="category-is-active"
              onCheckedChange={field.onChange}
            />
          </div>
        )}
      />

      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex sm:justify-end">
        <Button
          className="w-full sm:w-auto"
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="secondary"
        >
          {t("cancel")}
        </Button>
        <Button
          className="w-full sm:w-auto"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {creating ? t("create") : t("save")}
        </Button>
      </div>
    </form>
  );
}

function formatFieldError(
  message: string | undefined,
  t: (key: string) => string,
) {
  if (!message) return undefined;

  const translationKeys = new Set([
    "codeInvalid",
    "descriptionLength",
    "imageUrlLength",
    "nameLength",
    "nameRequired",
    "orderInteger",
    "slugInvalid",
  ]);

  return translationKeys.has(message) ? t(message) : message;
}

function CategoryImageUpload({
  disabled,
  onChange,
  value,
}: {
  disabled?: boolean;
  onChange: (value: string) => void;
  value: string;
}) {
  const t = useTranslations("Categories");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("imageUploadInvalid"));
      return;
    }

    try {
      setError("");
      setUploading(true);
      const asset = await assetsService.uploadAsset(file, {
        accessType: "PUBLIC",
        folder: "categories",
        type: "IMAGE",
      });
      onChange(asset.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : t("imageUploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="flex h-52 items-center justify-center bg-slate-100 p-3 dark:bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={t("imagePreviewAlt")}
              className="max-h-full max-w-full rounded object-contain"
              src={value}
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-3 py-2 dark:border-slate-800">
            <span className="truncate text-xs text-slate-500 dark:text-slate-400">
              {value}
            </span>
            <Button
              disabled={disabled || uploading}
              onClick={() => onChange("")}
              size="sm"
              type="button"
              variant="secondary"
            >
              <X className="size-4" aria-hidden="true" />
              {t("clearImage")}
            </Button>
          </div>
        </div>
      ) : (
        <label
          className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-100 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900"
          data-disabled={disabled || uploading}
          htmlFor="category-image-url"
        >
          <ImageIcon className="size-6" aria-hidden="true" />
          <span className="font-medium">{t("chooseImage")}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t("imageUploadHint")}
          </span>
        </label>
      )}

      <input
        accept="image/*"
        className="sr-only"
        disabled={disabled || uploading}
        id="category-image-url"
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
          htmlFor="category-image-url"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <UploadCloud className="size-4" aria-hidden="true" />
          )}
          {t("replaceImage")}
        </label>
      ) : null}

      {uploading && !value ? (
        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {t("uploadingImage")}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

function Field({
  children,
  error,
  id,
  label,
}: {
  children: ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
