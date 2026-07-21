"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type {
  CustomerSummary,
  ProductResponse,
  CreateWarrantyActivationRequestBody,
} from "@repo/shared";
import { HttpClientError } from "@repo/shared";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DatePicker,
  Input,
  Label,
  Textarea,
} from "@repo/ui";
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
import { useToast } from "@/src/hooks/use-toast";
import { useCreateWarrantyActivationRequest } from "@/src/hooks/use-warranty-activation-requests";
import type { VietnamProvince } from "@/src/services/locations/locations.types";
import { formatProductSearchOption } from "@/src/utils";
import { useCustomers } from "../../customers/hooks/use-customers";
import { useProducts } from "../../products/hooks/use-products";
import type { WarrantyActivationRequestCreateFormValues } from "../warranty-activation-requests.types";

const createRequestSchema = z.object({
  addressDetail: z.string().trim().min(1, "addressRequired").max(255),
  customerBirthdate: z.string().trim(),
  customerEmail: z.string().trim().email("emailInvalid").max(160),
  customerName: z.string().trim().min(2, "customerNameRequired").max(120),
  customerPhone: z.string().trim().min(6, "phoneInvalid").max(32),
  note: z.string().trim().max(1000, "noteLength"),
  productId: z.string().trim().min(1, "productRequired"),
  productName: z.string().trim().min(1, "productRequired"),
  provinceCode: z.string().trim().min(1, "provinceRequired"),
  wardCode: z.string().trim().min(1, "wardRequired"),
  warrantyCode: z.string().trim().min(1, "warrantyCodeRequired"),
});

type CreateWarrantyActivationRequestFormCardProps = {
  onCancel: () => void;
  onCreated: () => void;
};

