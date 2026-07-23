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
  FormSection,
  SearchDropdown,
} from "@/src/components/common";
import {
  formatCustomerSearchOption,
  formatProductSearchOption,
} from "@/src/utils";
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
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import { CustomerSearchResult } from "./customer-search-result";
import { ProductSearchResult } from "./product-search-result";
import { SelectedCustomerSummaryCard } from "./selected-customer-summary-card";
import { SelectedProductSummaryCard } from "./selected-product-summary-card";
import { useCreateWarrantyActivationRequestForm } from "../hooks/use-create-warranty-activation-request-form";
import {
  getProductSelectDisabledReason,
  getProductWarrantyStatusLabel,
} from "../warranty-activation-request-product.utils";
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
    clearCustomer,
    customers,
    customersQuery,
    customerSearch,
    clearProduct,
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
    selectWard,
    setCustomerSearch,
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
              <SearchDropdown
                emptyLabel={t("noProduct")}
                getItemDisabledReason={(product) =>
                  getProductSelectDisabledReason(product, t)
                }
                getItemKey={(product) => product.id}
                isLoading={productsQuery.isFetching}
                items={products}
                loadingLabel={
                  productsQuery.isFetchingNextPage
                    ? t("loadingMoreProducts")
                    : t("loadingProducts")
                }
                onItemSelect={selectProduct}
                onReachEnd={loadMoreProducts}
                onSearchChange={(value) => {
                  if (selectedProduct) clearProduct();
                  setProductSearch(value);
                }}
                placeholder={t("productSearchPlaceholder")}
                renderItem={(product) => (
                  <ProductSearchResult
                    disabledReason={getProductSelectDisabledReason(product, t)}
                    ownerName={product.owner?.fullName}
                    productCode={product.productCode}
                    productName={product.name}
                    serialNumber={product.serialNumber}
                    statusLabel={getProductWarrantyStatusLabel(product, t)}
                    warrantyCode={product.warrantyCode}
                  />
                )}
                searchValue={productSearch}
                selectedLabel={
                  selectedProduct
                    ? formatProductSearchOption(selectedProduct)
                    : undefined
                }
              />
            </FormField>

            <input type="hidden" {...register("productId")} />
            <input type="hidden" {...register("productName")} />
            <input type="hidden" {...register("warrantyCode")} />

            {selectedProduct ? (
              <SelectedProductSummaryCard
                brand={selectedProduct.brand}
                durationMonths={selectedProduct.warranty?.durationMonths}
                endDate={selectedProduct.warranty?.endDate ?? null}
                model={selectedProduct.model}
                ownerName={selectedProduct.owner?.fullName}
                productCodeLabel={t("productCode")}
                productCode={selectedProduct.productCode}
                productName={selectedProduct.name}
                serialNumber={selectedProduct.serialNumber}
                serialNumberLabel={t("serialNumber")}
                startDate={selectedProduct.warranty?.startDate ?? null}
                statusLabel={getProductWarrantyStatusLabel(selectedProduct, t)}
                summaryLabels={{
                  brandModel: `${t("brand")} / ${t("model")}`,
                  currentOwner: t("currentOwner"),
                  durationMonths: t("durationMonths"),
                  monthUnit: t("monthUnit"),
                  warrantyPeriod: t("warrantyPeriod"),
                }}
                warrantyCode={selectedProduct.warrantyCode}
                warrantyCodeLabel={t("warrantyCode")}
              />
            ) : null}
          </FormSection>

          <FormSection
            description={t("createCustomerDescription")}
            title={t("customerInfo")}
          >
            <FormField
              error={formatActivationRequestCreateFieldError(
                errors.customerName?.message ??
                  errors.customerPhone?.message ??
                  errors.customerEmail?.message,
                t,
              )}
              id="create-activation-request-customer"
              label={t("customerSearch")}
            >
              <SearchDropdown
                emptyLabel={t("noCustomer")}
                getItemKey={(customer) => customer.id}
                isLoading={customersQuery.isFetching}
                items={customers}
                loadingLabel={t("loadingCustomers")}
                onItemSelect={selectCustomer}
                onSearchChange={(value) => {
                  if (selectedCustomer) clearCustomer();
                  setCustomerSearch(value);
                }}
                placeholder={t("customerSearchPlaceholder")}
                renderItem={(customer) => (
                  <CustomerSearchResult
                    customerCode={customer.customerCode}
                    email={customer.email}
                    fullName={customer.fullName}
                    phone={customer.phone}
                  />
                )}
                searchValue={customerSearch}
                selectedLabel={
                  selectedCustomer
                    ? formatCustomerSearchOption(selectedCustomer)
                    : undefined
                }
              />
            </FormField>

            <input type="hidden" {...register("customerName")} />
            <input type="hidden" {...register("customerPhone")} />
            <input type="hidden" {...register("customerEmail")} />

            {selectedCustomer ? (
              <SelectedCustomerSummaryCard
                address={selectedCustomer.address}
                customerCode={selectedCustomer.customerCode}
                email={selectedCustomer.email}
                fullName={selectedCustomer.fullName}
                labels={{
                  address: t("address"),
                  customerCode: t("customerCode"),
                  email: t("email"),
                  phone: t("phone"),
                  selected: t("customerSelected"),
                }}
                phone={selectedCustomer.phone}
              />
            ) : null}

            <div className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="grid gap-5 sm:grid-cols-2">
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
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
                        onValueChange={selectWard}
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
            </div>
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
