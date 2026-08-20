"use client";

import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DealerResponse } from "@repo/shared";
import { Button, Input, Label, Switch, Textarea } from "@repo/ui";
import { MAP_MARKER_COLORS } from "@repo/ui/map";
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
import { useVietnamProvinces } from "@/src/hooks/use-locations";
import { useVietnamWards } from "@/src/hooks/use-locations";
import {
  createFieldErrorFormatter,
  fillVietnamAddressSelection,
  getVietnamAddressSelection,
} from "@/src/utils";
import { useDealerForm } from "../hooks/use-dealer-form";

type DealerFormProps = {
  dealer: DealerResponse | null;
  embedded?: boolean;
  onCancel: () => void;
  onSaved: (dealer?: DealerResponse) => void;
};

export function DealerForm({
  dealer,
  embedded = false,
  onCancel,
  onSaved,
}: DealerFormProps) {
  const t = useTranslations("Dealers");
  const {
    control,
    creating,
    errors,
    isSubmitting,
    onSubmit,
    register,
    selectedAddress,
    selectedDistrict,
    selectedLatitude,
    selectedLongitude,
    selectedProvince,
    setValue,
  } = useDealerForm({ dealer, onSaved });
  const provincesQuery = useVietnamProvinces();
  const provinces = provincesQuery.data ?? [];
  const selectedProvinceItem =
    provinces.find((province) => province.name === selectedProvince) ?? null;
  const wardsQuery = useVietnamWards(selectedProvinceItem?.code ?? null);
  const wards = wardsQuery.data ?? [];

  return (
    <form
      className={embedded ? "space-y-5 pb-24 sm:pb-0" : "space-y-5"}
      noValidate
      onSubmit={onSubmit}
    >
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
        id="dealer-name"
        label={t("name")}
      >
        <Input
          autoComplete="organization"
          id="dealer-name"
          placeholder={t("namePlaceholder")}
          {...register("name")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={formatFieldError(errors.province?.message, t)}
          id="dealer-province"
          label={t("province")}
        >
          <Controller
            control={control}
            name="province"
            render={({ field }) => (
              <Combobox
                disabled={provincesQuery.isLoading}
                onValueChange={(value) => {
                  setValue(
                    "address",
                    fillVietnamAddressSelection({
                      currentAddress: selectedAddress,
                      previousSelection: getVietnamAddressSelection({
                        province: selectedProvince,
                        ward: selectedDistrict,
                      }),
                      province: value,
                      ward: "",
                    }),
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  );
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
                  id="dealer-province"
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
        </Field>

        <Field
          error={formatFieldError(errors.district?.message, t)}
          id="dealer-district"
          label={t("ward")}
        >
          <Controller
            control={control}
            name="district"
            render={({ field }) => (
              <Combobox
                disabled={!selectedProvinceItem || wardsQuery.isLoading}
                onValueChange={(value) => {
                  setValue(
                    "address",
                    fillVietnamAddressSelection({
                      currentAddress: selectedAddress,
                      previousSelection: getVietnamAddressSelection({
                        province: selectedProvince,
                        ward: selectedDistrict,
                      }),
                      province: selectedProvince,
                      ward: value,
                    }),
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  );
                  setValue("district", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                value={field.value}
              >
                <ComboboxTrigger
                  id="dealer-district"
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
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={formatFieldError(errors.phone?.message, t)}
          id="dealer-phone"
          label={t("phone")}
        >
          <Input
            autoComplete="tel"
            id="dealer-phone"
            inputMode="tel"
            placeholder={t("phonePlaceholder")}
            {...register("phone")}
          />
        </Field>

        <Field
          error={formatFieldError(errors.salesName?.message, t)}
          id="dealer-sales-name"
          label={t("salesName")}
        >
          <Input
            autoComplete="name"
            id="dealer-sales-name"
            placeholder={t("salesNamePlaceholder")}
            {...register("salesName")}
          />
        </Field>
      </div>

      <Field
        error={formatFieldError(errors.address?.message, t)}
        id="dealer-address"
        label={t("address")}
      >
        <Textarea
          autoComplete="street-address"
          id="dealer-address"
          placeholder={t("addressPlaceholder")}
          rows={3}
          {...register("address")}
        />
      </Field>

      <LocationPickerField
        address={selectedAddress}
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
        markerColor={MAP_MARKER_COLORS.dealer}
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
        province={selectedProvince}
        title={t("locationPickerTitle")}
        ward={selectedDistrict}
      />

      {!creating ? (
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <Label htmlFor="dealer-is-active">{t("active")}</Label>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t("activeDescription")}
                </p>
              </div>
              <Switch
                checked={field.value}
                id="dealer-is-active"
                onCheckedChange={field.onChange}
              />
            </div>
          )}
        />
      ) : null}

      <div
        className={
          embedded
            ? "fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-950 sm:static sm:z-auto sm:flex sm:justify-end sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-5"
            : "grid grid-cols-2 gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex sm:justify-end"
        }
      >
        <Button
          className={embedded ? "hidden sm:inline-flex" : "w-full sm:w-auto"}
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
    "locationRequired",
    "nameLength",
    "nameRequired",
    "phoneExists",
    "phoneInvalid",
    "phoneLength",
    "provinceLength",
    "provinceRequired",
    "salesNameLength",
  ]),
);
