"use client";

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
import { useManualWarrantyActivation } from "@/src/hooks/use-warranties";
import type { VietnamProvince } from "@/src/services/locations/locations.types";
import { toOptionalValue } from "@/src/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HttpClientError,
  type CustomerSummary,
  type ManualWarrantyActivationBody,
  type ProductResponse,
} from "@repo/shared";
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from "@repo/ui";
import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, type UseFormSetError } from "react-hook-form";
import { useCategories } from "../../categories/hooks/use-categories";
import { CustomerForm } from "../../customers/components/customer-form";
import { useCustomers } from "../../customers/hooks/use-customers";
import { ProductForm } from "../../products/components/product-form";
import { useProducts } from "../../products/hooks/use-products";
import { PRODUCT_CATEGORIES } from "../../products/products.constants";
import {
  warrantyActivationFormSchema,
  type WarrantyActivationFormInput,
  type WarrantyActivationFormValues,
} from "../warranty-activations.types";

type WarrantyActivationFormCardProps = {
  onCancel: () => void;
  onSaved: () => void;
};

export function WarrantyActivationFormCard({
  onCancel,
  onSaved,
}: WarrantyActivationFormCardProps) {
  const t = useTranslations("WarrantyActivations");
  const toast = useToast();
  const manualActivation = useManualWarrantyActivation();
  const [pendingWardName, setPendingWardName] = useState<string | null>(null);
  const [quickCustomerOpen, setQuickCustomerOpen] = useState(false);
  const [quickProductOpen, setQuickProductOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);
  const [selectedProductSnapshot, setSelectedProductSnapshot] =
    useState<ProductResponse | null>(null);
  const [ownerWarningOpen, setOwnerWarningOpen] = useState(false);
  const [pendingActivationValues, setPendingActivationValues] =
    useState<WarrantyActivationFormValues | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<
    WarrantyActivationFormInput,
    unknown,
    WarrantyActivationFormValues
  >({
    resolver: zodResolver(warrantyActivationFormSchema),
    defaultValues: {
      activatedAt: new Date().toISOString().slice(0, 10),
      addressDetail: "",
      brand: "",
      category: "CAR",
      categoryId: "",
      customerEmail: "",
      customerName: "",
      customerPhone: "",
      description: "",
      durationMonths: 36,
      manufactureYear: undefined,
      model: "",
      productId: "",
      productName: "",
      provinceCode: "",
      purchaseDate: "",
      serialNumber: "",
      terms: "",
      wardCode: "",
      warrantyCode: "",
    },
  });
  const provinceCode = watch("provinceCode");
  const provinceCodeNumber = provinceCode ? Number(provinceCode) : null;
  const selectedProductId = watch("productId");
  const provincesQuery = useVietnamProvinces();
  const wardsQuery = useVietnamWards(provinceCodeNumber);
  const customersQuery = useCustomers({ limit: 50, sortBy: "createdAt" });
  const productsQuery = useProducts({ limit: 50, sortBy: "createdAt" });
  const categoriesQuery = useCategories({
    isActive: "true",
    limit: 100,
    sortBy: "order",
    sortOrder: "asc",
    type: "PRODUCT",
  });
  const provinces = useMemo(
    () => provincesQuery.data ?? [],
    [provincesQuery.data],
  );
  const wards = useMemo(() => wardsQuery.data ?? [], [wardsQuery.data]);
  const categories = useMemo(
    () => categoriesQuery.data?.items ?? [],
    [categoriesQuery.data?.items],
  );
  const customers = useMemo(
    () => customersQuery.data?.items ?? [],
    [customersQuery.data?.items],
  );
  const products = useMemo(
    () => productsQuery.data?.items ?? [],
    [productsQuery.data?.items],
  );
  const selectedProvince = provinces.find(
    (province) => String(province.code) === provinceCode,
  );
  const selectedWard = wards.find(
    (ward) => String(ward.code) === watch("wardCode"),
  );
  const selectedProduct =
    selectedProductSnapshot ??
    products.find((product) => product.id === selectedProductId) ??
    null;
  const productFieldsReadOnly = true;
  const customerFieldsReadOnly = true;

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
    setSelectedProductSnapshot(product);
    setValue("productId", product.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("productName", product.name, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("category", product.category, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("categoryId", product.categoryId ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("brand", product.brand ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("model", product.model ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("serialNumber", product.serialNumber ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("manufactureYear", product.manufactureYear ?? undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("description", product.description ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("warrantyCode", product.warrantyCode, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (product.warranty?.durationMonths) {
      setValue("durationMonths", product.warranty.durationMonths, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (product.owner?.purchaseDate) {
      setValue("purchaseDate", product.owner.purchaseDate.slice(0, 10), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (product.warranty?.terms) {
      setValue("terms", product.warranty.terms, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function handleQuickCustomerSaved(customer?: CustomerSummary) {
    if (customer) applyCustomer(customer);
    setQuickCustomerOpen(false);
  }

  function handleQuickProductSaved(product?: ProductResponse) {
    if (product) applyProduct(product);
    setQuickProductOpen(false);
  }

  async function submit(values: WarrantyActivationFormValues) {
    if (selectedProduct?.owner) {
      setPendingActivationValues(values);
      setOwnerWarningOpen(true);
      return;
    }

    await saveActivation(values);
  }

  async function saveActivation(values: WarrantyActivationFormValues) {
    try {
      await manualActivation.mutateAsync(toActivationBody(values));
      toast.success(t("created"));
      onSaved();
    } catch (error) {
      const handledMessage = handleActivationError(error, setError, t);
      if (handledMessage) {
        toast.error(handledMessage);
        return;
      }

      const message =
        error instanceof HttpClientError ? error.message : t("saveError");
      setError("root", { message });
      toast.error(message);
    }
  }

  function toActivationBody(
    values: WarrantyActivationFormValues,
  ): ManualWarrantyActivationBody {
    const province = provinces.find(
      (item) => String(item.code) === values.provinceCode,
    );
    const ward = wards.find((item) => String(item.code) === values.wardCode);
    const address = [values.addressDetail.trim(), ward?.name, province?.name]
      .filter(Boolean)
      .join(", ");

    return {
      customer: {
        address,
        email: values.customerEmail.trim(),
        fullName: values.customerName.trim(),
        phone: values.customerPhone.trim(),
      },
      product: {
        id: toOptionalValue(values.productId),
        brand: toOptionalValue(values.brand),
        category: values.category,
        categoryId: toOptionalValue(values.categoryId),
        description: toOptionalValue(values.description),
        manufactureYear: values.manufactureYear,
        model: toOptionalValue(values.model),
        name: values.productName.trim(),
        serialNumber: toOptionalValue(values.serialNumber),
      },
      warranty: {
        activatedAt: values.activatedAt,
        durationMonths: values.durationMonths,
        purchaseDate: toOptionalValue(values.purchaseDate),
        terms: toOptionalValue(values.terms),
        warrantyCode: toOptionalValue(values.warrantyCode)?.toUpperCase(),
      },
    };
  }

  return (
    <>
      <form
        className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        noValidate
        onSubmit={handleSubmit(submit)}
      >
        {errors.root?.message ? (
          <div
            className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
            role="alert"
          >
            {errors.root.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-8">
          <Section description={t("customerDescription")} title={t("customer")}>
            <Field id="activation-customer-search" label={t("customerSearch")}>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <Combobox
                    disabled={customersQuery.isLoading}
                    onValueChange={(value) => {
                      const customer = customers.find(
                        (item) => item.id === value,
                      );
                      if (customer) applyCustomer(customer);
                    }}
                    value={selectedCustomer?.id ?? ""}
                  >
                    <ComboboxTrigger
                      id="activation-customer-search"
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
                </div>
                <Button
                  aria-label={t("quickCreateCustomer")}
                  className="shrink-0"
                  onClick={() => setQuickCustomerOpen(true)}
                  size="icon"
                  title={t("quickCreateCustomer")}
                  type="button"
                  variant="secondary"
                >
                  <Plus
                    className="size-5 text-slate-700 dark:text-slate-200"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                error={formatFieldError(errors.customerName?.message, t)}
                id="activation-customer-name"
                label={t("customerName")}
              >
                <Input
                  id="activation-customer-name"
                  placeholder={t("customerNamePlaceholder")}
                  readOnly={customerFieldsReadOnly}
                  className={customerFieldsReadOnly ? readOnlyClassName : ""}
                  {...register("customerName")}
                />
              </Field>
              <Field
                error={formatFieldError(errors.customerPhone?.message, t)}
                id="activation-customer-phone"
                label={t("customerPhone")}
              >
                <Input
                  id="activation-customer-phone"
                  placeholder={t("customerPhonePlaceholder")}
                  readOnly={customerFieldsReadOnly}
                  className={customerFieldsReadOnly ? readOnlyClassName : ""}
                  {...register("customerPhone")}
                />
              </Field>
            </div>
            <Field
              error={formatFieldError(errors.customerEmail?.message, t)}
              id="activation-customer-email"
              label={t("customerEmail")}
            >
              <Input
                id="activation-customer-email"
                placeholder={t("customerEmailPlaceholder")}
                readOnly={customerFieldsReadOnly}
                className={customerFieldsReadOnly ? readOnlyClassName : ""}
                type="email"
                {...register("customerEmail")}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                error={formatFieldError(errors.provinceCode?.message, t)}
                id="activation-province"
                label={t("province")}
              >
                <Controller
                  control={control}
                  name="provinceCode"
                  render={({ field }) => (
                    <Combobox
                      disabled={
                        customerFieldsReadOnly || provincesQuery.isLoading
                      }
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
                        id="activation-province"
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
                id="activation-ward"
                label={t("ward")}
              >
                <Controller
                  control={control}
                  name="wardCode"
                  render={({ field }) => (
                    <Combobox
                      disabled={
                        customerFieldsReadOnly ||
                        !provinceCode ||
                        wardsQuery.isLoading
                      }
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <ComboboxTrigger
                        id="activation-ward"
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
              id="activation-address-detail"
              label={t("addressDetail")}
            >
              <Input
                id="activation-address-detail"
                placeholder={t("addressDetailPlaceholder")}
                readOnly={customerFieldsReadOnly}
                className={customerFieldsReadOnly ? readOnlyClassName : ""}
                {...register("addressDetail")}
              />
            </Field>
          </Section>

          <Section description={t("productDescription")} title={t("product")}>
            <Field id="activation-product-search" label={t("productSearch")}>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <Combobox
                    disabled={productsQuery.isLoading}
                    onValueChange={(value) => {
                      const product = products.find(
                        (item) => item.id === value,
                      );
                      if (product) applyProduct(product);
                    }}
                    value={selectedProduct?.id ?? ""}
                  >
                    <ComboboxTrigger
                      id="activation-product-search"
                      placeholder={t("productSearchPlaceholder")}
                      selectedLabel={
                        selectedProduct
                          ? formatProductOption(selectedProduct)
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
                            {formatProductOption(product)}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
                <Button
                  aria-label={t("quickCreateProduct")}
                  className="shrink-0"
                  onClick={() => setQuickProductOpen(true)}
                  size="icon"
                  title={t("quickCreateProduct")}
                  type="button"
                  variant="secondary"
                >
                  <Plus
                    className="size-5 text-slate-700 dark:text-slate-200"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </Field>
            <Field
              error={formatFieldError(errors.productName?.message, t)}
              id="activation-product-name"
              label={t("productName")}
            >
              <Input
                id="activation-product-name"
                placeholder={t("productNamePlaceholder")}
                readOnly={productFieldsReadOnly}
                className={productFieldsReadOnly ? readOnlyClassName : ""}
                {...register("productName")}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="activation-category" label={t("category")}>
                <select
                  aria-disabled={productFieldsReadOnly}
                  className={selectClassName(productFieldsReadOnly)}
                  id="activation-category"
                  tabIndex={productFieldsReadOnly ? -1 : undefined}
                  {...register("category")}
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {t(`categories.${category}`)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="activation-category-id" label={t("dynamicCategory")}>
                <select
                  aria-disabled={
                    productFieldsReadOnly || categoriesQuery.isLoading
                  }
                  className={selectClassName(
                    productFieldsReadOnly || categoriesQuery.isLoading,
                  )}
                  id="activation-category-id"
                  tabIndex={
                    productFieldsReadOnly || categoriesQuery.isLoading
                      ? -1
                      : undefined
                  }
                  {...register("categoryId")}
                >
                  <option value="">{t("noDynamicCategory")}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="activation-brand" label={t("brand")}>
                <Input
                  id="activation-brand"
                  placeholder={t("brandPlaceholder")}
                  readOnly={productFieldsReadOnly}
                  className={productFieldsReadOnly ? readOnlyClassName : ""}
                  {...register("brand")}
                />
              </Field>
              <Field id="activation-model" label={t("model")}>
                <Input
                  id="activation-model"
                  placeholder={t("modelPlaceholder")}
                  readOnly={productFieldsReadOnly}
                  className={productFieldsReadOnly ? readOnlyClassName : ""}
                  {...register("model")}
                />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                error={formatFieldError(errors.serialNumber?.message, t)}
                id="activation-serial-number"
                label={t("serialNumber")}
              >
                <Input
                  id="activation-serial-number"
                  placeholder={t("serialNumberPlaceholder")}
                  readOnly={productFieldsReadOnly}
                  className={productFieldsReadOnly ? readOnlyClassName : ""}
                  {...register("serialNumber")}
                />
              </Field>
              <Field
                error={formatFieldError(errors.manufactureYear?.message, t)}
                id="activation-manufacture-year"
                label={t("manufactureYear")}
              >
                <Input
                  id="activation-manufacture-year"
                  inputMode="numeric"
                  placeholder={t("manufactureYearPlaceholder")}
                  readOnly={productFieldsReadOnly}
                  className={productFieldsReadOnly ? readOnlyClassName : ""}
                  type="number"
                  {...register("manufactureYear")}
                />
              </Field>
            </div>
            <Field id="activation-description" label={t("descriptionLabel")}>
              <Textarea
                id="activation-description"
                placeholder={t("descriptionPlaceholder")}
                readOnly={productFieldsReadOnly}
                className={
                  productFieldsReadOnly ? readOnlyTextareaClassName : ""
                }
                rows={3}
                {...register("description")}
              />
            </Field>
          </Section>

          <Section description={t("warrantyDescription")} title={t("warranty")}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                error={formatFieldError(errors.activatedAt?.message, t)}
                id="activation-activated-at"
                label={t("activatedAt")}
              >
                <Input
                  id="activation-activated-at"
                  type="date"
                  {...register("activatedAt")}
                />
              </Field>
              <Field id="activation-purchase-date" label={t("purchaseDate")}>
                <Input
                  id="activation-purchase-date"
                  type="date"
                  {...register("purchaseDate")}
                />
              </Field>
              <Field
                error={formatFieldError(errors.durationMonths?.message, t)}
                id="activation-duration"
                label={t("durationMonths")}
              >
                <Input
                  id="activation-duration"
                  inputMode="numeric"
                  type="number"
                  {...register("durationMonths")}
                />
              </Field>
              <Field
                error={formatFieldError(errors.warrantyCode?.message, t)}
                id="activation-warranty-code"
                label={t("warrantyCode")}
              >
                <Input
                  id="activation-warranty-code"
                  placeholder={t("warrantyCodePlaceholder")}
                  {...register("warrantyCode")}
                />
              </Field>
            </div>
            <Field
              error={formatFieldError(errors.terms?.message, t)}
              id="activation-terms"
              label={t("terms")}
            >
              <Textarea
                id="activation-terms"
                placeholder={t("termsPlaceholder")}
                rows={4}
                {...register("terms")}
              />
            </Field>
          </Section>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
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
            {isSubmitting ? t("saving") : t("submit")}
          </Button>
        </div>
      </form>

      <Dialog open={quickCustomerOpen} onOpenChange={setQuickCustomerOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-2rem),48rem)] max-w-none overflow-y-auto p-5 sm:p-6">
          <DialogTitle className="text-lg font-semibold">
            {t("quickCreateCustomerTitle")}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("quickCreateCustomerDescription")}
          </DialogDescription>
          <div className="mt-5">
            <CustomerForm
              customer={null}
              onCancel={() => setQuickCustomerOpen(false)}
              onSaved={handleQuickCustomerSaved}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={quickProductOpen} onOpenChange={setQuickProductOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-2rem),56rem)] max-w-none overflow-y-auto p-5 sm:p-6">
          <DialogTitle className="text-lg font-semibold">
            {t("quickCreateProductTitle")}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("quickCreateProductDescription")}
          </DialogDescription>
          <div className="mt-5">
            <ProductForm
              onCancel={() => setQuickProductOpen(false)}
              onSaved={handleQuickProductSaved}
              product={null}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={ownerWarningOpen} onOpenChange={setOwnerWarningOpen}>
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">
            {t("ownerOverrideTitle")}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("ownerOverrideDescription", {
              owner:
                selectedProduct?.owner?.fullName ??
                selectedProduct?.owner?.customerCode ??
                "-",
              product: selectedProduct?.name ?? "",
            })}
          </DialogDescription>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              onClick={() => setOwnerWarningOpen(false)}
              type="button"
              variant="secondary"
            >
              {t("cancel")}
            </Button>
            <Button
              disabled={manualActivation.isPending || !pendingActivationValues}
              onClick={() => {
                if (!pendingActivationValues) return;
                setOwnerWarningOpen(false);
                void saveActivation(pendingActivationValues);
              }}
              type="button"
            >
              {manualActivation.isPending ? t("saving") : t("confirmOverride")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({
  children,
  className,
  description,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  description: string;
  title: string;
}) {
  return (
    <section className={className}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
        <hr className="mt-4 border-slate-200 dark:border-slate-800" />
      </div>
      <div className="space-y-5">{children}</div>
    </section>
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

function formatProductOption(product: ProductResponse) {
  return [
    product.name,
    product.warrantyCode,
    product.serialNumber,
    product.owner?.fullName,
  ]
    .filter(Boolean)
    .join(" · ");
}

const readOnlyClassName =
  "bg-slate-50 text-slate-700 focus:border-slate-300 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-slate-700";

const readOnlyTextareaClassName =
  "bg-slate-50 text-slate-700 focus:border-slate-300 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-slate-700";

function selectClassName(readOnly: boolean) {
  return cn(
    "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition-colors focus:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-300",
    readOnly &&
      "pointer-events-none bg-slate-50 text-slate-700 focus:border-slate-300 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-slate-700",
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

function formatFieldError(
  message: string | undefined,
  t: (key: string) => string,
) {
  if (!message) return undefined;

  const translationKeys = new Set([
    "activatedAtRequired",
    "addressRequired",
    "customerNameRequired",
    "durationMonthsInteger",
    "durationMonthsRange",
    "duplicateSerialNumber",
    "duplicateWarrantyCode",
    "emailInvalid",
    "manufactureYearInteger",
    "manufactureYearRange",
    "phoneInvalid",
    "productCategoryNotFound",
    "productNameRequired",
    "provinceRequired",
    "termsLength",
    "wardRequired",
  ]);

  return translationKeys.has(message) ? t(message) : message;
}

function handleActivationError(
  error: unknown,
  setError: UseFormSetError<WarrantyActivationFormValues>,
  t: (key: string) => string,
) {
  if (!(error instanceof HttpClientError)) return null;

  const messages = {
    "Customer email and phone belong to different customers": [
      "customerEmail",
      "customerIdentityConflict",
    ],
    "Product category not found": ["categoryId", "productCategoryNotFound"],
    "Serial number already exists": ["serialNumber", "duplicateSerialNumber"],
    "Warranty code already exists": ["warrantyCode", "duplicateWarrantyCode"],
  } as const;
  const match = messages[error.message as keyof typeof messages];
  if (!match) return null;

  const [field, translationKey] = match;
  const message = t(translationKey);
  setError(field, { message });
  return message;
}
