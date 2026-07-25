"use client";

import { Controller } from "react-hook-form";
import { Layers3, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductResponse, ProductTemplateSummary } from "@repo/shared";
import { Button, Input, Textarea } from "@repo/ui";
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
import { ImageUpload } from "@/src/components/common/image-upload";
import { createFieldErrorFormatter } from "@/src/utils";
import type { ProductImportRowData } from "@/src/services/products/products.types";
import { useProductForm } from "../hooks/use-product-form";
import { ProductSpecificationsFields } from "./product-specifications-fields";
import { ProductPublicationControl } from "./product-publication-control";
import { ProductStatusControl } from "./product-status-control";

type ProductFormProps = {
  onCancel: () => void;
} & (
  | {
      mode?: "default";
      onSaved: (product?: ProductResponse) => void;
      product: ProductResponse | null;
      createMode?: "from-template" | "independent";
      productTemplate?: ProductTemplateSummary | null;
    }
  | {
      initialValues: ProductImportRowData;
      mode: "import-preview";
      onSaved: (data: ProductImportRowData) => void;
      submitLabel: string;
    }
);

export function ProductForm(props: ProductFormProps) {
  const t = useTranslations("Products");
  const importPreview = props.mode === "import-preview";
  const product = importPreview ? null : props.product;
  const {
    categoriesQuery,
    control,
    creating,
    errors,
    isSubmitting,
    onSubmit,
    register,
    appendSpecification,
    moveSpecification,
    removeSpecification,
    selectedTemplateId,
    setValue,
    specificationFields,
  } = useProductForm({
    importPreview: importPreview
      ? { data: props.initialValues, onSaved: props.onSaved }
      : undefined,
    onSaved: importPreview ? () => undefined : props.onSaved,
    product,
    createMode: importPreview ? undefined : props.createMode,
    productTemplate: importPreview ? null : props.productTemplate,
  });
  const categories = categoriesQuery.data?.items ?? [];
  const sharedFieldsDisabled = Boolean(selectedTemplateId) || isSubmitting;
  const selectedTemplate =
    (!importPreview && props.productTemplate) || product?.template;
  const fromTemplateCreation = creating && Boolean(selectedTemplate);

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

      {creating && !importPreview ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="flex gap-3">
            <Layers3
              className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                {t("templateSectionTitle")}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {selectedTemplate
                  ? t("selectedTemplateSummary", {
                      name: selectedTemplate.name,
                    })
                  : t("independentProductDescription")}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {importPreview ? (
          <Field
            error={formatFieldError(errors.productCode?.message, t)}
            id="product-code"
            label={t("productCode")}
          >
            <Input id="product-code" {...register("productCode")} />
          </Field>
        ) : null}
        {!fromTemplateCreation ? (
          <Field
            error={formatFieldError(errors.name?.message, t)}
            id="product-name"
            label={t("name")}
          >
            <Input
              disabled={sharedFieldsDisabled}
              id="product-name"
              placeholder={t("namePlaceholder")}
              {...register("name")}
            />
          </Field>
        ) : null}
        <Field
          error={formatFieldError(errors.slug?.message, t)}
          id="product-slug"
          label={t("slug")}
        >
          <Input
            autoCapitalize="none"
            autoCorrect="off"
            id="product-slug"
            placeholder={t("slugPlaceholder")}
            spellCheck={false}
            {...register("slug")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {!importPreview ? (
          <Field
            error={formatFieldError(errors.serialNumber?.message, t)}
            id="product-serial-number"
            label={t("serialNumber")}
          >
            <Input
              id="product-serial-number"
              placeholder={t("serialNumberPlaceholder")}
              {...register("serialNumber")}
            />
          </Field>
        ) : null}
        {!fromTemplateCreation ? (
          <Field
            error={formatFieldError(errors.categoryId?.message, t)}
            id="product-category-id"
            label={t("dynamicCategory")}
          >
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <ProductCategoryCombobox
                  disabled={categoriesQuery.isLoading || sharedFieldsDisabled}
                  id="product-category-id"
                  onValueChange={field.onChange}
                  options={categories
                    .filter((category) => !importPreview || category.code)
                    .map((category) => ({
                      label: category.name,
                      value: importPreview
                        ? (category.code ?? "")
                        : category.id,
                    }))}
                  placeholder={t("dynamicCategory")}
                  searchPlaceholder={t("search")}
                  value={field.value}
                />
              )}
            />
          </Field>
        ) : null}
      </div>

      {product?.warrantyCode ? (
        <Field id="product-warranty-code-readonly" label={t("warrantyCode")}>
          <Input
            id="product-warranty-code-readonly"
            readOnly
            value={product.warrantyCode}
          />
        </Field>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {!fromTemplateCreation ? (
          <Field
            error={formatFieldError(errors.brand?.message, t)}
            id="product-brand"
            label={t("brand")}
          >
            <Input
              disabled={sharedFieldsDisabled}
              id="product-brand"
              placeholder={t("brandPlaceholder")}
              {...register("brand")}
            />
          </Field>
        ) : null}
        {!fromTemplateCreation ? (
          <Field
            error={formatFieldError(errors.model?.message, t)}
            id="product-model"
            label={t("model")}
          >
            <Input
              disabled={sharedFieldsDisabled}
              id="product-model"
              placeholder={t("modelPlaceholder")}
              {...register("model")}
            />
          </Field>
        ) : null}
        <Field
          error={formatFieldError(errors.installationPosition?.message, t)}
          id="product-installation-position"
          label={t("installationPosition")}
        >
          <Input
            id="product-installation-position"
            placeholder={t("installationPositionPlaceholder")}
            {...register("installationPosition")}
          />
        </Field>
        {!fromTemplateCreation ? (
          <Field
            error={formatFieldError(errors.manufactureYear?.message, t)}
            id="product-manufacture-year"
            label={t("manufactureYear")}
          >
            <Input
              disabled={sharedFieldsDisabled}
              id="product-manufacture-year"
              inputMode="numeric"
              placeholder={t("manufactureYearPlaceholder")}
              type="number"
              {...register("manufactureYear")}
            />
          </Field>
        ) : null}
      </div>

      {importPreview ? (
        <Field
          error={formatFieldError(errors.serialNumber?.message, t)}
          id="product-serial-number"
          label={t("serialNumber")}
        >
          <Input
            id="product-serial-number"
            placeholder={t("serialNumberPlaceholder")}
            {...register("serialNumber")}
          />
        </Field>
      ) : null}

      {importPreview ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="product-cover-image-url" label={t("excel.imageUrl")}>
            <Input
              id="product-cover-image-url"
              {...register("coverImageUrl")}
            />
          </Field>
          <Field
            error={formatFieldError(errors.warrantyDurationMonths?.message, t)}
            id="product-warranty-duration"
            label={t("durationMonths")}
          >
            <Input
              id="product-warranty-duration"
              inputMode="numeric"
              min={1}
              type="number"
              {...register("warrantyDurationMonths")}
            />
          </Field>
        </div>
      ) : !fromTemplateCreation ? (
        <Field
          error={formatFieldError(errors.coverAssetId?.message, t)}
          id="product-cover-image"
          label={t("coverImage")}
        >
          <Controller
            control={control}
            name="coverImageUrl"
            render={({ field }) => (
              <ImageUpload
                disabled={sharedFieldsDisabled}
                id="product-cover-image"
                labels={{
                  hint: t("coverImageHint"),
                  previewAlt: t("coverImageAlt"),
                }}
                onAssetChange={(asset) =>
                  setValue("coverAssetId", asset?.id ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                onChange={field.onChange}
                persistedValue={
                  product?.assets.find((asset) => asset.role === "COVER")
                    ?.url ?? ""
                }
                uploadOptions={{
                  accessType: "PUBLIC",
                  folder: "products",
                }}
                value={field.value}
              />
            )}
          />
        </Field>
      ) : null}

      {!fromTemplateCreation ? (
        <Field
          error={formatFieldError(errors.description?.message, t)}
          id="product-description"
          label={t("descriptionLabel")}
        >
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <RichTextEditor
                disabled={sharedFieldsDisabled}
                onChange={field.onChange}
                value={field.value ?? ""}
              />
            )}
          />
        </Field>
      ) : null}

      {importPreview ? (
        <Field
          error={formatFieldError(errors.warrantyTerms?.message, t)}
          id="product-warranty-terms"
          label={t("warrantyTerms")}
        >
          <Textarea
            id="product-warranty-terms"
            rows={4}
            {...register("warrantyTerms")}
          />
        </Field>
      ) : !fromTemplateCreation ? (
        <ProductSpecificationsFields
          disabled={sharedFieldsDisabled}
          errors={errors}
          fields={specificationFields}
          onAdd={appendSpecification}
          onMove={moveSpecification}
          onRemove={removeSpecification}
          register={register}
        />
      ) : null}

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 dark:border-slate-800">
        <ProductStatusField control={control} disabled={isSubmitting} />
        {!importPreview ? (
          <ProductPublicationField control={control} disabled={isSubmitting} />
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex sm:justify-end">
        <Button
          className="w-full sm:w-auto"
          disabled={isSubmitting}
          onClick={props.onCancel}
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
          {importPreview
            ? props.submitLabel
            : creating
              ? t("createSubmit")
              : t("save")}
        </Button>
      </div>
    </form>
  );
}

function ProductStatusField({
  control,
  disabled,
}: {
  control: ReturnType<typeof useProductForm>["control"];
  disabled: boolean;
}) {
  return (
    <Controller
      control={control}
      name="status"
      render={({ field }) => (
        <ProductStatusControl
          disabled={disabled}
          id="product-status"
          onStatusChange={field.onChange}
          status={field.value}
        />
      )}
    />
  );
}

function ProductPublicationField({
  control,
  disabled,
}: {
  control: ReturnType<typeof useProductForm>["control"];
  disabled: boolean;
}) {
  return (
    <Controller
      control={control}
      name="isPublished"
      render={({ field }) => (
        <ProductPublicationControl
          disabled={disabled}
          id="product-publication"
          isPublished={field.value}
          onPublishedChange={field.onChange}
        />
      )}
    />
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
        <ComboboxInput placeholder={searchPlaceholder} showTrigger={false} />
        <ComboboxList>
          <ComboboxEmpty>{placeholder}</ComboboxEmpty>
          {options.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
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
    "categoryRequired",
    "categoryNotFound",
    "customerNotFound",
    "customerRequired",
    "coverAssetNotFound",
    "descriptionLength",
    "duplicateSerialNumber",
    "duplicateWarrantyCode",
    "durationMonthsInteger",
    "durationMonthsRange",
    "installationPositionLength",
    "manufactureYearInteger",
    "manufactureYearRange",
    "modelLength",
    "nameLength",
    "nameRequired",
    "productCodeLength",
    "serialNumberLength",
    "slugInvalid",
    "slugLength",
    "warrantyCodeInvalid",
    "warrantyCodeRequired",
    "warrantyTermsLength",
  ]),
);
