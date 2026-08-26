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
  CategoryActivationFieldOption,
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
} from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { SelectControl } from "@/src/components/common/select-control";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useToast } from "@/src/hooks/use-toast";
import { useRouter } from "@/src/i18n/navigation";
import { PERMISSIONS } from "@repo/shared/constants";
import { moveItem } from "@/src/utils/array";
import {
  useCategory,
  useCategoryActivationFields,
  useUpdateCategoryActivationFields,
} from "./hooks/use-categories";
import type {
  ActivationFieldOptionErrors,
  DraftActivationField,
} from "./category-activation-fields.types";
import {
  fromDraftActivationFields,
  toDraftActivationFields,
} from "./category-activation-fields.utils";

type CategoryActivationFieldsViewProps = {
  categoryId: string;
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
  const activationFieldsQuery = useCategoryActivationFields(categoryId, {
    enabled: Boolean(categoryId),
  });
  const updateActivationFields = useUpdateCategoryActivationFields(categoryId);
  const category = categoryQuery.data ?? null;
  const [fields, setFields] = useState<DraftActivationField[]>([]);
  const [activationFieldsEnabled, setActivationFieldsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activationFieldsQuery.data) return;
    setActivationFieldsEnabled(
      activationFieldsQuery.data.activationFormEnabled,
    );
    setFields(
      toDraftActivationFields(activationFieldsQuery.data.activationFields),
    );
  }, [activationFieldsQuery.data]);

  const canSave = useMemo(
    () => fields.every((field) => field.label.trim()),
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
    await updateActivationFields.mutateAsync({
      activationFields: fromDraftActivationFields(fields),
      activationFormEnabled: activationFieldsEnabled,
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
        {categoryQuery.isLoading || activationFieldsQuery.isLoading ? (
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
        ) : categoryQuery.isError ||
          activationFieldsQuery.isError ||
          !category ? (
          <StatePanel
            action={
              <Button
                onClick={() => {
                  void categoryQuery.refetch();
                  void activationFieldsQuery.refetch();
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
                      options: [],
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
                  disabled={updateActivationFields.isPending}
                  onClick={() => router.push("/categories")}
                  type="button"
                  variant="secondary"
                >
                  {t("cancel")}
                </Button>
                <Button
                  disabled={!canSave || updateActivationFields.isPending}
                  onClick={() => {
                    void submit();
                  }}
                  type="button"
                >
                  {updateActivationFields.isPending ? (
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
  const [optionsTouched, setOptionsTouched] = useState(false);
  const optionErrors =
    field.type === "SELECT" && optionsTouched
      ? getActivationFieldOptionErrors(field.options, t)
      : [];

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
            onChange={(event) =>
              onChange({ ...field, label: event.target.value })
            }
            placeholder={t("activationFieldLabelPlaceholder")}
            value={field.label}
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
        <div className="mt-5 space-y-3">
          <Label>{t("activationFieldOptions")}</Label>
          <div className="space-y-3">
            {field.options.map((option, optionIndex) => (
              <div
                className="grid gap-3 rounded-md border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start dark:border-slate-800"
                key={optionIndex}
              >
                <div className="space-y-2">
                  <Label>{t("activationFieldOptionLabel")}</Label>
                  <Input
                    aria-invalid={Boolean(optionErrors[optionIndex]?.label)}
                    onChange={(event) => {
                      setOptionsTouched(true);
                      const options = field.options.map((item, index) =>
                        index === optionIndex
                          ? { ...item, label: event.target.value }
                          : item,
                      );
                      onChange({ ...field, options });
                    }}
                    placeholder={t("activationFieldOptionLabelPlaceholder")}
                    value={option.label}
                  />
                  <p className="min-h-4 text-xs text-red-600 dark:text-red-400">
                    {optionErrors[optionIndex]?.label ?? "\u00a0"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{t("activationFieldOptionValue")}</Label>
                  <Input
                    aria-invalid={Boolean(optionErrors[optionIndex]?.value)}
                    onChange={(event) => {
                      setOptionsTouched(true);
                      const options = field.options.map((item, index) =>
                        index === optionIndex
                          ? { ...item, value: event.target.value }
                          : item,
                      );
                      onChange({ ...field, options });
                    }}
                    placeholder={t("activationFieldOptionValuePlaceholder")}
                    value={option.value}
                  />
                  <p className="min-h-4 text-xs text-red-600 dark:text-red-400">
                    {optionErrors[optionIndex]?.value ?? "\u00a0"}
                  </p>
                </div>
                <Button
                  aria-label={t("removeActivationFieldOption")}
                  onClick={() => {
                    setOptionsTouched(true);
                    onChange({
                      ...field,
                      options: field.options.filter(
                        (_, index) => index !== optionIndex,
                      ),
                    });
                  }}
                  className="text-red-600 hover:text-red-700 sm:mt-7 dark:text-red-400"
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={() => {
              setOptionsTouched(true);
              onChange({
                ...field,
                options: [...field.options, { label: "", value: "" }],
              });
            }}
            type="button"
            variant="secondary"
          >
            <Plus className="size-4" />
            {t("addActivationFieldOption")}
          </Button>
        </div>
      ) : null}

      {field.type === "PRODUCT_SELECT" ? (
        <p className="mt-5 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          {t("activationFieldProductSelectDescription")}
        </p>
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
  const labels = new Set<string>();

  for (const field of fields) {
    const label = field.label.trim().replace(/\s+/g, " ");
    if (!label) return t("activationFieldRequiredError");
    const identity = label.toLocaleLowerCase();
    if (labels.has(identity)) return t("activationFieldDuplicateLabelError");
    labels.add(identity);

    if (field.type === "SELECT") {
      if (field.options.length === 0) {
        return t("activationFieldOptionsRequired");
      }

      const optionErrors = getActivationFieldOptionErrors(field.options, t);
      const firstOptionError = optionErrors.find(
        (optionError) => optionError.label || optionError.value,
      );
      if (firstOptionError?.label) return firstOptionError.label;
      if (firstOptionError?.value) return firstOptionError.value;
    }
  }

  return null;
}

function getActivationFieldOptionErrors(
  options: CategoryActivationFieldOption[],
  t: (key: string) => string,
): ActivationFieldOptionErrors[] {
  const valueCounts = new Map<string, number>();

  for (const option of options) {
    const value = option.value.trim().toLowerCase();
    if (value) valueCounts.set(value, (valueCounts.get(value) ?? 0) + 1);
  }

  return options.map((option) => {
    const normalizedValue = option.value.trim().toLowerCase();
    return {
      label: option.label.trim()
        ? undefined
        : t("activationFieldOptionLabelRequired"),
      value: !normalizedValue
        ? t("activationFieldOptionValueRequired")
        : valueCounts.get(normalizedValue) !== 1
          ? t("activationFieldOptionDuplicateValue")
          : undefined,
    };
  });
}
