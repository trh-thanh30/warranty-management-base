"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreatePublicWarrantyActivationRequestBody,
  WarrantyActivationRequestSummary,
} from "@repo/shared";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, type WheelEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/common/form";
import { formControlFocusClassName } from "@/src/components/common/form-control.constants";
import {
  getWarrantyActivationErrorKind,
  type WarrantyActivationErrorKind,
} from "@/src/hooks/use-warranty-activation-request";
import { useVietnamProvinces } from "@/src/hooks/use-vietnam-provinces";
import { useVietnamWards } from "@/src/hooks/use-vietnam-wards";
import {
  createWarrantyActivationFormSchema,
  type WarrantyActivationFormValues,
} from "../warranty-activation-form.schema";
import { toWarrantyActivationRequestBody } from "../warranty-activation.utils";

type WarrantyActivationRequestFormProps = {
  errorKind: WarrantyActivationErrorKind | null;
  isPending: boolean;
  onResetError: () => void;
  onSubmit: (
    body: CreatePublicWarrantyActivationRequestBody,
  ) => Promise<WarrantyActivationRequestSummary>;
};

const defaultValues: WarrantyActivationFormValues = {
  addressDetail: "",
  customerEmail: "",
  customerName: "",
  customerPhone: "",
  provinceCode: "",
  vehiclePlate: "",
  wardCode: "",
  warrantyCode: "",
};

