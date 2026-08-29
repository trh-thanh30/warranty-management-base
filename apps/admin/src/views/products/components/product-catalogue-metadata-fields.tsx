"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Input, Label } from "@repo/ui";
import type { useProductForm } from "../hooks/use-product-form";

type ProductForm = ReturnType<typeof useProductForm>;

export function ProductCatalogueMetadataFields({
  disabled,
  form,
}: {
  disabled: boolean;
  form: ProductForm;
}) {
  const t = useTranslations("Products");

  return (
    <div className="min-w-0 space-y-5">
      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <TextListSection
          addLabel={t("addFeature")}
          disabled={disabled}
          description={t("featuresDescription")}
          fields={form.features.fields}
          inputLabel={t("feature")}
          onAdd={() => form.features.append({ value: "" })}
          onRemove={form.features.remove}
          placeholder={t("featurePlaceholder")}
          register={(index) => form.register(`features.${index}.value`)}
          removeLabel={t("removeFeature")}
          title={t("featuresTitle")}
        />
        <TextListSection
          addLabel={t("addApplication")}
          disabled={disabled}
          description={t("applicationsDescription")}
          fields={form.applications.fields}
          inputLabel={t("application")}
          onAdd={() => form.applications.append({ value: "" })}
          onRemove={form.applications.remove}
          placeholder={t("applicationPlaceholder")}
          register={(index) => form.register(`applications.${index}.value`)}
          removeLabel={t("removeApplication")}
          title={t("applicationsTitle")}
        />
      </div>

      <section className="min-w-0 space-y-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-medium">{t("specificationsTitle")}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("specificationsDescription")}
            </p>
          </div>
          <Button
            className="w-full sm:w-auto"
            disabled={disabled}
            onClick={() => form.specifications.append({ key: "", value: "" })}
            type="button"
            variant="secondary"
          >
            <Plus aria-hidden="true" className="size-4" />
            {t("addSpecification")}
          </Button>
        </div>

        {form.specifications.fields.map((field, index) => (
          <div
            className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            key={field.id}
          >
            <div className="min-w-0 space-y-2">
              <Label htmlFor={`product-specification-${index}-key`}>
                {t("specificationKey")}
              </Label>
              <Input
                disabled={disabled}
                id={`product-specification-${index}-key`}
                maxLength={120}
                placeholder={t("specificationKeyPlaceholder")}
                {...form.register(`specifications.${index}.key`)}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor={`product-specification-${index}-value`}>
                {t("specificationValue")}
              </Label>
              <Input
                disabled={disabled}
                id={`product-specification-${index}-value`}
                maxLength={300}
                placeholder={t("specificationValuePlaceholder")}
                {...form.register(`specifications.${index}.value`)}
              />
            </div>
            <Button
              aria-label={t("removeSpecification", { index: index + 1 })}
              className="size-11 shrink-0 self-end"
              disabled={disabled}
              onClick={() => form.specifications.remove(index)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}

function TextListSection({
  addLabel,
  description,
  disabled,
  fields,
  inputLabel,
  onAdd,
  onRemove,
  placeholder,
  register,
  removeLabel,
  title,
}: {
  addLabel: string;
  description: string;
  disabled: boolean;
  fields: Array<{ id: string }>;
  inputLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
  register: (index: number) => ReturnType<ProductForm["register"]>;
  removeLabel: string;
  title: string;
}) {
  return (
    <section className="min-w-0 space-y-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-medium">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          disabled={disabled}
          onClick={onAdd}
          type="button"
          variant="secondary"
        >
          <Plus aria-hidden="true" className="size-4" />
          {addLabel}
        </Button>
      </div>

      {fields.map((field, index) => (
        <div className="flex min-w-0 items-center gap-2" key={field.id}>
          <Input
            aria-label={`${inputLabel} ${index + 1}`}
            className="min-w-0"
            disabled={disabled}
            maxLength={300}
            placeholder={placeholder}
            {...register(index)}
          />
          <Button
            aria-label={`${removeLabel} ${index + 1}`}
            className="size-11 shrink-0"
            disabled={disabled}
            onClick={() => onRemove(index)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </Button>
        </div>
      ))}
    </section>
  );
}
