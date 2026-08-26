import type { CATEGORY_ACTIVATION_FIELD_TYPES } from "../constants/category-activation-fields.ts";

export type CategoryActivationFieldType =
  (typeof CATEGORY_ACTIVATION_FIELD_TYPES)[number];

export type CategoryActivationFieldOption = {
  id?: string;
  label: string;
  value: string;
};

export type CategoryActivationFieldConfig = {
  id?: string;
  key: string;
  label: string;
  type: CategoryActivationFieldType;
  placeholder?: string;
  required?: boolean;
  order?: number;
  options?: CategoryActivationFieldOption[];
};

export type CategoryActivationFieldsResponse = {
  categoryId: string;
  activationFormEnabled: boolean;
  activationFields: CategoryActivationFieldConfig[];
};

export type UpdateCategoryActivationField = Omit<
  CategoryActivationFieldConfig,
  "key"
> & { key?: string };

export type UpdateCategoryActivationFieldsBody = {
  activationFormEnabled: boolean;
  activationFields: UpdateCategoryActivationField[];
};

/** Fully resolved configuration used after application validation/generation. */
export type ReplaceCategoryActivationFieldsInput = {
  activationFormEnabled: boolean;
  activationFields: CategoryActivationFieldConfig[];
};
