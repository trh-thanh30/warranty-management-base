"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  FormField,
} from "@/src/components/common";
import {
  useVietnamProvinces,
  useVietnamWards,
} from "@/src/hooks/use-locations";
import { createFieldErrorFormatter, parseVietnamAddress } from "@/src/utils";
import type { CustomerSummary } from "@repo/shared";
import { Button, DatePicker, Input, Textarea } from "@repo/ui";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import {
  fillCustomerAddressSelection,
  getCustomerAddressSelection,
} from "../customers.utils";
import { useCustomerForm } from "../hooks/use-customer-form";

type CustomerFormProps = {
  customer: CustomerSummary | null;
  embedded?: boolean;
  onCancel: () => void;
  onSaved: (customer?: CustomerSummary) => void;
};

export function CustomerForm({
  customer,
  embedded = false,
  onCancel,
  onSaved,
}: CustomerFormProps) {
  const t = useTranslations("Customers");
  const [hydratedAddressKey, setHydratedAddressKey] = useState<string | null>(
    null,
  );
  const [pendingWardName, setPendingWardName] = useState<string | null>(null);
  const previousAddressSelectionRef = useRef("");
  const {
    control,
    creating,
    errors,
    isSubmitting,
    onSubmit,
    register,
    setValue,
    watch,
  } = useCustomerForm({ customer, onSaved });
  const provinceCode = watch("provinceCode");
  const wardCode = watch("wardCode");
  const provinceName = watch("provinceName");
  const wardName = watch("wardName");
  const addressDetail = watch("addressDetail");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const provinceCodeNumber = provinceCode ? Number(provinceCode) : null;
  const provincesQuery = useVietnamProvinces();
  const wardsQuery = useVietnamWards(provinceCodeNumber);
  const provinces = useMemo(
    () => provincesQuery.data ?? [],
    [provincesQuery.data],
  );
  const wards = useMemo(() => wardsQuery.data ?? [], [wardsQuery.data]);
  const selectedProvince = provinces.find(
    (province) => String(province.code) === provinceCode,
  );
  const selectedWard = wards.find((ward) => String(ward.code) === wardCode);

  useEffect(() => {
    if (!customer?.address || provinces.length === 0) return;

    const addressKey = `${customer.id}:${customer.address}`;
    if (hydratedAddressKey === addressKey) return;

    const parsedAddress = parseVietnamAddress(customer.address, provinces);
    setValue("addressDetail", parsedAddress.detail, {
      shouldDirty: false,
      shouldValidate: true,
    });

    if (parsedAddress.province) {
      setValue("provinceCode", String(parsedAddress.province.code), {
        shouldDirty: false,
        shouldValidate: true,
      });
      setValue("provinceName", parsedAddress.province.name, {
        shouldDirty: false,
        shouldValidate: true,
      });
      setValue("wardCode", "", {
        shouldDirty: false,
        shouldValidate: true,
      });
      setValue("wardName", "", {
        shouldDirty: false,
        shouldValidate: true,
      });
      setPendingWardName(parsedAddress.wardName ?? null);
    }

    setHydratedAddressKey(addressKey);
  }, [customer, hydratedAddressKey, provinces, setValue]);

  useEffect(() => {
    if (!pendingWardName || wards.length === 0) return;

    const ward = wards.find((item) => pendingWardName.includes(item.name));
    if (!ward) return;

    setValue("wardCode", String(ward.code), {
      shouldDirty: false,
      shouldValidate: true,
    });
    setValue("wardName", ward.name, {
      shouldDirty: false,
      shouldValidate: true,
    });
    setPendingWardName(null);
  }, [pendingWardName, setValue, wards]);

  useEffect(() => {
    const nextSelection = getCustomerAddressSelection({
      provinceName,
      wardName,
    });
    if (!nextSelection) return;

    const nextAddress = fillCustomerAddressSelection({
      currentAddress: addressDetail,
      previousSelection: previousAddressSelectionRef.current,
      provinceName,
      wardName,
    });
    previousAddressSelectionRef.current = nextSelection;
    if (nextAddress === addressDetail) return;

    setValue("addressDetail", nextAddress, {
      shouldDirty: creating,
      shouldValidate: true,
    });
  }, [addressDetail, creating, provinceName, setValue, wardName]);

  const Wrapper = embedded ? "div" : "form";
  const wrapperProps = embedded ? {} : { noValidate: true, onSubmit };

  return (
    <Wrapper
      className={embedded ? "space-y-6 pb-24 sm:pb-0" : "space-y-6"}
      {...wrapperProps}
    >
      {errors.root?.message ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {errors.root.message}
        </div>
      ) : null}
      <div className="sm:col-span-3">
        <FormField
          error={formatFieldError(errors.customerCode?.message, t)}
          id="customer-code"
          label={t("customerCode")}
        >
          <Input
            autoComplete="off"
            disabled={!creating}
            id="customer-code"
            placeholder={
              creating
                ? t("customerCodeAutoPlaceholder")
                : t("customerCodePlaceholder")
            }
            {...register("customerCode")}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          error={formatFieldError(errors.fullName?.message, t)}
          id="customer-full-name"
          label={t("fullName")}
        >
          <Input
            autoComplete="name"
            id="customer-full-name"
            placeholder={t("fullNamePlaceholder")}
            {...register("fullName")}
          />
        </FormField>

        <FormField id="customer-birthdate" label={t("birthdate")}>
          <Controller
            control={control}
            name="birthdate"
            render={({ field }) => (
              <DatePicker
                allowManualInput
                ariaLabel={t("birthdate")}
                calendarAriaLabel={t("openBirthdateCalendar")}
                captionLayout="dropdown"
                disabledDates={{ after: today }}
                endMonth={today}
                id="customer-birthdate"
                inputPlaceholder={t("birthdateInputPlaceholder")}
                invalidInputMessage={t("birthdateInvalid")}
                maxDate={today}
                minDate={new Date(1900, 0, 1)}
                onValueChange={field.onChange}
                placeholder={t("selectBirthdate")}
                startMonth={new Date(1900, 0, 1)}
                value={field.value}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          error={formatFieldError(errors.phone?.message, t)}
          id="customer-phone"
          label={t("phone")}
        >
          <Input
            autoComplete="tel"
            id="customer-phone"
            placeholder={t("phonePlaceholder")}
            type="tel"
            {...register("phone")}
          />
        </FormField>

        <FormField
          error={formatFieldError(errors.email?.message, t)}
          id="customer-email"
          label={t("email")}
        >
          <Input
            autoComplete="email"
            id="customer-email"
            placeholder={t("emailPlaceholder")}
            type="email"
            {...register("email")}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          error={formatFieldError(errors.provinceCode?.message, t)}
          id="customer-province"
          label={t("province")}
        >
          <Controller
            control={control}
            name="provinceCode"
            render={({ field }) => (
              <Combobox
                disabled={provincesQuery.isLoading}
                onValueChange={(value) => {
                  const province = provinces.find(
                    (item) => String(item.code) === value,
                  );
                  setValue("provinceCode", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("provinceName", province?.name ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("wardCode", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("wardName", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                value={field.value}
              >
                <ComboboxTrigger
                  id="customer-province"
                  placeholder={t("provincePlaceholder")}
                  selectedLabel={selectedProvince?.name}
                />
                <ComboboxContent>
                  <ComboboxInput
                    placeholder={t("search")}
                    showTrigger={false}
                  />
                  <ComboboxList>
                    <ComboboxEmpty>{t("noProvince")}</ComboboxEmpty>
                    {provinces.map((province) => (
                      <ComboboxItem
                        key={province.code}
                        value={String(province.code)}
                      >
                        {province.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          />
        </FormField>

        <FormField
          error={
            wardsQuery.isLoading
              ? undefined
              : formatFieldError(errors.wardCode?.message, t)
          }
          id="customer-ward"
          label={t("ward")}
        >
          <Controller
            control={control}
            name="wardCode"
            render={({ field }) => (
              <Combobox
                disabled={!provinceCode || wardsQuery.isLoading}
                onValueChange={(value) => {
                  const ward = wards.find(
                    (item) => String(item.code) === value,
                  );
                  setValue("wardCode", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("wardName", ward?.name ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                value={field.value}
              >
                <ComboboxTrigger
                  id="customer-ward"
                  loading={wardsQuery.isLoading}
                  loadingLabel={t("loadingWards")}
                  placeholder={
                    provinceCode
                      ? t("wardPlaceholder")
                      : t("selectProvinceFirst")
                  }
                  selectedLabel={selectedWard?.name}
                />
                <ComboboxContent>
                  <ComboboxInput
                    placeholder={t("search")}
                    showTrigger={false}
                  />
                  <ComboboxList>
                    <ComboboxEmpty>{t("noWard")}</ComboboxEmpty>
                    {wards.map((ward) => (
                      <ComboboxItem key={ward.code} value={String(ward.code)}>
                        {ward.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          />
        </FormField>
      </div>

      <FormField
        error={formatFieldError(errors.addressDetail?.message, t)}
        id="customer-address"
        label={t("addressDetail")}
      >
        <Textarea
          id="customer-address"
          placeholder={t("addressDetailPlaceholder")}
          rows={4}
          {...register("addressDetail")}
        />
      </FormField>

      <div
        className={
          embedded
            ? "fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-950 sm:static sm:z-auto sm:flex sm:justify-end sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-5"
            : "grid grid-cols-2 gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex sm:justify-end"
        }
      >
        {!embedded ? (
          <Button
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            {t("cancel")}
          </Button>
        ) : null}
        <Button
          className={
            embedded ? "col-span-2 w-full sm:w-auto" : "w-full sm:w-auto"
          }
          disabled={isSubmitting}
          onClick={embedded ? () => void onSubmit() : undefined}
          type={embedded ? "button" : "submit"}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {creating ? t("create") : t("save")}
        </Button>
      </div>
    </Wrapper>
  );
}

const formatFieldError = createFieldErrorFormatter(
  new Set([
    "customerCodeLength",
    "addressRequired",
    "emailInvalid",
    "emailRequired",
    "fullNameRequired",
    "phoneLength",
    "phoneRequired",
    "provinceRequired",
    "wardRequired",
  ]),
);
