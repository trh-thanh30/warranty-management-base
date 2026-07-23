"use client";

import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductResponse } from "@repo/shared";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@repo/ui";
import { FormField as Field } from "@/src/components/common/form-field";
import { RichTextEditor } from "@/src/components/common/rich-text-editor";
import { ImageUpload } from "@/src/components/common/image-upload";
import { createFieldErrorFormatter } from "@/src/utils";
import type { ProductImportRowData } from "@/src/services/products/products.types";
import { useProductForm } from "../hooks/use-product-form";
import { ProductSpecificationsFields } from "./product-specifications-fields";
import { ProductStatusControl } from "./product-status-control";
import { ProductStatusToggle } from "./product-status-toggle";

type ProductFormProps = {
  onCancel: () => void;
} & (
  | {
      mode?: "default";
      onSaved: (product?: ProductResponse) => void;
      product: ProductResponse | null;
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
    setValue,
    specificationFields,
  } = useProductForm({
    importPreview: importPreview
      ? { data: props.initialValues, onSaved: props.onSaved }
      : undefined,
    onSaved: importPreview ? () => undefined : props.onSaved,
    product,
  });
  const categories = categoriesQuery.data?.items ?? [];

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
        {importPreview ? (
          <Field
            error={formatFieldError(errors.productCode?.message, t)}
            id="product-code"
            label={t("productCode")}
          >
            <Input id="product-code" {...register("productCode")} />
          </Field>
        ) : null}
        <Field
          error={formatFieldError(errors.name?.message, t)}
          id="product-name"
          label={t("name")}
        >
          <Input
            id="product-name"
            placeholder={t("namePlaceholder")}
            {...register("name")}
          />
        </Field>
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
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={formatFieldError(errors.categoryId?.message, t)}
          id="product-category-id"
          label={t("dynamicCategory")}
        >
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <NullableSelect
                id="product-category-id"
                noneLabel={t("noDynamicCategory")}
                onValueChange={field.onChange}
                value={field.value}
              >
                {categories
                  .filter((category) => !importPreview || category.code)
                  .map((category) => (
                    <SelectItem
                      key={category.id}
                      value={
                        importPreview ? (category.code ?? "") : category.id
                      }
                    >
                      {category.name}
                    </SelectItem>
                  ))}
              </NullableSelect>
            )}
          />
        </Field>
        {product?.warrantyCode ? (
          <Field id="product-warranty-code-readonly" label={t("warrantyCode")}>
            <Input
              id="product-warranty-code-readonly"
              readOnly
              value={product.warrantyCode}
            />
          </Field>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={formatFieldError(errors.brand?.message, t)}
          id="product-brand"
          label={t("brand")}
        >
          <Input
            id="product-brand"
            placeholder={t("brandPlaceholder")}
            {...register("brand")}
          />
        </Field>
        <Field
          error={formatFieldError(errors.model?.message, t)}
          id="product-model"
          label={t("model")}
        >
          <Input
            id="product-model"
            placeholder={t("modelPlaceholder")}
            {...register("model")}
          />
        </Field>
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
        <Field
          error={formatFieldError(errors.manufactureYear?.message, t)}
          id="product-manufacture-year"
          label={t("manufactureYear")}
        >
          <Input
            id="product-manufacture-year"
            inputMode="numeric"
            placeholder={t("manufactureYearPlaceholder")}
            type="number"
            {...register("manufactureYear")}
          />
        </Field>
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
      ) : (
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
                disabled={isSubmitting}
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
      )}

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
              disabled={isSubmitting}
              onChange={field.onChange}
              value={field.value ?? ""}
            />
          )}
        />
      </Field>

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
      ) : (
        <ProductSpecificationsFields
          disabled={isSubmitting}
          errors={errors}
          fields={specificationFields}
          onAdd={appendSpecification}
          onMove={moveSpecification}
          onRemove={removeSpecification}
          register={register}
        />
      )}

      {creating || importPreview ? (
        <ProductStatusField control={control} disabled={isSubmitting} />
      ) : product ? (
        <ProductStatusToggle product={product} />
      ) : null}

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

function NullableSelect({
  children,
  id,
  noneLabel,
  onValueChange,
  value,
}: {
  children: ReactNode;
  id: string;
  noneLabel: string;
  onValueChange: (value: string) => void;
  value?: string;
}) {
  return (
    <Select
      onValueChange={(nextValue) =>
        onValueChange(nextValue === SELECT_EMPTY_VALUE ? "" : nextValue)
      }
      value={value || SELECT_EMPTY_VALUE}
    >
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={SELECT_EMPTY_VALUE}>{noneLabel}</SelectItem>
        {children}
      </SelectContent>
    </Select>
  );
}

const SELECT_EMPTY_VALUE = "__empty__";

const formatFieldError = createFieldErrorFormatter(
  new Set([
    "brandLength",
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
    "warrantyCodeInvalid",
    "warrantyCodeRequired",
    "warrantyTermsLength",
  ]),
);
