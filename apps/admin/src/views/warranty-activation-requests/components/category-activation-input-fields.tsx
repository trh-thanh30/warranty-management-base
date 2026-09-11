"use client";

import { FormField } from "@/src/components/common";
import { SelectControl } from "@/src/components/common/select-control";
import type {
  CategoryActivationFieldConfig,
  ProductResponse,
} from "@repo/shared";
import { Input, Textarea } from "@repo/ui";
import { useTranslations } from "next-intl";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { WarrantyActivationRequestCreateFormValues } from "../warranty-activation-requests.types";
import { ActivationProductSelectField } from "./activation-product-select-field";
import { ActivationItemCodeSelectField } from "./activation-item-code-select-field";
import type { AvailableActivationCode } from "@/src/services/activation-codes/activation-code-batches.types";

type CategoryActivationInputFieldsProps = {
  control: Control<WarrantyActivationRequestCreateFormValues>;
  categoryId: string;
  errors: FieldErrors<WarrantyActivationRequestCreateFormValues>;
  fields: CategoryActivationFieldConfig[];
  onProductClear: (positionKey: string) => void;
  onProductSelect: (positionKey: string, product: ProductResponse) => void;
  onActivationCodeClear: (positionKey: string) => void;
  onActivationCodeSelect: (
    positionKey: string,
    code: AvailableActivationCode,
  ) => void;
  register: UseFormRegister<WarrantyActivationRequestCreateFormValues>;
  selectedActivationCodes: Record<string, AvailableActivationCode>;
  selectedProducts: Record<string, ProductResponse>;
  showActivationCodeSelectors: boolean;
};

export function CategoryActivationInputFields({
  control,
  categoryId,
  errors,
  fields,
  onProductClear,
  onProductSelect,
  onActivationCodeClear,
  onActivationCodeSelect,
  register,
  selectedActivationCodes,
  selectedProducts,
  showActivationCodeSelectors,
}: CategoryActivationInputFieldsProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  if (fields.length === 0) return null;

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {t("categoryActivationInfo")}
      </h3>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {fields.map((field) => (
          <DynamicActivationField
            control={control}
            categoryId={categoryId}
            error={getActivationFieldError(errors, field)}
            field={field}
            key={field.key}
            onProductClear={onProductClear}
            onProductSelect={onProductSelect}
            onActivationCodeClear={onActivationCodeClear}
            onActivationCodeSelect={onActivationCodeSelect}
            register={register}
            selectedActivationCodes={selectedActivationCodes}
            selectedProducts={selectedProducts}
            showActivationCodeSelectors={showActivationCodeSelectors}
          />
        ))}
      </div>
    </div>
  );
}

function DynamicActivationField({
  control,
  categoryId,
  error,
  field,
  onProductClear,
  onProductSelect,
  onActivationCodeClear,
  onActivationCodeSelect,
  register,
  selectedActivationCodes,
  selectedProducts,
  showActivationCodeSelectors,
}: {
  control: Control<WarrantyActivationRequestCreateFormValues>;
  categoryId: string;
  error?: string;
  field: CategoryActivationFieldConfig;
  onProductClear: (positionKey: string) => void;
  onProductSelect: (positionKey: string, product: ProductResponse) => void;
  onActivationCodeClear: (positionKey: string) => void;
  onActivationCodeSelect: (
    positionKey: string,
    code: AvailableActivationCode,
  ) => void;
  register: UseFormRegister<WarrantyActivationRequestCreateFormValues>;
  selectedActivationCodes: Record<string, AvailableActivationCode>;
  selectedProducts: Record<string, ProductResponse>;
  showActivationCodeSelectors: boolean;
}) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const id = `create-activation-request-category-input-${field.key}`;
  const name = `categoryInputValues.${field.key}` as const;
  const label = field.required ? `${field.label} *` : field.label;
  const selectedProduct = selectedProducts[field.key];

  return (
    <FormField error={error} id={id} label={label}>
      {field.type === "PRODUCT_SELECT" ? (
        <div className="space-y-3">
          <ActivationProductSelectField
            categoryId={categoryId}
            id={id}
            onClear={() => onProductClear(field.key)}
            onSelect={(product) => onProductSelect(field.key, product)}
            selectedProduct={selectedProduct}
          />
          <input
            type="hidden"
            {...register(`activationProductIds.${field.key}` as const)}
          />
          {showActivationCodeSelectors && selectedProduct ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t("activationCodeLabel")}
              </p>
              <ActivationItemCodeSelectField
                id={`${id}-activation-code`}
                onClear={() => onActivationCodeClear(field.key)}
                onSelect={(code) => onActivationCodeSelect(field.key, code)}
                productId={selectedProduct.id}
                selectedCode={selectedActivationCodes[field.key]}
              />
            </div>
          ) : null}
        </div>
      ) : field.type === "TEXTAREA" ? (
        <Textarea
          id={id}
          placeholder={field.placeholder}
          rows={3}
          {...register(name)}
        />
      ) : field.type === "SELECT" ? (
        <Controller
          control={control}
          name={name}
          render={({ field: selectField }) => (
            <SelectControl
              id={id}
              onValueChange={selectField.onChange}
              options={(field.options ?? []).map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              placeholder={field.placeholder}
              value={selectField.value ?? ""}
            />
          )}
        />
      ) : (
        <Input
          id={id}
          inputMode={field.type === "NUMBER" ? "numeric" : undefined}
          placeholder={field.placeholder}
          type={resolveDynamicInputType(field.type)}
          {...register(name)}
        />
      )}
    </FormField>
  );
}

function resolveDynamicInputType(type: CategoryActivationFieldConfig["type"]) {
  if (type === "DATE") return "date";
  if (type === "NUMBER") return "number";
  return "text";
}

function getActivationFieldError(
  errors: FieldErrors<WarrantyActivationRequestCreateFormValues>,
  field: CategoryActivationFieldConfig,
) {
  const fieldErrors =
    field.type === "PRODUCT_SELECT"
      ? errors.activationProductIds
      : errors.categoryInputValues;
  if (!fieldErrors || typeof fieldErrors !== "object") return undefined;
  const fieldError = fieldErrors[field.key];
  return typeof fieldError?.message === "string"
    ? fieldError.message
    : undefined;
}
