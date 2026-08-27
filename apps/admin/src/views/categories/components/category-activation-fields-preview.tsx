import { CalendarDays, ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input, Label, Textarea } from "@repo/ui";
import type { DraftActivationField } from "../category-activation-fields.types";

type CategoryActivationFieldsPreviewProps = {
  fields: DraftActivationField[];
};

export function CategoryActivationFieldsPreview({
  fields,
}: CategoryActivationFieldsPreviewProps) {
  const t = useTranslations("Categories");

  if (fields.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        {t("activationFieldsPreviewEmpty")}
      </p>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {t("categoryActivationInfo")}
      </h3>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <PreviewField field={field} key={field.key || field.label} />
        ))}
      </div>
    </div>
  );
}

function PreviewField({ field }: { field: DraftActivationField }) {
  const t = useTranslations("Categories");
  const label = field.required ? `${field.label} *` : field.label;

  return (
    <div className="space-y-2">
      <Label>{label || t("activationFieldLabel")}</Label>
      {field.type === "TEXTAREA" ? (
        <Textarea disabled placeholder={field.placeholder} rows={3} />
      ) : field.type === "SELECT" ? (
        <div className="relative">
          <div className="flex h-10 items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
            <span>
              {field.placeholder || t("activationFieldPreviewSelect")}
            </span>
            <ChevronDown aria-hidden="true" className="size-4" />
          </div>
          {field.options.length > 0 ? (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t("activationFieldPreviewOptionCount", {
                count: field.options.length,
              })}
            </p>
          ) : null}
        </div>
      ) : field.type === "PRODUCT_SELECT" ? (
        <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
          <Search aria-hidden="true" className="size-4 shrink-0" />
          <span>{field.placeholder || t("activationFieldPreviewProduct")}</span>
        </div>
      ) : (
        <div className="relative">
          <Input
            disabled
            inputMode={field.type === "NUMBER" ? "numeric" : undefined}
            placeholder={field.placeholder}
            type={field.type === "DATE" ? "date" : "text"}
          />
          {field.type === "DATE" ? (
            <CalendarDays
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
