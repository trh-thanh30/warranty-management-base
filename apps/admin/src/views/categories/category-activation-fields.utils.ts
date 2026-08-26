import type {
  CategoryActivationFieldConfig,
  UpdateCategoryActivationField,
} from "@repo/shared";
import type { DraftActivationField } from "./category-activation-fields.types";

export function toDraftActivationFields(
  fields: CategoryActivationFieldConfig[],
): DraftActivationField[] {
  return fields.map((field) => ({
    ...field,
    options: (field.options ?? []).map((option) => ({ ...option })),
  }));
}

export function fromDraftActivationFields(
  fields: DraftActivationField[],
): UpdateCategoryActivationField[] {
  return fields.map((field, index) => ({
    ...(field.id ? { id: field.id } : {}),
    ...(field.key.trim() ? { key: field.key.trim() } : {}),
    label: field.label.trim(),
    ...(field.type === "SELECT" ? { options: field.options } : {}),
    order: index + 1,
    placeholder: field.placeholder?.trim() || undefined,
    required: Boolean(field.required),
    type: field.type,
  }));
}
