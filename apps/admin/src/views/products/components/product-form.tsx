"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/src/components/common";
import { FormField as Field } from "@/src/components/common/form-field";
import { RichTextEditor } from "@/src/components/common/rich-text-editor";
import { createFieldErrorFormatter } from "@/src/utils";
import type { ProductResponse } from "@repo/shared";
import { Button, Input, Textarea } from "@repo/ui";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import { useProductForm } from "../hooks/use-product-form";
import { ProductCatalogueMetadataFields } from "./product-catalogue-metadata-fields";
import { ProductMediaFields } from "./product-media-fields";
import { ProductStatusControl } from "./product-status-control";

export function ProductForm({
  onCancel,
  onSaved,
  product,
  isClone = false,
}: {
  onCancel: () => void;
  onSaved: (product?: ProductResponse) => void;
  product: ProductResponse | null;
  isClone?: boolean;
}) {
  const t = useTranslations("Products");
  const form = useProductForm({ isClone, onSaved, product });
  const categories = form.categoriesQuery.data?.items ?? [];
  const isSubmitting = form.formState.isSubmitting;

  return (
    <form className="min-w-0 space-y-4" noValidate onSubmit={form.onSubmit}>
      {form.formState.errors.root?.message ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {form.formState.errors.root.message}
        </div>
      ) : null}

      <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)]">
        <div className="min-w-0 space-y-4">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              error={formatFieldError(
                form.formState.errors.displayName?.message,
                t,
              )}
              id="product-display-name"
              label={t("displayName")}
            >
              <Input
                id="product-display-name"
                placeholder={t("displayNamePlaceholder")}
                {...form.register("displayName")}
              />
            </Field>
            <Field
              error={formatFieldError(
                form.formState.errors.categoryId?.message,
                t,
              )}
              id="product-category-id"
              label={t("dynamicCategory")}
            >
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <ProductCategoryCombobox
                    disabled={form.categoriesQuery.isLoading || isSubmitting}
                    id="product-category-id"
                    onValueChange={field.onChange}
                    options={categories.map((category) => ({
                      label: category.name,
                      value: category.id,
                    }))}
                    placeholder={t("dynamicCategory")}
                    searchPlaceholder={t("search")}
                    value={field.value}
                  />
                )}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              error={formatFieldError(form.formState.errors.brand?.message, t)}
              id="product-brand"
              label={t("brand")}
            >
              <Input
                id="product-brand"
                placeholder={t("brandPlaceholder")}
                {...form.register("brand")}
              />
            </Field>
            <Field
              description={
                form.creating
                  ? t("productCodeDescription")
                  : t("productCodeEditDescription")
              }
              error={formatFieldError(
                form.formState.errors.productCode?.message,
                t,
              )}
              id="product-code"
              label={t("productCode")}
            >
              <Input
                id="product-code"
                placeholder={
                  form.creating
                    ? t("productCodePlaceholder")
                    : t("productCodeEditPlaceholder")
                }
                {...form.register("productCode")}
              />
            </Field>
          </div>

          <Field
            description={t("warrantyPolicyDescription")}
            error={formatFieldError(
              form.formState.errors.warrantyDurationMonths?.message,
              t,
            )}
            id="product-warranty-duration"
            label={t("durationMonths")}
          >
            <Input
              disabled={isSubmitting}
              id="product-warranty-duration"
              inputMode="numeric"
              min={1}
              placeholder={t("warrantyDurationPlaceholder")}
              step={1}
              type="number"
              {...form.register("warrantyDurationMonths")}
            />
          </Field>

          <div className="grid gap-5">
            <Field
              error={formatFieldError(
                form.formState.errors.installationPosition?.message,
                t,
              )}
              id="product-installation-position"
              label={t("installationPosition")}
            >
              <Input
                id="product-installation-position"
                placeholder={t("installationPositionPlaceholder")}
                {...form.register("installationPosition")}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              error={formatFieldError(form.formState.errors.model?.message, t)}
              id="product-model"
              label={t("model")}
            >
              <Input
                id="product-model"
                placeholder={t("modelPlaceholder")}
                {...form.register("model")}
              />
            </Field>
            <Field
              error={formatFieldError(
                form.formState.errors.modelYear?.message,
                t,
              )}
              id="product-model-year"
              label={t("modelYear")}
            >
              <Input
                placeholder={t("modelYearPlaceholder")}
                id="product-model-year"
                inputMode="numeric"
                min={1900}
                max={2200}
                type="number"
                {...form.register("modelYear")}
              />
            </Field>
          </div>

          <Field
            error={formatFieldError(
              form.formState.errors.shortDescription?.message,
              t,
            )}
            id="product-short-description"
            label={t("shortDescriptionLabel")}
          >
            <Textarea
              id="product-short-description"
              placeholder={t("shortDescriptionPlaceholder")}
              rows={2}
              {...form.register("shortDescription")}
            />
          </Field>

          <Field
            error={formatFieldError(
              form.formState.errors.description?.message,
              t,
            )}
            id="product-description"
            label={t("descriptionLabel")}
          >
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

          <Field
            error={formatFieldError(
              form.formState.errors.warrantyTerms?.message,
              t,
            )}
            id="product-warranty-terms"
            label={t("warrantyTerms")}
          >
            <Textarea
              disabled={isSubmitting}
              id="product-warranty-terms"
              placeholder={t("warrantyTermsPlaceholder")}
              rows={3}
              {...form.register("warrantyTerms")}
            />
          </Field>

          <ProductCatalogueMetadataFields disabled={isSubmitting} form={form} />

          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <ProductStatusControl
                disabled={isSubmitting}
                id="product-status"
                onStatusChange={field.onChange}
                status={field.value}
              />
            )}
          />
        </div>

        <ProductMediaFields
          disabled={isSubmitting}
          form={form}
          product={product}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-5 sm:flex sm:justify-end dark:border-slate-800">
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
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : null}
          {form.creating ? t("createSubmit") : t("save")}
        </Button>
      </div>
    </form>
  );
}

function ProductCategoryCombobox({
  disabled,
  id,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  value,
}: {
  disabled?: boolean;
  id: string;
  onValueChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
  searchPlaceholder: string;
  value?: string;
}) {
  const selectedOption = options.find((option) => option.value === value);
  return (
    <Combobox
      disabled={disabled}
      onValueChange={onValueChange}
      value={value ?? ""}
    >
      <ComboboxTrigger
        id={id}
        placeholder={placeholder}
        selectedLabel={selectedOption?.label ?? value}
      />
      <ComboboxContent>
        <ComboboxInput placeholder={searchPlaceholder} />
        <ComboboxList>
          <ComboboxEmpty>{placeholder}</ComboboxEmpty>
          {options.map((option) => (
            <ComboboxItem
              key={option.value}
              keywords={[option.label]}
              value={option.value}
            >
              {option.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

const formatFieldError = createFieldErrorFormatter(
  new Set([
    "brandLength",
    "catalogueMetadataItemLength",
    "categoryRequired",
    "descriptionLength",
    "displayNameLength",
    "durationMonthsRange",
    "installationPositionLength",
    "modelLength",
    "nameLength",
    "nameRequired",
    "productCodeLength",
    "productCodeRequired",
    "serialNumberLength",
    "specificationKeyLength",
    "specificationValueLength",
    "warrantyTermsLength",
  ]),
);