export function CreateWarrantyActivationRequestFormCard({
  onCancel,
  onCreated,
}: CreateWarrantyActivationRequestFormCardProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const toast = useToast();
  const createMutation = useCreateWarrantyActivationRequest();
  const [pendingWardName, setPendingWardName] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<WarrantyActivationRequestCreateFormValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      addressDetail: "",
      customerBirthdate: "",
      customerEmail: "",
      customerName: "",
      customerPhone: "",
      note: "",
      productId: "",
      productName: "",
      provinceCode: "",
      wardCode: "",
      warrantyCode: "",
    },
  });
  const provinceCode = watch("provinceCode");
  const wardCode = watch("wardCode");
  const provinceCodeNumber = provinceCode ? Number(provinceCode) : null;
  const provincesQuery = useVietnamProvinces();
  const wardsQuery = useVietnamWards(provinceCodeNumber);
  const customersQuery = useCustomers({
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const productsQuery = useProducts({
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "ACTIVE",
  });
  const provinces = useMemo(
    () => provincesQuery.data ?? [],
    [provincesQuery.data],
  );
  const wards = useMemo(() => wardsQuery.data ?? [], [wardsQuery.data]);
  const customers = useMemo(
    () => customersQuery.data?.items ?? [],
    [customersQuery.data?.items],
  );
  const products = useMemo(
    () =>
      (productsQuery.data?.items ?? []).filter(
        (product) => product.warrantyCode !== null,
      ),
    [productsQuery.data?.items],
  );
  const selectedProvince = provinces.find(
    (province) => String(province.code) === provinceCode,
  );
  const selectedWard = wards.find((ward) => String(ward.code) === wardCode);

  useEffect(() => {
    if (!pendingWardName || wards.length === 0) return;

    const ward = wards.find((item) => pendingWardName.includes(item.name));
    if (!ward) return;

    setValue("wardCode", String(ward.code), {
      shouldDirty: true,
      shouldValidate: true,
    });
    setPendingWardName(null);
  }, [pendingWardName, setValue, wards]);

  function applyCustomer(customer: CustomerSummary) {
    const address = parseCustomerAddress(customer.address ?? "", provinces);
    setSelectedCustomer(customer);
    setValue("customerName", customer.fullName ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("customerPhone", customer.phone ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("customerEmail", customer.email ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("addressDetail", address.detail, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (address.province) {
      setValue("provinceCode", String(address.province.code), {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("wardCode", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      setPendingWardName(address.wardName ?? null);
    }
  }

  function applyProduct(product: ProductResponse) {
    if (!product.warrantyCode) return;

    setSelectedProduct(product);
    setValue("productId", product.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("productName", product.name, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("warrantyCode", product.warrantyCode, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function submit(values: WarrantyActivationRequestCreateFormValues) {
    try {
      await createMutation.mutateAsync(toRequestBody(values));
      toast.success(t("created"));
      onCreated();
    } catch (error) {
      const message = resolveCreateErrorMessage(error, t);
      setError("root", { message });
      toast.error(message);
    }
  }

  function toRequestBody(
    values: WarrantyActivationRequestCreateFormValues,
  ): CreateWarrantyActivationRequestBody {
    const province = provinces.find(
      (item) => String(item.code) === values.provinceCode,
    );
    const ward = wards.find((item) => String(item.code) === values.wardCode);

    return {
      addressDetail: values.addressDetail.trim(),
      brand: selectedProduct?.brand ?? undefined,
      customerBirthdate: values.customerBirthdate || undefined,
      customerEmail: values.customerEmail.trim(),
      customerName: values.customerName.trim(),
      customerPhone: values.customerPhone.trim(),
      manufactureYear: selectedProduct?.manufactureYear ?? undefined,
      model: selectedProduct?.model ?? undefined,
      note: values.note.trim() || undefined,
      productName: selectedProduct?.name ?? values.productName.trim(),
      provinceCode: values.provinceCode,
      provinceName: province?.name ?? "",
      serialNumber: selectedProduct?.serialNumber ?? undefined,
      wardCode: values.wardCode,
      wardName: ward?.name ?? "",
      warrantyCode: values.warrantyCode.trim().toUpperCase(),
    };
  }

  return (
    <Card className="min-w-0 w-full max-w-full">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>{t("createTitle")}</CardTitle>
        <CardDescription className="mt-1.5">
          {t("createDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form className="space-y-6" noValidate onSubmit={handleSubmit(submit)}>
          {errors.root?.message ? (
            <div
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
              role="alert"
            >
              {errors.root.message}
            </div>
          ) : null}

          <Section
            description={t("createProductDescription")}
            title={t("productInfo")}
          >
            <Field
              error={formatFieldError(errors.productId?.message, t)}
              id="create-activation-request-product"
              label={t("productSearch")}
            >
              <Combobox
                disabled={productsQuery.isLoading}
                onValueChange={(value) => {
                  const product = products.find((item) => item.id === value);
                  if (product) applyProduct(product);
                }}
                value={selectedProduct?.id ?? ""}
              >
                <ComboboxTrigger
                  id="create-activation-request-product"
                  placeholder={t("productSearchPlaceholder")}
                  selectedLabel={
                    selectedProduct
                      ? formatProductSearchOption(selectedProduct)
                      : undefined
                  }
                />
                <ComboboxContent>
                  <ComboboxInput
                    placeholder={t("search")}
                    showTrigger={false}
                  />
                  <ComboboxList>
                    <ComboboxEmpty>{t("noProduct")}</ComboboxEmpty>
                    {products.map((product) => (
                      <ComboboxItem key={product.id} value={product.id}>
                        {formatProductSearchOption(product)}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                error={formatFieldError(errors.warrantyCode?.message, t)}
                id="create-activation-request-warranty-code"
                label={t("warrantyCode")}
              >
                <Input
                  id="create-activation-request-warranty-code"
                  placeholder={t("warrantyCodeManualPlaceholder")}
                  readOnly
                  className={readOnlyClassName}
                  {...register("warrantyCode")}
                />
              </Field>
              <Field
                error={formatFieldError(errors.productName?.message, t)}
                id="create-activation-request-product-name"
                label={t("product")}
              >
                <Input
                  id="create-activation-request-product-name"
                  readOnly
                  className={readOnlyClassName}
                  {...register("productName")}
                />
              </Field>
            </div>
          </Section>

          <Section
            description={t("createCustomerDescription")}
            title={t("customerInfo")}
          >
            <Field
              id="create-activation-request-customer"
              label={t("customerSearch")}
            >
              <Combobox
                disabled={customersQuery.isLoading}
                onValueChange={(value) => {
                  const customer = customers.find((item) => item.id === value);
                  if (customer) applyCustomer(customer);
                }}
                value={selectedCustomer?.id ?? ""}
              >
                <ComboboxTrigger
                  id="create-activation-request-customer"
                  placeholder={t("customerSearchPlaceholder")}
                  selectedLabel={
                    selectedCustomer
                      ? formatCustomerOption(selectedCustomer)
                      : undefined
                  }
                />
                <ComboboxContent>
                  <ComboboxInput
                    placeholder={t("search")}
                    showTrigger={false}
                  />
                  <ComboboxList>
                    <ComboboxEmpty>{t("noCustomer")}</ComboboxEmpty>
                    {customers.map((customer) => (
                      <ComboboxItem key={customer.id} value={customer.id}>
                        {formatCustomerOption(customer)}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                error={formatFieldError(errors.customerName?.message, t)}
                id="create-activation-request-customer-name"
                label={t("customerName")}
              >
                <Input
                  id="create-activation-request-customer-name"
                  readOnly
                  className={readOnlyClassName}
                  {...register("customerName")}
                />
              </Field>
              <Field
                error={formatFieldError(errors.customerPhone?.message, t)}
                id="create-activation-request-customer-phone"
                label={t("phone")}
              >
                <Input
                  id="create-activation-request-customer-phone"
                  readOnly
                  className={readOnlyClassName}
                  {...register("customerPhone")}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                error={formatFieldError(errors.customerEmail?.message, t)}
                id="create-activation-request-customer-email"
                label={t("email")}
              >
                <Input
                  id="create-activation-request-customer-email"
                  readOnly
                  className={readOnlyClassName}
                  type="email"
                  {...register("customerEmail")}
                />
              </Field>
              <Field
                id="create-activation-request-customer-birthdate"
                label={t("birthdate")}
              >
                <Controller
                  control={control}
                  name="customerBirthdate"
                  render={({ field }) => (
                    <DatePicker
                      ariaLabel={t("birthdate")}
                      id="create-activation-request-customer-birthdate"
                      onValueChange={field.onChange}
                      placeholder={t("selectBirthdate")}
                      value={field.value}
                    />
                  )}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                error={formatFieldError(errors.provinceCode?.message, t)}
                id="create-activation-request-province"
                label={t("province")}
              >
                <Controller
                  control={control}
                  name="provinceCode"
                  render={({ field }) => (
                    <Combobox
                      disabled={provincesQuery.isLoading}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue("wardCode", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      value={field.value}
                    >
                      <ComboboxTrigger
                        id="create-activation-request-province"
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
                id="create-activation-request-ward"
                label={t("ward")}
              >
                <Controller
                  control={control}
                  name="wardCode"
                  render={({ field }) => (
                    <Combobox
                      disabled={!provinceCode || wardsQuery.isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <ComboboxTrigger
                        id="create-activation-request-ward"
                        placeholder={t("wardPlaceholder")}
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
              </Field>
            </div>

            <Field
              error={formatFieldError(errors.addressDetail?.message, t)}
              id="create-activation-request-address"
              label={t("addressDetail")}
            >
              <Input
                id="create-activation-request-address"
                placeholder={t("addressDetailPlaceholder")}
                {...register("addressDetail")}
              />
            </Field>
          </Section>

          <Section description={t("createNoteDescription")} title={t("note")}>
            <Field
              error={formatFieldError(errors.note?.message, t)}
              id="create-activation-request-note"
              label={t("note")}
            >
              <Textarea
                id="create-activation-request-note"
                placeholder={t("notePlaceholder")}
                rows={3}
                {...register("note")}
              />
            </Field>
          </Section>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              disabled={isSubmitting || createMutation.isPending}
              onClick={onCancel}
              type="button"
              variant="secondary"
            >
              {t("cancel")}
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={isSubmitting || createMutation.isPending}
              type="submit"
            >
              {createMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {createMutation.isPending ? t("saving") : t("createSubmit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Section({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
        <hr className="mt-4 border-slate-200 dark:border-slate-800" />
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  children,
  error,
  id,
  label,
}: {
  children: React.ReactNode;
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

function formatCustomerOption(customer: CustomerSummary) {
  return [
    customer.fullName,
    customer.phone,
    customer.email,
    customer.customerCode,
  ]
    .filter(Boolean)
    .join(" · ");
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

function formatFieldError(
  message: string | undefined,
  t: (key: string) => string,
) {
  if (!message) return undefined;

  const translationKeys = new Set([
    "addressRequired",
    "customerNameRequired",
    "emailInvalid",
    "noteLength",
    "phoneInvalid",
    "productRequired",
    "provinceRequired",
    "wardRequired",
    "warrantyCodeRequired",
  ]);

  return translationKeys.has(message) ? t(message) : message;
}

function resolveCreateErrorMessage(error: unknown, t: (key: string) => string) {
  if (!(error instanceof HttpClientError)) return t("saveError");

  const details = error.details;
  const detailCode =
    details && typeof details === "object" && "code" in details
      ? String(details.code)
      : undefined;
  const errorKey = detailCode ? `apiErrors.${detailCode}` : undefined;
  const knownApiErrorCodes = new Set([
    "ACTIVATION_REQUEST_ALREADY_PENDING",
    "ACTIVATION_REQUEST_CREATE_FAILED",
    "CUSTOMER_OWNER_MISMATCH",
    "WARRANTY_CODE_NOT_FOUND",
    "WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION",
  ]);

  if (detailCode && knownApiErrorCodes.has(detailCode) && errorKey) {
    return t(errorKey);
  }

  return error.message || t("saveError");
}

const readOnlyClassName =
  "bg-slate-50 text-slate-700 focus:border-slate-300 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-slate-700";
