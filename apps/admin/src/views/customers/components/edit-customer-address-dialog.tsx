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
import { useToast } from "@/src/hooks/use-toast";
import { getLocalizedApiError } from "@/src/lib/localized-api-error.utils";
import { createFieldErrorFormatter, parseVietnamAddress } from "@/src/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CustomerSummary } from "@repo/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  buildCustomerAddress,
  deduplicateAddressSuffix,
} from "../customers.utils";
import {
  customerAddressFormSchema,
  type CustomerAddressFormValues,
} from "../customers.types";
import { useUpdateCustomer } from "../hooks/use-customers";

type EditCustomerAddressDialogProps = {
  customer: CustomerSummary | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (customer: CustomerSummary) => void;
  open: boolean;
};

const EMPTY_ADDRESS: CustomerAddressFormValues = {
  addressDetail: "",
  provinceCode: "",
  provinceName: "",
  wardCode: "",
  wardName: "",
};

export function EditCustomerAddressDialog({
  customer,
  onOpenChange,
  onSaved,
  open,
}: EditCustomerAddressDialogProps) {
  const t = useTranslations("Customers");
  const tApiErrors = useTranslations("ApiErrors");
  const toast = useToast();
  const updateCustomer = useUpdateCustomer(customer?.id ?? null);
  const [pendingWardName, setPendingWardName] = useState<string | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<CustomerAddressFormValues>({
    defaultValues: EMPTY_ADDRESS,
    resolver: zodResolver(customerAddressFormSchema),
  });
  const provinceCode = watch("provinceCode");
  const wardCode = watch("wardCode");
  const provinceCodeNumber = provinceCode ? Number(provinceCode) : null;
  const provincesQuery = useVietnamProvinces({ enabled: open });
  const wardsQuery = useVietnamWards(provinceCodeNumber, { enabled: open });
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
    if (!open || !customer || provinces.length === 0) return;

    const address = parseVietnamAddress(customer.address ?? "", provinces);
    reset({
      addressDetail: address.detail,
      provinceCode: address.province ? String(address.province.code) : "",
      provinceName: address.province?.name ?? "",
      wardCode: "",
      wardName: "",
    });
    setPendingWardName(address.wardName ?? null);
  }, [customer, open, provinces, reset]);

  useEffect(() => {
    if (!pendingWardName || wards.length === 0) return;

    const ward = wards.find((item) => pendingWardName.includes(item.name));
    if (!ward) return;

    setValue("wardCode", String(ward.code), { shouldValidate: true });
    setValue("wardName", ward.name, { shouldValidate: true });
    setPendingWardName(null);
  }, [pendingWardName, setValue, wards]);

  async function submit(values: CustomerAddressFormValues) {
    if (!customer) return;

    try {
      const updatedCustomer = await updateCustomer.mutateAsync({
        address: buildCustomerAddress(values),
      });
      toast.success(t("addressUpdated"));
      onSaved(updatedCustomer);
      onOpenChange(false);
    } catch (error) {
      const message = getLocalizedApiError(error, t, {
        apiErrors: tApiErrors,
      });
      setError("root", { message });
      toast.error(message);
    }
  }

  const saving = isSubmitting || updateCustomer.isPending;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl">
        <header>
          <DialogTitle>{t("editAddressTitle")}</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("editAddressDescription", {
              name: customer?.fullName ?? "",
            })}
          </DialogDescription>
        </header>

        <form className="space-y-5" noValidate onSubmit={handleSubmit(submit)}>
          {errors.root?.message ? (
            <div
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
              role="alert"
            >
              {errors.root.message}
            </div>
          ) : null}

          <input type="hidden" {...register("addressDetail")} />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              error={formatFieldError(errors.provinceCode?.message, t)}
              id="edit-customer-address-province"
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
                      field.onChange(value);
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
                      id="edit-customer-address-province"
                      loading={provincesQuery.isLoading}
                      loadingLabel={t("loadingProvinces")}
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
              id="edit-customer-address-ward"
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
                      field.onChange(value);
                      setValue("wardName", ward?.name ?? "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    value={field.value}
                  >
                    <ComboboxTrigger
                      id="edit-customer-address-ward"
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
                          <ComboboxItem
                            key={ward.code}
                            value={String(ward.code)}
                          >
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

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("addressPreview")}:{" "}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {deduplicateAddressSuffix(
                buildCustomerAddress({
                  addressDetail: watch("addressDetail"),
                  provinceName: watch("provinceName"),
                  wardName: watch("wardName"),
                }),
              ) || "-"}
            </span>
          </p>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
            <Button
              disabled={saving}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="secondary"
            >
              {t("cancel")}
            </Button>
            <Button disabled={saving} type="submit">
              {saving ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : null}
              {saving ? t("saving") : t("saveAddress")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const formatFieldError = createFieldErrorFormatter(
  new Set(["provinceRequired", "wardRequired"]),
);
