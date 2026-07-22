"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DatePicker,
  Input,
  Textarea,
} from "@repo/ui";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxLoading,
  ComboboxTrigger,
  FormField,
  FormSection,
} from "@/src/components/common";
import {
  formatCustomerSearchOption,
  formatProductSearchOption,
} from "@/src/utils";
import { useCreateWarrantyActivationRequestForm } from "../hooks/use-create-warranty-activation-request-form";
import { formatActivationRequestCreateFieldError } from "../warranty-activation-requests.utils";

type CreateWarrantyActivationRequestFormCardProps = {
  onCancel: () => void;
  onCreated: () => void;
};

export function CreateWarrantyActivationRequestFormCard({
  onCancel,
  onCreated,
}: CreateWarrantyActivationRequestFormCardProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const {
    control,
    customers,
    customersQuery,
    errors,
    isSaving,
    loadMoreProducts,
    mutationIsPending,
    onSubmit,
    productSearch,
    products,
    productsQuery,
    provinceCode,
    provinces,
    provincesQuery,
    register,
    selectedCustomer,
    selectedProduct,
    selectCustomer,
    selectProduct,
    selectProvince,
    setProductSearch,
    wardCode,
    wards,
    wardsQuery,
  } = useCreateWarrantyActivationRequestForm({ onCreated });
  const selectedProvince = provinces.find(
    (province) => String(province.code) === provinceCode,
  );
  const selectedWard = wards.find((ward) => String(ward.code) === wardCode);

  return (
    <Card className="min-w-0 w-full max-w-full">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>{t("createTitle")}</CardTitle>
        <CardDescription className="mt-1.5">
          {t("createDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form className="space-y-6" noValidate onSubmit={onSubmit}>
          {errors.root?.message ? (
            <div
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
              role="alert"
            >
              {errors.root.message}
            </div>
          ) : null}

          <FormSection
            description={t("createProductDescription")}
            title={t("productInfo")}
          >
            <FormField
              error={formatActivationRequestCreateFieldError(
                errors.productId?.message,
                t,
              )}
              id="create-activation-request-product"
              label={t("productSearch")}
            >
              <Combobox
                disabled={productsQuery.isLoading}
                onValueChange={(value) => {
                  const product = products.find((item) => item.id === value);
                  if (product) selectProduct(product);
                }}
                value={selectedProduct?.id ?? ""}
                shouldFilter={false}
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
                    onValueChange={setProductSearch}
                    placeholder={t("search")}
                    showTrigger={false}
                    value={productSearch}
                  />
                  <ComboboxList onReachEnd={loadMoreProducts}>
                    {productsQuery.isFetching && products.length === 0 ? (
                      <ComboboxLoading label={t("loadingProducts")} />
                    ) : (
                      <ComboboxEmpty>{t("noProduct")}</ComboboxEmpty>
                    )}
                    {productsQuery.isFetching &&
                    products.length > 0 &&
                    !productsQuery.isFetchingNextPage ? (
                      <ComboboxLoading label={t("loadingProducts")} />
                    ) : null}
                    {products.map((product) => (
                      <ComboboxItem key={product.id} value={product.id}>
                        {formatProductSearchOption(product)}
                      </ComboboxItem>
                    ))}
                    {productsQuery.isFetchingNextPage ? (
                      <ComboboxLoading label={t("loadingMoreProducts")} />
                    ) : null}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                error={formatActivationRequestCreateFieldError(
                  errors.warrantyCode?.message,
                  t,
                )}
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
              </FormField>
              <FormField
                error={formatActivationRequestCreateFieldError(
                  errors.productName?.message,
                  t,
                )}
                id="create-activation-request-product-name"
                label={t("product")}
              >
                <Input
                  id="create-activation-request-product-name"
                  readOnly
                  className={readOnlyClassName}
                  {...register("productName")}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            description={t("createCustomerDescription")}
            title={t("customerInfo")}
          >
            <FormField
              id="create-activation-request-customer"
              label={t("customerSearch")}
            >
              <Combobox
                disabled={customersQuery.isLoading}
                onValueChange={(value) => {
                  const customer = customers.find((item) => item.id === value);
                  if (customer) selectCustomer(customer);
                }}
                value={selectedCustomer?.id ?? ""}
              >
                <ComboboxTrigger
                  id="create-activation-request-customer"
                  placeholder={t("customerSearchPlaceholder")}
                  selectedLabel={
                    selectedCustomer
                      ? formatCustomerSearchOption(selectedCustomer)
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
                        {formatCustomerSearchOption(customer)}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                error={formatActivationRequestCreateFieldError(
                  errors.customerName?.message,
                  t,
                )}
                id="create-activation-request-customer-name"
                label={t("customerName")}
              >
                <Input
                  id="create-activation-request-customer-name"
                  readOnly
                  className={readOnlyClassName}
                  {...register("customerName")}
                />
              </FormField>
              <FormField
                error={formatActivationRequestCreateFieldError(
                  errors.customerPhone?.message,
                  t,
                )}
                id="create-activation-request-customer-phone"
                label={t("phone")}
              >
                <Input
                  id="create-activation-request-customer-phone"
                  readOnly
                  className={readOnlyClassName}
                  {...register("customerPhone")}
                />
              </FormField>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                error={formatActivationRequestCreateFieldError(
                  errors.customerEmail?.message,
                  t,
                )}
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
              </FormField>
              <FormField
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
              </FormField>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                error={formatActivationRequestCreateFieldError(
                  errors.provinceCode?.message,
                  t,
                )}
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
                        selectProvince(value);
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
              </FormField>
              <FormField
                error={formatActivationRequestCreateFieldError(
                  errors.wardCode?.message,
                  t,
                )}
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
              </FormField>
            </div>

            <FormField
              error={formatActivationRequestCreateFieldError(
                errors.addressDetail?.message,
                t,
              )}
              id="create-activation-request-address"
              label={t("addressDetail")}
            >
              <Input
                id="create-activation-request-address"
                placeholder={t("addressDetailPlaceholder")}
                {...register("addressDetail")}
              />
            </FormField>
          </FormSection>

          <FormSection
            description={t("createNoteDescription")}
            title={t("note")}
          >
            <FormField
              error={formatActivationRequestCreateFieldError(
                errors.note?.message,
                t,
              )}
              id="create-activation-request-note"
              label={t("note")}
            >
              <Textarea
                id="create-activation-request-note"
                placeholder={t("notePlaceholder")}
                rows={3}
                {...register("note")}
              />
            </FormField>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              disabled={isSaving}
              onClick={onCancel}
              type="button"
              variant="secondary"
            >
              {t("cancel")}
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={isSaving}
              type="submit"
            >
              {mutationIsPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {mutationIsPending ? t("saving") : t("createSubmit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

const readOnlyClassName =
  "bg-slate-50 text-slate-700 focus:border-slate-300 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-slate-700";
