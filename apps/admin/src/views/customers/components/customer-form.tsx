"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerSummary } from "@repo/shared";
import { Button, Input, Label, Textarea } from "@repo/ui";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/src/components/common/combobox";
import {
  useVietnamProvinces,
  useVietnamWards,
} from "@/src/hooks/use-locations";
import type { VietnamProvince } from "@/src/services/locations/locations.types";
import { useCustomerForm } from "../hooks/use-customer-form";

type CustomerFormProps = {
  customer: CustomerSummary | null;
  onCancel: () => void;
  onSaved: () => void;
};

export function CustomerForm({
  customer,
  onCancel,
  onSaved,
}: CustomerFormProps) {
  const t = useTranslations("Customers");
  const [hydratedAddressKey, setHydratedAddressKey] = useState<string | null>(
    null,
  );
  const [pendingWardName, setPendingWardName] = useState<string | null>(null);
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

    const parsedAddress = parseCustomerAddress(customer.address, provinces);
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
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
        </Field>

        <Field
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
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
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
        </Field>

        <Field
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
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
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
        </Field>

        <Field
          error={formatFieldError(errors.wardCode?.message, t)}
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
        </Field>
      </div>

      <Field
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
      </Field>

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
          {creating ? t("create") : t("save")}
        </Button>
      </div>
    </form>
  );
}

function formatFieldError(
  message: string | undefined,
  t: (key: string) => string,
) {
  if (!message) return undefined;

  const translationKeys = new Set([
    "customerCodeLength",
    "addressRequired",
    "emailInvalid",
    "emailRequired",
    "fullNameRequired",
    "phoneLength",
    "phoneRequired",
    "provinceRequired",
    "wardRequired",
  ]);

  return translationKeys.has(message) ? t(message) : message;
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

function parseCustomerAddress(address: string, provinces: VietnamProvince[]) {
  const province = provinces.find((item) => address.includes(item.name));
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const provinceName = province?.name;
  const provinceIndex = provinceName ? parts.indexOf(provinceName) : -1;
  const wardName =
    provinceIndex > 0
      ? parts[provinceIndex - 1]
      : parts.length >= 2
        ? parts.at(-2)
        : null;
  const detail = parts
    .filter((part) => part !== provinceName && part !== wardName)
    .join(", ");

  return {
    detail: detail || address,
    province,
    wardName,
  };
}
