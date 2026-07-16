"use client";

import type { ReactNode } from "react";
import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ServiceCenterSummary } from "@repo/shared";
import { Button, Input, Label, Switch, Textarea } from "@repo/ui";
import { useServiceCenterForm } from "../hooks/use-service-center-form";

type ServiceCenterFormProps = {
  onCancel: () => void;
  onSaved: () => void;
  serviceCenter: ServiceCenterSummary | null;
};

export function ServiceCenterForm({
  onCancel,
  onSaved,
  serviceCenter,
}: ServiceCenterFormProps) {
  const t = useTranslations("ServiceCenters");
  const { control, creating, errors, isSubmitting, onSubmit, register } =
    useServiceCenterForm({ onSaved, serviceCenter });

  return (
    <form className="space-y-6" noValidate onSubmit={onSubmit}>
      {errors.root?.message ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {errors.root.message}
        </div>
      ) : null}

      <Field
        error={formatFieldError(errors.name?.message, t)}
        id="service-center-name"
        label={t("name")}
      >
        <Input
          autoComplete="organization"
          id="service-center-name"
          placeholder={t("namePlaceholder")}
          {...register("name")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={formatFieldError(errors.province?.message, t)}
          id="service-center-province"
          label={t("province")}
        >
          <Input
            autoComplete="address-level1"
            id="service-center-province"
            placeholder={t("provincePlaceholder")}
            {...register("province")}
          />
        </Field>
        <Field
          error={formatFieldError(errors.district?.message, t)}
          id="service-center-district"
          label={t("district")}
        >
          <Input
            autoComplete="address-level2"
            id="service-center-district"
            placeholder={t("districtPlaceholder")}
            {...register("district")}
          />
        </Field>
      </div>

      <Field
        error={formatFieldError(errors.address?.message, t)}
        id="service-center-address"
        label={t("address")}
      >
        <Textarea
          autoComplete="street-address"
          id="service-center-address"
          placeholder={t("addressPlaceholder")}
          rows={3}
          {...register("address")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={formatFieldError(errors.phone?.message, t)}
          id="service-center-phone"
          label={t("phone")}
        >
          <Input
            autoComplete="tel"
            id="service-center-phone"
            placeholder={t("phonePlaceholder")}
            type="tel"
            {...register("phone")}
          />
        </Field>
        <Field
          error={formatFieldError(errors.email?.message, t)}
          id="service-center-email"
          label={t("email")}
        >
          <Input
            autoComplete="email"
            id="service-center-email"
            placeholder={t("emailPlaceholder")}
            type="email"
            {...register("email")}
          />
        </Field>
      </div>

      {!creating ? (
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <Label htmlFor="service-center-is-active">
                  {t("activeStatusLabel")}
                </Label>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t("activeStatusDescription")}
                </p>
              </div>
              <Switch
                checked={field.value}
                id="service-center-is-active"
                onCheckedChange={field.onChange}
              />
            </div>
          )}
        />
      ) : null}

      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex sm:justify-end">
        <Button
          className="w-full sm:w-auto"
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="secondary"
        >
          {t("cancel")}
        </Button>
        <Button
          className="w-full sm:w-auto"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {creating ? t("createSubmit") : t("save")}
        </Button>
      </div>
    </form>
  );
}

function Field({
  children,
  error,
  id,
  label,
}: {
  children: ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

function formatFieldError(
  message: string | undefined,
  t: (key: string) => string,
) {
  if (!message) return undefined;

  const translationKeys = new Set([
    "addressLength",
    "addressRequired",
    "districtLength",
    "emailExists",
    "emailInvalid",
    "nameLength",
    "nameRequired",
    "phoneLength",
    "phoneInvalid",
    "phoneExists",
    "provinceLength",
    "provinceRequired",
  ]);

  return translationKeys.has(message) ? t(message) : message;
}
