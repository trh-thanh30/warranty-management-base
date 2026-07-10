"use client";

import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryResponse } from "@repo/shared";
import { Button, Input, Label, Switch, Textarea } from "@repo/ui";
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
          <select
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition-colors focus:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-300"
            disabled={!creating}
            id="category-type"
            {...register("type", {
              onChange: () => clearParentOnTypeChange(setValue),
            })}
          >
            {CATEGORY_TYPES.map((categoryType) => (
              <option key={categoryType} value={categoryType}>
                {t(`types.${categoryType}`)}
              </option>
            ))}
          </select>
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
        <Textarea
          id="category-description"
          placeholder={t("descriptionPlaceholder")}
          rows={3}
          {...register("description")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={formatFieldError(errors.icon?.message, t)}
          id="category-icon"
          label={t("icon")}
        >
          <Input
            autoComplete="off"
            id="category-icon"
            placeholder={t("iconPlaceholder")}
            {...register("icon")}
          />
        </Field>

        <Field
          error={formatFieldError(errors.imageUrl?.message, t)}
          id="category-image-url"
          label={t("imageUrl")}
        >
          <Input
            autoComplete="off"
            id="category-image-url"
            placeholder={t("imageUrlPlaceholder")}
            {...register("imageUrl")}
          />
        </Field>
      </div>

      <Field
        error={formatFieldError(errors.metadata?.message, t)}
        id="category-metadata"
        label={t("metadata")}
      >
        <Textarea
          className="font-mono text-xs"
          id="category-metadata"
          placeholder={t("metadataPlaceholder")}
          rows={6}
          {...register("metadata")}
        />
      </Field>

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
    "iconLength",
    "imageUrlLength",
    "nameLength",
    "nameRequired",
    "orderInteger",
    "slugInvalid",
  ]);

  return translationKeys.has(message) ? t(message) : message;
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
