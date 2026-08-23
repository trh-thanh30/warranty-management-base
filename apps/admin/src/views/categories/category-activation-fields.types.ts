import type {
  CategoryActivationFieldConfig,
  CategoryActivationFieldOption,
} from "@repo/shared";

export type DraftActivationField = Omit<
  CategoryActivationFieldConfig,
  "options"
> & {
  options: CategoryActivationFieldOption[];
};

export type ActivationFieldOptionErrors = {
  label?: string;
  value?: string;
};
