"use client";

import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductResponse } from "@repo/shared";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { RichTextEditor } from "@/src/components/common/rich-text-editor";
import { ImageUpload } from "@/src/components/common/image-upload";
import { PRODUCT_CATEGORIES } from "../products.constants";
import { useProductForm } from "../hooks/use-product-form";
import { ProductSpecificationsFields } from "./product-specifications-fields";
import { ProductStatusControl } from "./product-status-control";
import { ProductStatusToggle } from "./product-status-toggle";

type ProductFormProps = {
  onCancel: () => void;
  onSaved: (product?: ProductResponse) => void;
  product: ProductResponse | null;
};

export function ProductForm({ onCancel, onSaved, product }: ProductFormProps) {
  const t = useTranslations("Products");
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
  } = useProductForm({ onSaved, product });
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
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="product-category" label={t("legacyCategory")}>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="product-category">
                  <SelectValue />
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
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
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

      <div className="grid gap-5 sm:grid-cols-3">
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
                product?.assets.find((asset) => asset.role === "COVER")?.url ??
                ""
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

      <ProductSpecificationsFields
        disabled={isSubmitting}
        errors={errors}
        fields={specificationFields}
        onAdd={appendSpecification}
        onMove={moveSpecification}
        onRemove={removeSpecification}
        register={register}
      />

      {creating ? (
        <ProductStatusField control={control} disabled={isSubmitting} />
      ) : product ? (
        <ProductStatusToggle product={product} />
      ) : null}

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
          {creating ? t("createSubmit") : t("save")}
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

function formatFieldError(
  message: string | undefined,
  t: (key: string) => string,
) {
  if (!message) return undefined;

  const translationKeys = new Set([
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
    "manufactureYearInteger",
    "manufactureYearRange",
    "modelLength",
    "nameLength",
    "nameRequired",
    "serialNumberLength",
    "warrantyCodeInvalid",
    "warrantyCodeRequired",
    "warrantyTermsLength",
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
