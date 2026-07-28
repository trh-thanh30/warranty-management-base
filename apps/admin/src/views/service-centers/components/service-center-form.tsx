"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  FormField as Field,
  LocationPickerField,
} from "@/src/components/common";
import {
  useVietnamProvinces,
  useVietnamWards,
} from "@/src/hooks/use-locations";
import type { ServiceCenterSummary } from "@repo/shared";
import { Button, Input, Label, Switch, Textarea } from "@repo/ui";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import { useServiceCenterForm } from "../hooks/use-service-center-form";
import { createFieldErrorFormatter } from "@/src/utils";

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
  const {
    control,
    creating,
    errors,
    isSubmitting,
    onSubmit,
    register,
    selectedLatitude,
    selectedLongitude,
    selectedProvince,
    setValue,
  } = useServiceCenterForm({ onSaved, serviceCenter });
  const provincesQuery = useVietnamProvinces();
  const provinces = provincesQuery.data ?? [];
  const selectedProvinceItem =
    provinces.find((province) => province.name === selectedProvince) ?? null;
  const wardsQuery = useVietnamWards(selectedProvinceItem?.code ?? null);
  const wards = wardsQuery.data ?? [];

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
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
          <Controller
            control={control}
            name="province"
            render={({ field }) => (
              <Combobox
                disabled={provincesQuery.isLoading}
                onValueChange={(value) => {
                  setValue("province", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("district", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                value={field.value}
              >
                <ComboboxTrigger
                  id="service-center-province"
                  placeholder={
                    provincesQuery.isLoading
                      ? t("loadingProvinces")
                      : t("provincePlaceholder")
                  }
                  selectedLabel={field.value}
                />
                <ComboboxContent>
                  <ComboboxInput showTrigger={false} placeholder="Search" />
                  <ComboboxList>
                    <ComboboxEmpty>{t("noLocationResults")}</ComboboxEmpty>
                    {field.value &&
                    !provinces.some(
                      (province) => province.name === field.value,
                    ) ? (
                      <ComboboxItem value={field.value}>
                        {field.value}
                      </ComboboxItem>
                    ) : null}
                    {provinces.map((province) => (
                      <ComboboxItem key={province.code} value={province.name}>
                        {province.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          />
          {provincesQuery.isError ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {t("provinceLoadError")}
            </p>
          ) : null}
        </Field>

        <Field
          error={formatFieldError(errors.district?.message, t)}
          id="service-center-district"
          label={t("ward")}
        >
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <Combobox
                disabled={!selectedProvinceItem || wardsQuery.isLoading}
                onValueChange={(value) => {
                  setValue("district", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                value={field.value}
              >
                <ComboboxTrigger
                  id="service-center-district"
                  placeholder={
                    !selectedProvinceItem
                      ? t("selectProvinceFirst")
                      : wardsQuery.isLoading
                        ? t("loadingWards")
                        : t("wardPlaceholder")
                  }
                  selectedLabel={field.value}
                />
                <ComboboxContent>
                  <ComboboxInput showTrigger={false} placeholder="Search" />
                  <ComboboxList>
                    <ComboboxEmpty>{t("noLocationResults")}</ComboboxEmpty>
                    {field.value &&
                    !wards.some((ward) => ward.name === field.value) ? (
                      <ComboboxItem value={field.value}>
                        {field.value}
                      </ComboboxItem>
                    ) : null}
                    {wards.map((ward) => (
                      <ComboboxItem key={ward.code} value={ward.name}>
                        {ward.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          />
          {wardsQuery.isError ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {t("wardLoadError")}
            </p>
          ) : null}
        </Field>
      </div>

      <Field
        error={formatFieldError(errors.address?.message, t)}
        id="service-center-address"
        label={t("addressDetail")}
      >
        <Textarea
          autoComplete="street-address"
          id="service-center-address"
          placeholder={t("addressPlaceholder")}
          rows={3}
          {...register("address")}
        />
      </Field>

      <LocationPickerField
        coordinateError={formatFieldError(
          errors.latitude?.message ?? errors.longitude?.message,
          t,
        )}
        description={t("locationPickerDescription")}
        googleMapsLabel={t("googleMapsUrl")}
        googleMapsPlaceholder={t("googleMapsUrlPlaceholder")}
        latitude={selectedLatitude}
        latitudeLabel={t("latitude")}
        latitudePlaceholder={t("latitudePlaceholder")}
        longitude={selectedLongitude}
        longitudeLabel={t("longitude")}
        longitudePlaceholder={t("longitudePlaceholder")}
        mapAriaLabel={t("locationPickerAriaLabel")}
        mapBoundaryErrorLabel={t("mapBoundaryError")}
        mapBoundaryLoadingLabel={t("mapBoundaryLoading")}
        onLatitudeChange={(value) =>
          setValue("latitude", value, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        onLocationChange={(value) => {
          setValue("latitude", value.latitude, {
            shouldDirty: true,
            shouldValidate: true,
          });
          setValue("longitude", value.longitude, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
        onLongitudeChange={(value) =>
          setValue("longitude", value, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        title={t("locationPickerTitle")}
      />

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

const formatFieldError = createFieldErrorFormatter(
  new Set([
    "addressLength",
    "addressRequired",
    "districtLength",
    "coordinateInvalid",
    "emailExists",
    "emailInvalid",
    "locationRequired",
    "nameLength",
    "nameRequired",
    "phoneLength",
    "phoneInvalid",
    "phoneExists",
    "provinceLength",
    "provinceRequired",
    "wardRequired",
  ]),
);
