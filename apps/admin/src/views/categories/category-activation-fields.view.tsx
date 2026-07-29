"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  FolderTree,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  CategoryActivationFieldConfig,
  CategoryActivationFieldType,
} from "@repo/shared";
import { CATEGORY_ACTIVATION_FIELD_TYPES } from "@repo/shared";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Switch,
  Textarea,
} from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { SelectControl } from "@/src/components/common/select-control";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useToast } from "@/src/hooks/use-toast";
import { useRouter } from "@/src/i18n/navigation";
import { PERMISSIONS } from "@repo/shared/constants";
import { moveItem } from "@/src/utils/array";
import { parseActivationFieldOptionsText } from "@/src/utils/category-activation-field-options";
import {
  DEFAULT_CATEGORY_ACTIVATION_FIELDS,
  buildCategoryMetadataWithActivationFields,
  hasCategoryActivationFieldsConfig,
  isCategoryActivationFormEnabled,
  normalizeActivationFieldKey,
  parseActivationFields,
} from "@/src/utils/category-activation-fields";
import { useCategory, useUpdateCategory } from "./hooks/use-categories";

type CategoryActivationFieldsViewProps = {
  categoryId: string;
};

type DraftActivationField = CategoryActivationFieldConfig & {
  optionsText: string;
};

