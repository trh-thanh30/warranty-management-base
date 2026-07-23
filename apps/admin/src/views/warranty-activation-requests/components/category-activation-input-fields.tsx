"use client";

import { FormField } from "@/src/components/common";
import { SelectControl } from "@/src/components/common/select-control";
import type { CategoryActivationFieldConfig } from "@repo/shared";
import { Input, Textarea } from "@repo/ui";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import type { WarrantyActivationRequestCreateFormValues } from "../warranty-activation-requests.types";

type CategoryActivationInputFieldsProps = {
  control: Control<WarrantyActivationRequestCreateFormValues>;
  errors: FieldErrors<WarrantyActivationRequestCreateFormValues>;
  fields: CategoryActivationFieldConfig[];
  register: UseFormRegister<WarrantyActivationRequestCreateFormValues>;
};

export function CategoryActivationInputFields({
  control,
  errors,
  fields,
  register,
}: CategoryActivationInputFieldsProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  if (fields.length === 0) return null;

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {t("categoryActivationInfo")}
      </h3>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <DynamicActivationField
            control={control}
            error={getCategoryInputError(errors, field.key)}
            field={field}
            key={field.key}
            register={register}
          />
        ))}
      </div>
    </div>
  );
}

function DynamicActivationField({
  control,
  error,
  field,
  register,
}: {
  control: Control<WarrantyActivationRequestCreateFormValues>;
  error?: string;
  field: CategoryActivationFieldConfig;
  register: UseFormRegister<WarrantyActivationRequestCreateFormValues>;
}) {
  const id = `create-activation-request-category-input-${field.key}`;
  const name = `categoryInputValues.${field.key}` as const;
  const label = field.required ? `${field.label} *` : field.label;

  return (
    <FormField error={error} id={id} label={label}>
      {field.type === "TEXTAREA" ? (
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

function getCategoryInputError(
  errors: FieldErrors<WarrantyActivationRequestCreateFormValues>,
  key: string,
) {
  const fieldErrors = errors.categoryInputValues;
  if (!fieldErrors || typeof fieldErrors !== "object") return undefined;
  const fieldError = fieldErrors[key];
  return typeof fieldError?.message === "string"
    ? fieldError.message
    : undefined;
}
