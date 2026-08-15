export const CATEGORY_ACTIVATION_FIELD_TYPES = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "SELECT",
  "PRODUCT_SELECT",
] as const;

export type CategoryActivationFieldType =
  (typeof CATEGORY_ACTIVATION_FIELD_TYPES)[number];

export type CategoryActivationFieldOption = {
  label: string;
  value: string;
};

export type CategoryActivationFieldConfig = {
  key: string;
  label: string;
  type: CategoryActivationFieldType;
  placeholder?: string;
  required?: boolean;
  order?: number;
  options?: CategoryActivationFieldOption[];
};
