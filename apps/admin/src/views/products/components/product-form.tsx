"use client";

import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductResponse } from "@repo/shared";
import {
  Button,
  DatePicker,
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
import { RichTextEditor } from "@/src/components/common/rich-text-editor";
import { PRODUCT_CATEGORIES } from "../products.constants";
import { useProductForm } from "../hooks/use-product-form";

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
    customersQuery,
    errors,
    isSubmitting,
    onSubmit,
    register,
    watch,
  } = useProductForm({ onSaved, product });
  const autoGenerateWarrantyCode = watch("autoGenerateWarrantyCode");
  const categories = categoriesQuery.data?.items ?? [];
  const customers = customersQuery.data?.items ?? [];

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

      <div className="grid gap-5 sm:grid-cols-3">
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
        {creating ? <ProductStatusField control={control} t={t} /> : null}
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

      {creating ? (
        <section className="space-y-5 rounded-md border border-slate-200 p-4 dark:border-slate-800">
          <Controller
            control={control}
            name="autoGenerateWarrantyCode"
            render={({ field }) => (
              <div className="flex flex-col gap-3 rounded-md bg-slate-50 p-3 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Label htmlFor="product-auto-warranty">
                    {t("autoGenerateWarrantyCode")}
                  </Label>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {t("autoGenerateWarrantyCodeDescription")}
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  className="shrink-0"
                  id="product-auto-warranty"
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
          {!autoGenerateWarrantyCode ? (
            <Field
              error={formatFieldError(errors.warrantyCode?.message, t)}
              id="product-warranty-code"
              label={t("warrantyCode")}
            >
              <Input
                id="product-warranty-code"
                placeholder={t("warrantyCodePlaceholder")}
                {...register("warrantyCode")}
              />
            </Field>
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="product-customer" label={t("customer")}>
              <Controller
                control={control}
                name="customerId"
                render={({ field }) => (
                  <NullableSelect
                    id="product-customer"
                    noneLabel={t("noOwner")}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.fullName} · {customer.customerCode}
                      </SelectItem>
                    ))}
                  </NullableSelect>
                )}
              />
            </Field>
            <Field
              error={formatFieldError(errors.durationMonths?.message, t)}
              id="product-duration-months"
              label={t("durationMonths")}
            >
              <Input
                id="product-duration-months"
                inputMode="numeric"
                type="number"
                {...register("durationMonths")}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="product-purchase-date" label={t("purchaseDate")}>
              <Controller
                control={control}
                name="purchaseDate"
                render={({ field }) => (
                  <DatePicker
                    ariaLabel={t("purchaseDate")}
                    id="product-purchase-date"
                    onValueChange={field.onChange}
                    placeholder={t("selectPurchaseDate")}
                    value={field.value}
                  />
                )}
              />
            </Field>
            <Field id="product-activated-at" label={t("activatedAt")}>
              <Controller
                control={control}
                name="activatedAt"
                render={({ field }) => (
                  <DatePicker
                    ariaLabel={t("activatedAt")}
                    id="product-activated-at"
                    onValueChange={field.onChange}
                    placeholder={t("selectActivatedAt")}
                    value={field.value}
                  />
                )}
              />
            </Field>
          </div>
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
        </section>
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
  t,
}: {
  control: ReturnType<typeof useProductForm>["control"];
  t: (key: string) => string;
}) {
  return (
    <Field id="product-status" label={t("productStatus")}>
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger id="product-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">{t("statuses.ACTIVE")}</SelectItem>
              <SelectItem value="INACTIVE">{t("statuses.INACTIVE")}</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </Field>
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
