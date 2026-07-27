"use client";

import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryResponse } from "@repo/shared";
import { Button, Input, Label, Switch } from "@repo/ui";
import { RichTextEditor } from "@/src/components/common/rich-text-editor";
import { ImageUpload } from "@/src/components/common/image-upload";
import { SelectControl } from "@/src/components/common/select-control";
import { FormField as Field } from "@/src/components/common/form-field";
import { createFieldErrorFormatter } from "@/src/utils";
import { MANAGEABLE_CATEGORY_TYPES } from "../categories.constants";
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
                options={getCategoryTypeOptions(category).map(
                  (categoryType) => ({
                    label: t(`types.${categoryType}`),
                    value: categoryType,
                  }),
                )}
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
            <ImageUpload
              disabled={isSubmitting}
              id="category-image-url"
              labels={{
                hint: t("imageUploadHint"),
                previewAlt: t("imagePreviewAlt"),
              }}
              onChange={field.onChange}
              persistedValue={category?.imageUrl ?? ""}
              uploadOptions={{
                accessType: "PUBLIC",
                folder: "categories",
              }}
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

function getCategoryTypeOptions(category: CategoryResponse | null) {
  if (
    category &&
    !MANAGEABLE_CATEGORY_TYPES.some((type) => type === category.type)
  ) {
    return [category.type];
  }

  return MANAGEABLE_CATEGORY_TYPES;
}

const formatFieldError = createFieldErrorFormatter(
  new Set([
    "codeInvalid",
    "descriptionLength",
    "imageUrlLength",
    "nameLength",
    "nameRequired",
    "orderInteger",
    "slugInvalid",
  ]),
);