export function WarrantyActivationRequestForm({
  errorKind,
  isPending,
  onResetError,
  onSubmit,
}: WarrantyActivationRequestFormProps) {
  const t = useTranslations("Warranty.activate");
  const schema = useMemo(
    () =>
      createWarrantyActivationFormSchema({
        addressRequired: t("validation.addressRequired"),
        customerEmailInvalid: t("validation.customerEmailInvalid"),
        customerEmailRequired: t("validation.customerEmailRequired"),
        customerNameInvalid: t("validation.customerNameInvalid"),
        customerPhoneInvalid: t("validation.customerPhoneInvalid"),
        provinceRequired: t("validation.provinceRequired"),
        vehiclePlateInvalid: t("validation.vehiclePlateInvalid"),
        wardRequired: t("validation.wardRequired"),
        warrantyCodeInvalid: t("validation.warrantyCodeInvalid"),
      }),
    [t],
  );
  const form = useForm<WarrantyActivationFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  });
  const provinceCode = form.watch("provinceCode");
  const provinceCodeNumber = provinceCode ? Number(provinceCode) : null;
  const provincesQuery = useVietnamProvinces();
  const wardsQuery = useVietnamWards(provinceCodeNumber);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (errorKind) onResetError();
    });

    return () => subscription.unsubscribe();
  }, [errorKind, form, onResetError]);

  const handleSubmit = async (values: WarrantyActivationFormValues) => {
    const province = provincesQuery.data.find(
      (item) => String(item.code) === values.provinceCode,
    );
    const ward = wardsQuery.data.find(
      (item) => String(item.code) === values.wardCode,
    );

    if (!province) {
      form.setError("provinceCode", {
        message: t("validation.provinceRequired"),
      });
      return;
    }

    if (!ward) {
      form.setError("wardCode", {
        message: t("validation.wardRequired"),
      });
      return;
    }

    try {
      await onSubmit(
        toWarrantyActivationRequestBody({
          provinces: provincesQuery.data,
          values,
          wards: wardsQuery.data,
        }),
      );
      toast.success(t("success.title"));
      form.reset();
    } catch (error) {
      toast.error(t(`errors.${getWarrantyActivationErrorKind(error)}`));
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.customerName.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="name"
                    className={`h-12 rounded-md border-border-gray bg-white ${formControlFocusClassName}`}
                    maxLength={120}
                    placeholder={t("fields.customerName.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.phone.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="tel"
                    className={`h-12 rounded-md border-border-gray bg-white ${formControlFocusClassName}`}
                    inputMode="tel"
                    maxLength={32}
                    placeholder={t("fields.phone.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.customerEmail.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="email"
                    className={`h-12 rounded-md border-border-gray bg-white ${formControlFocusClassName}`}
                    maxLength={160}
                    placeholder={t("fields.customerEmail.placeholder")}
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehiclePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.carPlate.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    className={`h-12 rounded-md border-border-gray bg-white uppercase ${formControlFocusClassName}`}
                    maxLength={32}
                    placeholder={t("fields.carPlate.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="warrantyCode"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.stampCode.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    className={`h-12 rounded-md border-border-gray bg-white font-mono uppercase ${formControlFocusClassName}`}
                    maxLength={64}
                    placeholder={t("fields.stampCode.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="provinceCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.province.label")}
                </FormLabel>
                <Select
                  disabled={provincesQuery.isLoading || provincesQuery.isError}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("wardCode", "");
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className={`h-12 rounded-md border-border-gray bg-white ${formControlFocusClassName}`}
                    >
                      <SelectValue
                        placeholder={
                          provincesQuery.isLoading
                            ? t("fields.province.loading")
                            : t("fields.province.placeholder")
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    onWheelCapture={handleLocationSelectWheel}
                    viewportClassName="h-auto max-h-72 overflow-y-auto"
                  >
                    {provincesQuery.data.map((province) => (
                      <SelectItem
                        key={province.code}
                        value={String(province.code)}
                      >
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {provincesQuery.isError ? (
                  <LocationLoadError
                    label={t("fields.province.loadError")}
                    retryLabel={t("fields.retry")}
                    onRetry={() => void provincesQuery.refetch()}
                  />
                ) : (
                  <FormMessage />
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="wardCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.ward.label")}
                </FormLabel>
                <Select
                  disabled={
                    !provinceCode || wardsQuery.isLoading || wardsQuery.isError
                  }
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className={`h-12 rounded-md border-border-gray bg-white ${formControlFocusClassName}`}
                    >
                      <SelectValue
                        placeholder={
                          wardsQuery.isLoading
                            ? t("fields.ward.loading")
                            : t("fields.ward.placeholder")
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    onWheelCapture={handleLocationSelectWheel}
                    viewportClassName="h-auto max-h-72 overflow-y-auto"
                  >
                    {wardsQuery.data.map((ward) => (
                      <SelectItem key={ward.code} value={String(ward.code)}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {wardsQuery.isError ? (
                  <LocationLoadError
                    label={t("fields.ward.loadError")}
                    retryLabel={t("fields.retry")}
                    onRetry={() => void wardsQuery.refetch()}
                  />
                ) : (
                  <FormMessage />
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addressDetail"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-sm font-semibold uppercase text-deep-black">
                  {t("fields.addressDetail.label")}
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="street-address"
                    className={`h-12 rounded-md border-border-gray bg-white ${formControlFocusClassName}`}
                    maxLength={255}
                    placeholder={t("fields.addressDetail.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-premium-red text-sm font-semibold uppercase text-white shadow-md transition-colors hover:bg-warm-red"
          disabled={isPending}
          type="submit"
        >
          <span>{isPending ? t("submitting") : t("submit")}</span>
          <Send className="size-4" />
        </Button>

        {errorKind ? (
          <p role="alert" className="text-sm font-medium text-premium-red">
            {t(`errors.${errorKind}`)}
          </p>
        ) : null}
      </form>
    </Form>
  );
}

function LocationLoadError({
  label,
  onRetry,
  retryLabel,
}: {
  label: string;
  onRetry: () => void;
  retryLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-premium-red">
      <span>{label}</span>
      <button
        className="font-semibold underline underline-offset-4"
        onClick={onRetry}
        type="button"
      >
        {retryLabel}
      </button>
    </div>
  );
}

function handleLocationSelectWheel(event: WheelEvent<HTMLDivElement>) {
  const viewport = event.currentTarget.querySelector<HTMLElement>(
    "[data-radix-select-viewport]",
  );

  if (!viewport) return;

  viewport.scrollTop += event.deltaY;
  event.stopPropagation();
}