export function CategoryActivationFieldsView({
  categoryId,
}: CategoryActivationFieldsViewProps) {
  const t = useTranslations("Categories");
  const toast = useToast();
  const router = useRouter();
  const categoryQuery = useCategory(categoryId, {
    enabled: Boolean(categoryId),
  });
  const updateCategory = useUpdateCategory(categoryId);
  const category = categoryQuery.data ?? null;
  const [fields, setFields] = useState<DraftActivationField[]>([]);
  const [activationFieldsEnabled, setActivationFieldsEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;
    const configuredFields = parseActivationFields(category.metadata);
    setActivationFieldsEnabled(
      isCategoryActivationFormEnabled(category.metadata),
    );
    setFields(
      toDraftFields(
        hasCategoryActivationFieldsConfig(category.metadata)
          ? configuredFields
          : DEFAULT_CATEGORY_ACTIVATION_FIELDS,
      ),
    );
  }, [category]);

  const canSave = useMemo(
    () => fields.every((field) => field.key.trim() && field.label.trim()),
    [fields],
  );

  async function submit() {
    if (!category) return;

    const validationError = validateFields(fields, t);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError(null);
    await updateCategory.mutateAsync({
      metadata: buildCategoryMetadataWithActivationFields(
        category.metadata,
        fromDraftFields(fields),
        activationFieldsEnabled,
      ),
    });
    toast.success(t("activationFieldsSaved"));
    router.push("/categories");
  }

  return (
    <PermissionGuard permissions={[PERMISSIONS.CATEGORY_UPDATE]}>
      <FormPageShell
        backHref="/categories"
        backLabel={t("backToDirectory")}
        description={t("activationFieldsDescription")}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={t("activationFieldsTitle")}
      >
        {categoryQuery.isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("activationFieldsTitle")}</CardTitle>
              <CardDescription>
                {t("activationFieldsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-24 rounded-md bg-slate-100 dark:bg-slate-900" />
              <div className="h-24 rounded-md bg-slate-100 dark:bg-slate-900" />
            </CardContent>
          </Card>
        ) : categoryQuery.isError || !category ? (
          <StatePanel
            action={
              <Button
                onClick={() => {
                  void categoryQuery.refetch();
                }}
                variant="secondary"
              >
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={FolderTree}
            title={t("loadErrorTitle")}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>
                {t("activationFieldsCardDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <Label
                      className="text-sm font-semibold text-slate-950 dark:text-slate-50"
                      htmlFor="category-activation-fields-enabled"
                    >
                      {t("activationFieldsEnabled")}
                    </Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t("activationFieldsEnabledDescription")}
                    </p>
                  </div>
                  <Switch
                    checked={activationFieldsEnabled}
                    id="category-activation-fields-enabled"
                    onCheckedChange={setActivationFieldsEnabled}
                  />
                </div>
              </div>

              {error ? (
                <div
                  className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <ActivationFieldEditor
                    field={field}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === fields.length - 1}
                    key={`${field.key}-${index}`}
                    onChange={(nextField) => {
                      setFields((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? nextField : item,
                        ),
                      );
                    }}
                    onMoveDown={() => {
                      setFields((current) => moveItem(current, index, 1));
                    }}
                    onMoveUp={() => {
                      setFields((current) => moveItem(current, index, -1));
                    }}
                    onRemove={() => {
                      setFields((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      );
                    }}
                  />
                ))}
              </div>

              <Button
                onClick={() => {
                  setFields((current) => [
                    ...current,
                    {
                      key: "",
                      label: "",
                      optionsText: "",
                      placeholder: "",
                      required: false,
                      type: "TEXT",
                    },
                  ]);
                }}
                type="button"
                variant="secondary"
              >
                <Plus className="size-4" />
                {t("addActivationField")}
              </Button>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <Button
                  disabled={updateCategory.isPending}
                  onClick={() => router.push("/categories")}
                  type="button"
                  variant="secondary"
                >
                  {t("cancel")}
                </Button>
                <Button
                  disabled={!canSave || updateCategory.isPending}
                  onClick={() => {
                    void submit();
                  }}
                  type="button"
                >
                  {updateCategory.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {t("save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </FormPageShell>
    </PermissionGuard>
  );
}

function ActivationFieldEditor({
  field,
  index,
  isFirst,
  isLast,
  onChange,
  onMoveDown,
  onMoveUp,
  onRemove,
}: {
  field: DraftActivationField;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (field: DraftActivationField) => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
}) {
  const t = useTranslations("Categories");

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
          {t("activationFieldNumber", { number: index + 1 })}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            aria-label={t("moveActivationFieldUp")}
            disabled={isFirst}
            onClick={onMoveUp}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            aria-label={t("moveActivationFieldDown")}
            disabled={isLast}
            onClick={onMoveDown}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ArrowDown className="size-4" />
          </Button>
          <Button
            aria-label={t("removeActivationField")}
            className="text-red-600 hover:text-red-700 dark:text-red-400"
            onClick={onRemove}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("activationFieldLabel")}</Label>
          <Input
            onBlur={() => {
              if (field.key.trim() || !field.label.trim()) return;
              onChange({
                ...field,
                key: normalizeActivationFieldKey(field.label),
              });
            }}
            onChange={(event) =>
              onChange({ ...field, label: event.target.value })
            }
            placeholder={t("activationFieldLabelPlaceholder")}
            value={field.label}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("activationFieldKey")}</Label>
          <Input
            onChange={(event) =>
              onChange({
                ...field,
                key: normalizeActivationFieldKey(event.target.value),
              })
            }
            placeholder={t("activationFieldKeyPlaceholder")}
            value={field.key}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("activationFieldType")}</Label>
          <SelectControl
            onValueChange={(value) =>
              onChange({
                ...field,
                type: value as CategoryActivationFieldType,
              })
            }
            options={CATEGORY_ACTIVATION_FIELD_TYPES.map((type) => ({
              label: t(`activationFieldTypes.${type}`),
              value: type,
            }))}
            value={field.type}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("activationFieldPlaceholder")}</Label>
          <Input
            onChange={(event) =>
              onChange({ ...field, placeholder: event.target.value })
            }
            placeholder={t("activationFieldPlaceholderExample")}
            value={field.placeholder ?? ""}
          />
        </div>
      </div>

      {field.type === "SELECT" ? (
        <div className="mt-5 space-y-2">
          <Label>{t("activationFieldOptions")}</Label>
          <Textarea
            onChange={(event) =>
              onChange({ ...field, optionsText: event.target.value })
            }
            placeholder={t("activationFieldOptionsPlaceholder")}
            rows={3}
            value={field.optionsText}
          />
        </div>
      ) : null}

      <label className="mt-5 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <Checkbox
          checked={Boolean(field.required)}
          onCheckedChange={(checked) =>
            onChange({ ...field, required: checked === true })
          }
        />
        {t("activationFieldRequired")}
      </label>
    </section>
  );
}

function validateFields(
  fields: DraftActivationField[],
  t: (key: string) => string,
) {
  const keys = new Set<string>();

  for (const field of fields) {
    const key = field.key.trim();
    if (!key || !field.label.trim()) return t("activationFieldRequiredError");
    if (keys.has(key)) return t("activationFieldDuplicateKeyError");
    keys.add(key);
  }

  return null;
}

function toDraftFields(fields: CategoryActivationFieldConfig[]) {
  return fields.map((field) => ({
    ...field,
    optionsText: (field.options ?? [])
      .map((option) => `${option.label}|${option.value}`)
      .join("\n"),
  }));
}

function fromDraftFields(
  fields: DraftActivationField[],
): CategoryActivationFieldConfig[] {
  return fields.map((field, index) => ({
    key: field.key,
    label: field.label,
    options: parseActivationFieldOptionsText(field.optionsText),
    order: index + 1,
    placeholder: field.placeholder,
    required: field.required,
    type: field.type,
  }));
}
