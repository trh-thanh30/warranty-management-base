"use client";

import { Controller } from "react-hook-form";
import { Layers3, Loader2, Plus, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductResponse, ProductTemplateSummary } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { Badge, Button, Input } from "@repo/ui";
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
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import { createFieldErrorFormatter } from "@/src/utils";
import { useProductForm } from "../hooks/use-product-form";
import { ProductStatusControl } from "./product-status-control";

export function ProductForm({
  initialTemplate,
  onCancel,
  onSaved,
  product,
}: {
  initialTemplate?: ProductTemplateSummary | null;
  onCancel: () => void;
  onSaved: (product?: ProductResponse) => void;
  product: ProductResponse | null;
}) {
  const t = useTranslations("Products");
  const { hasPermission } = usePermissions();
  const form = useProductForm({
    initialTemplate,
    onSaved,
    product,
  });
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

      <section className="space-y-4 rounded-lg border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <div className="flex gap-3">
          <Layers3
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
          />
          <div>
            <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
              {t("templateSectionTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {t("templateRequiredDescription")}
            </p>
          </div>
        </div>

        <Field
          error={formatFieldError(form.formState.errors.templateId?.message, t)}
          id="product-template"
          label={t("productTemplate")}
        >
          {form.creating ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <Controller
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <ProductTemplateCombobox
                      disabled={form.templatesQuery.isLoading || isSubmitting}
                      id="product-template"
                      onValueChange={field.onChange}
                      options={form.templates}
                      placeholder={t("selectTemplate")}
                      searchPlaceholder={t("searchTemplate")}
                      value={field.value}
                    />
                  )}
                />
              </div>
              {hasPermission(PERMISSIONS.PRODUCT_TEMPLATE_CREATE) ? (
                <Button asChild className="shrink-0" variant="secondary">
                  <Link href="/product-templates/create">
                    <Plus aria-hidden="true" className="size-4" />
                    {t("createProductTemplate")}
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : (
            <Input
              id="product-template"
              readOnly
              value={
                form.selectedTemplate
                  ? `${form.selectedTemplate.name} · ${form.selectedTemplate.sku}`
                  : "-"
              }
            />
          )}
        </Field>

        {form.selectedTemplate ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <TemplateDetail
              label={t("templateSku")}
              value={form.selectedTemplate.sku}
            />
            <TemplateDetail
              label={t("brand")}
              value={form.selectedTemplate.brand ?? "-"}
            />
            <TemplateDetail
              label={t("model")}
              value={form.selectedTemplate.model ?? "-"}
            />
            <TemplateDetail
              label={t("modelYear")}
              value={String(form.selectedTemplate.modelYear ?? "-")}
            />
          </dl>
        ) : null}
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          description={t("displayNameDescription")}
          error={formatFieldError(
            form.formState.errors.displayName?.message,
            t,
          )}
          id="product-display-name"
          label={t("displayName")}
        >
          <Input
            id="product-display-name"
            placeholder={
              form.selectedTemplate?.name ?? t("displayNamePlaceholder")
            }
            {...form.register("displayName")}
          />
        </Field>
        <Field
          error={formatFieldError(
            form.formState.errors.serialNumber?.message,
            t,
          )}
          id="product-serial-number"
          label={t("serialNumber")}
        >
          <Input
            id="product-serial-number"
            placeholder={t("serialNumberPlaceholder")}
            {...form.register("serialNumber")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          description={t("categoryOverrideDescription")}
          error={formatFieldError(form.formState.errors.categoryId?.message, t)}
          id="product-category-id"
          label={t("dynamicCategory")}
        >
          <div className="space-y-2">
            <Controller
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <ProductCategoryCombobox
                  disabled={
                    !form.selectedTemplate ||
                    form.categoriesQuery.isLoading ||
                    isSubmitting
                  }
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
            {form.selectedTemplate ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge
                  variant={form.isCategoryOverridden ? "warning" : "secondary"}
                >
                  {form.isCategoryOverridden
                    ? t("categoryOverridden")
                    : t("categoryFromTemplate")}
                </Badge>
                {form.isCategoryOverridden ? (
                  <Button
                    onClick={form.restoreTemplateCategory}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <RotateCcw aria-hidden="true" className="size-4" />
                    {t("restoreTemplateCategory")}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </Field>
        <Field
          description={form.creating ? t("productCodeDescription") : undefined}
          error={formatFieldError(
            form.formState.errors.productCode?.message,
            t,
          )}
          id="product-code"
          label={t("productCode")}
        >
          <Input
            id="product-code"
            placeholder={t("productCodePlaceholder")}
            readOnly={!form.creating}
            {...form.register("productCode")}
          />
        </Field>
      </div>

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

      {product ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            description={
              product.warrantyCodeEditLockedReason === "WARRANTY_NOT_DRAFT"
                ? t("warrantyCodeNotDraftDescription")
                : product.warrantyCodeEditLockedReason ===
                    "OPEN_ACTIVATION_REQUEST"
                  ? t("warrantyCodeOpenRequestDescription")
                  : t("warrantyCodeEditableDescription")
            }
            error={formatFieldError(
              form.formState.errors.warrantyCode?.message,
              t,
            )}
            id="product-warranty-code"
            label={t("warrantyCode")}
          >
            <Input
              disabled={!product.canEditWarrantyCode || isSubmitting}
              id="product-warranty-code"
              placeholder={t("warrantyCodePlaceholder")}
              {...form.register("warrantyCode")}
            />
          </Field>
        </div>
      ) : null}

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

function TemplateDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 font-medium text-slate-950 dark:text-slate-50">
        {value}
      </dd>
    </div>
  );
}

function ProductTemplateCombobox({
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
  options: ProductTemplateSummary[];
  placeholder: string;
  searchPlaceholder: string;
  value?: string;
}) {
  const selected = options.find((option) => option.id === value);
  return (
    <Combobox
      disabled={disabled}
      onValueChange={onValueChange}
      value={value ?? ""}
    >
      <ComboboxTrigger
        id={id}
        placeholder={placeholder}
        selectedLabel={
          selected ? `${selected.name} · ${selected.sku}` : undefined
        }
      />
      <ComboboxContent>
        <ComboboxInput placeholder={searchPlaceholder} showTrigger={false} />
        <ComboboxList>
          <ComboboxEmpty>{placeholder}</ComboboxEmpty>
          {options.map((option) => (
            <ComboboxItem key={option.id} value={option.id}>
              {option.name} · {option.sku}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
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
    "categoryNotFound",
    "categoryRequired",
    "displayNameLength",
    "duplicateProductCode",
    "duplicateSerialNumber",
    "installationPositionLength",
    "productCodeLength",
    "serialNumberLength",
    "templateNotFound",
    "templateRequired",
    "warrantyCodeInvalid",
    "warrantyCodeNotDraft",
    "warrantyCodeOpenRequest",
  ]),
);
