"use client";

import { Controller } from "react-hook-form";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductTemplateSummary } from "@repo/shared";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@repo/ui";
import { FormField as Field } from "@/src/components/common/form-field";
import { ImageUpload } from "@/src/components/common/image-upload";
import { RichTextEditor } from "@/src/components/common/rich-text-editor";
import { PRODUCT_CATEGORIES } from "../../products/products.constants";
import { useProductTemplateForm } from "../hooks/use-product-template-form";

export function ProductTemplateForm({
  onCancel,
  onSaved,
  template,
}: {
  onCancel: () => void;
  onSaved: (template: ProductTemplateSummary) => void;
  template: ProductTemplateSummary | null;
}) {
  const t = useTranslations("ProductTemplates");
  const form = useProductTemplateForm({ onSaved, template });
  const categories = form.categoriesQuery.data?.items ?? [];
  const isSubmitting = form.formState.isSubmitting;

  return (
    <form className="space-y-6" noValidate onSubmit={form.onSubmit}>
      {form.formState.errors.root?.message ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {form.formState.errors.root.message}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          description={t("nameDescription")}
          error={translateError(form.formState.errors.name?.message, t)}
          id="template-name"
          label={t("name")}
        >
          <Input
            id="template-name"
            placeholder={t("namePlaceholder")}
            {...form.register("name")}
          />
        </Field>
        <Field
          error={translateError(form.formState.errors.categoryId?.message, t)}
          id="template-category-id"
          label={t("category")}
        >
          <Controller
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full" id="template-category-id">
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="template-legacy-category" label={t("legacyCategory")}>
          <Controller
            control={form.control}
            name="category"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full" id="template-legacy-category">
                  <SelectValue placeholder={t("legacyCategoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {t(`categories.${category}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field
          error={translateError(form.formState.errors.brand?.message, t)}
          id="template-brand"
          label={t("brand")}
        >
          <Input
            id="template-brand"
            placeholder={t("brandPlaceholder")}
            {...form.register("brand")}
          />
        </Field>
        <Field
          error={translateError(form.formState.errors.model?.message, t)}
          id="template-model"
          label={t("model")}
        >
          <Input
            id="template-model"
            placeholder={t("modelPlaceholder")}
            {...form.register("model")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={translateError(
            form.formState.errors.manufactureYear?.message,
            t,
          )}
          id="template-manufacture-year"
          label={t("manufactureYear")}
        >
          <Input
            id="template-manufacture-year"
            inputMode="numeric"
            placeholder={t("manufactureYearPlaceholder")}
            type="number"
            {...form.register("manufactureYear")}
          />
        </Field>
        <Field
          error={translateError(
            form.formState.errors.defaultWarrantyDurationMonths?.message,
            t,
          )}
          id="template-warranty-duration"
          label={t("defaultWarrantyDuration")}
        >
          <Input
            id="template-warranty-duration"
            inputMode="numeric"
            min={1}
            max={120}
            placeholder={t("defaultWarrantyDurationPlaceholder")}
            type="number"
            {...form.register("defaultWarrantyDurationMonths")}
          />
        </Field>
      </div>

      <Field id="template-cover" label={t("coverImage")}>
        <Controller
          control={form.control}
          name="coverImageUrl"
          render={({ field }) => (
            <ImageUpload
              disabled={isSubmitting}
              id="template-cover"
              labels={{
                hint: t("coverImageHint"),
                previewAlt: t("coverImage"),
              }}
              onAssetChange={(asset) =>
                form.setValue("coverAssetId", asset?.id ?? "", {
                  shouldDirty: true,
                })
              }
              onChange={field.onChange}
              persistedValue={
                template?.assets.find((asset) => asset.role === "COVER")?.url ??
                ""
              }
              uploadOptions={{
                accessType: "PUBLIC",
                folder: "product-templates",
              }}
              value={field.value}
            />
          )}
        />
      </Field>

      <section className="space-y-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-medium">{t("galleryTitle")}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("galleryDescription")}
            </p>
          </div>
          <Button
            onClick={() => form.gallery.append({ assetId: "", url: "" })}
            type="button"
            variant="secondary"
          >
            <ImagePlus className="size-4" />
            {t("addGalleryImage")}
          </Button>
        </div>
        {form.gallery.fields.length === 0 ? (
          <p className="rounded-md border border-dashed p-5 text-center text-sm text-slate-500">
            {t("noGalleryImages")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {form.gallery.fields.map((galleryField, index) => (
              <div className="space-y-2" key={galleryField.id}>
                <Controller
                  control={form.control}
                  name={`galleryImages.${index}.url`}
                  render={({ field }) => (
                    <ImageUpload
                      disabled={isSubmitting}
                      id={`template-gallery-${galleryField.id}`}
                      onAssetChange={(asset) =>
                        form.setValue(
                          `galleryImages.${index}.assetId`,
                          asset?.id ?? "",
                          { shouldDirty: true },
                        )
                      }
                      onChange={field.onChange}
                      persistedValue={galleryField.url}
                      uploadOptions={{
                        accessType: "PUBLIC",
                        folder: "product-templates",
                      }}
                      value={field.value}
                    />
                  )}
                />
                <Button
                  className="w-full"
                  onClick={() => form.gallery.remove(index)}
                  type="button"
                  variant="secondary"
                >
                  <Trash2 className="size-4" />
                  {t("removeGalleryImage")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Field id="template-description" label={t("descriptionLabel")}>
        <Controller
          control={form.control}
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

      <Field id="template-warranty-terms" label={t("defaultWarrantyTerms")}>
        <Textarea
          id="template-warranty-terms"
          placeholder={t("defaultWarrantyTermsPlaceholder")}
          rows={4}
          {...form.register("defaultWarrantyTerms")}
        />
      </Field>

      <section className="space-y-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-medium">{t("specificationsTitle")}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("specificationsDescription")}
            </p>
          </div>
          <Button
            onClick={() => form.specifications.append({ key: "", value: "" })}
            type="button"
            variant="secondary"
          >
            <Plus className="size-4" />
            {t("addSpecification")}
          </Button>
        </div>
        {form.specifications.fields.map((field, index) => (
          <div
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            key={field.id}
          >
            <Input
              aria-label={t("specificationKey")}
              placeholder={t("specificationKeyPlaceholder")}
              {...form.register(`specifications.${index}.key`)}
            />
            <Input
              aria-label={t("specificationValue")}
              placeholder={t("specificationValuePlaceholder")}
              {...form.register(`specifications.${index}.value`)}
            />
            <Button
              aria-label={t("removeSpecification")}
              onClick={() => form.specifications.remove(index)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </section>

      <Controller
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <div>
              <Label htmlFor="template-active">{t("active")}</Label>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("activeDescription")}
              </p>
            </div>
            <Switch
              checked={field.value}
              id="template-active"
              onCheckedChange={field.onChange}
            />
          </div>
        )}
      />

      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-5 sm:flex sm:justify-end dark:border-slate-800">
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="secondary"
        >
          {t("cancel")}
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {form.creating ? t("create") : t("save")}
        </Button>
      </div>
    </form>
  );
}

function translateError(
  message: string | undefined,
  t: (key: string) => string,
) {
  return message ? t(message) : undefined;
}
