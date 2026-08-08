import type {
  CategoryActivationFieldConfig,
  CategoryActivationFieldOption,
  CategoryActivationFieldType,
  CategoryResponse,
} from "@repo/shared";
import { CATEGORY_ACTIVATION_FIELD_TYPES } from "@repo/shared";

const fieldTypes = new Set<string>(CATEGORY_ACTIVATION_FIELD_TYPES);

export const DEFAULT_CATEGORY_ACTIVATION_FIELDS: CategoryActivationFieldConfig[] =
  [
    {
      key: "windshield",
      label: "Kính lái",
      type: "TEXT",
      placeholder: "Chọn hoặc nhập mã phim",
      order: 10,
    },
    {
      key: "frontLeftSide",
      label: "Kính sườn trước - trái",
      type: "TEXT",
      placeholder: "Chọn hoặc nhập mã phim",
      order: 20,
    },
    {
      key: "frontRightSide",
      label: "Kính sườn trước - phải",
      type: "TEXT",
      placeholder: "Chọn hoặc nhập mã phim",
      order: 30,
    },
    {
      key: "rearLeftSide",
      label: "Kính sườn sau - trái",
      type: "TEXT",
      placeholder: "Chọn hoặc nhập mã phim",
      order: 40,
    },
    {
      key: "rearRightSide",
      label: "Kính sườn sau - phải",
      type: "TEXT",
      placeholder: "Chọn hoặc nhập mã phim",
      order: 50,
    },
    {
      key: "rearGlass",
      label: "Kính lưng",
      type: "TEXT",
      placeholder: "Chọn hoặc nhập mã phim",
      order: 60,
    },
    {
      key: "sunroof",
      label: "Cửa sổ trời",
      type: "TEXT",
      placeholder: "Chọn hoặc nhập mã phim",
      order: 70,
    },
  ];

export function getCategoryActivationFields(
  category: CategoryResponse | null,
  fallback: CategoryActivationFieldConfig[] = DEFAULT_CATEGORY_ACTIVATION_FIELDS,
): CategoryActivationFieldConfig[] {
  if (!category) return [];
  if (!isCategoryActivationFormEnabled(category?.metadata)) return [];

  const fields = parseActivationFields(category?.metadata);
  return hasCategoryActivationFieldsConfig(category?.metadata)
    ? fields
    : fallback;
}

export function isCategoryActivationFormEnabled(metadata: unknown) {
  return !isRecord(metadata) || metadata.activationFieldsEnabled !== false;
}

export function hasCategoryActivationFieldsConfig(metadata: unknown) {
  return isRecord(metadata) && Array.isArray(metadata.activationFields);
}

export function parseActivationFields(
  metadata: unknown,
): CategoryActivationFieldConfig[] {
  if (!isRecord(metadata) || !Array.isArray(metadata.activationFields)) {
    return [];
  }

  return metadata.activationFields
    .map(parseActivationField)
    .filter(isActivationFieldConfig)
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
}

export function buildCategoryMetadataWithActivationFields(
  metadata: Record<string, unknown> | null,
  fields: CategoryActivationFieldConfig[],
  enabled = true,
) {
  return {
    ...(metadata ?? {}),
    activationFieldsEnabled: enabled,
    activationFields: fields.map((field, index) => ({
      key: field.key.trim(),
      label: field.label.trim(),
      type: field.type,
      placeholder: field.placeholder?.trim() || undefined,
      required: Boolean(field.required),
      order: index + 1,
      options:
        field.type === "SELECT"
          ? normalizeOptions(field.options ?? [])
          : undefined,
    })),
  };
}

export function normalizeActivationFieldKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function compactActivationInputValues(values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values)
      .map(([key, value]) => [key, value.trim()])
      .filter(([key, value]) => Boolean(key) && Boolean(value)),
  );
}

function parseActivationField(
  value: unknown,
): CategoryActivationFieldConfig | null {
  if (!isRecord(value)) return null;

  const key = typeof value.key === "string" ? value.key.trim() : "";
  const label = typeof value.label === "string" ? value.label.trim() : "";
  const type = parseFieldType(value.type);
  if (!key || !label || !type) return null;

  const field: CategoryActivationFieldConfig = {
    key,
    label,
    type,
    required: Boolean(value.required),
    order:
      typeof value.order === "number" && Number.isFinite(value.order)
        ? value.order
        : 0,
  };
  const options =
    type === "SELECT" && Array.isArray(value.options)
      ? normalizeOptions(value.options)
      : [];
  if (options.length > 0) {
    field.options = options;
  }
  const placeholder =
    typeof value.placeholder === "string" ? value.placeholder.trim() : "";
  if (placeholder) {
    field.placeholder = placeholder;
  }

  return field;
}

function parseFieldType(value: unknown): CategoryActivationFieldType | null {
  return typeof value === "string" && fieldTypes.has(value)
    ? (value as CategoryActivationFieldType)
    : null;
}

function normalizeOptions(options: unknown[]) {
  return options
    .map((option) => {
      if (!isRecord(option)) return null;
      const label = typeof option.label === "string" ? option.label.trim() : "";
      const value =
        typeof option.value === "string" ? option.value.trim() : label;
      return label && value ? { label, value } : null;
    })
    .filter((option): option is CategoryActivationFieldOption =>
      Boolean(option),
    );
}

function isActivationFieldConfig(
  value: CategoryActivationFieldConfig | null,
): value is CategoryActivationFieldConfig {
  return value !== null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && !Array.isArray(value) && typeof value === "object";
}
