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
import { getCategoryActivationFields } from "@/src/utils/category-activation-fields";
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
import { Building2, Loader2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { CategoryActivationInputFields } from "./category-activation-input-fields";
import { CustomerSearchResult } from "./customer-search-result";
import { CreateCustomerDialog } from "../../customers/components/create-customer-dialog";
import { CreateDealerDialog } from "../../dealers/components/create-dealer-dialog";
import { ProductSearchResult } from "./product-search-result";
import { SelectedCustomerSummaryCard } from "./selected-customer-summary-card";
import { SelectedDealerSummaryCard } from "./selected-dealer-summary-card";
import { SelectedProductSummaryCard } from "./selected-product-summary-card";
import { useCreateWarrantyActivationRequestForm } from "../hooks/use-create-warranty-activation-request-form";
import {
  getProductSelectDisabledReason,
  getProductWarrantyStatusLabel,
} from "../warranty-activation-request-product.utils";
import {
  filterActivationRequestCategories,
  formatActivationRequestCreateFieldError,
  formatDealerSearchOption,
} from "../warranty-activation-requests.utils";

type CreateWarrantyActivationRequestFormCardProps = {
  onCancel: () => void;
  onCreated: () => void;
};

export function CreateWarrantyActivationRequestFormCard({
  onCancel,
  onCreated,
}: CreateWarrantyActivationRequestFormCardProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const [categorySearch, setCategorySearch] = useState("");
  const [isCreateCustomerDialogOpen, setCreateCustomerDialogOpen] =
    useState(false);
  const [isCreateDealerDialogOpen, setCreateDealerDialogOpen] = useState(false);
  const {
    control,
    categories,
    categoriesQuery,
    categoryId,
    clearCustomer,
    clearDealer,
    customers,
    customersQuery,
    customerSearch,
    dealerSearch,
    dealers,
    dealersQuery,
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
    selectedCategory,
    selectedDealer,
    selectedProduct,
    selectCategory,
    selectCustomer,
    selectDealer,
    selectProduct,
    selectProvince,
    selectWard,
    setCustomerSearch,
    setDealerSearch,
    setProductSearch,
    wardCode,
    wards,
    wardsQuery,
  } = useCreateWarrantyActivationRequestForm({ onCreated });
  const selectedProvince = provinces.find(
    (province) => String(province.code) === provinceCode,
  );
  const selectedWard = wards.find((ward) => String(ward.code) === wardCode);
  const activationFields = getCategoryActivationFields(selectedCategory);
  const filteredCategories = useMemo(
    () => filterActivationRequestCategories(categories, categorySearch),
    [categories, categorySearch],
  );

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
                errors.categoryId?.message,
                t,
              )}
              id="create-activation-request-category"
              label={t("category")}
            >
              <SearchDropdown
                emptyLabel={t("noCategory")}
                getItemKey={(category) => category.id}
                inputClassName="h-11 text-base sm:h-10 sm:text-sm"
                isLoading={categoriesQuery.isLoading}
                items={filteredCategories}
                loadingLabel={t("loadingCategories")}
                onItemSelect={(category) => {
                  selectCategory(category.id);
                  setCategorySearch("");
                }}
                onSearchChange={(value) => {
                  if (selectedCategory) selectCategory("");
                  setCategorySearch(value);
                }}
                placeholder={t("categoryPlaceholder")}
                renderItem={(category) => (
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium text-slate-950 dark:text-slate-50">
                      {category.name}
                    </p>
                    {category.code ? (
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {category.code}
                      </p>
                    ) : null}
                  </div>
                )}
                searchValue={categorySearch}
                selectedLabel={selectedCategory?.name}
              />
            </FormField>
            <input type="hidden" {...register("categoryId")} />

            <FormField
              error={formatActivationRequestCreateFieldError(
                errors.productId?.message,
                t,
              )}
              id="create-activation-request-product"
              label={t("productSearch")}
            >
              <SearchDropdown
                emptyLabel={
                  categoryId ? t("noProduct") : t("selectCategoryFirst")
                }
                errorLabel={t("productLoadError")}
                getItemDisabledReason={(product) =>
                  getProductSelectDisabledReason(product, t)
                }
                getItemKey={(product) => product.id}
                id="create-activation-request-product"
                isError={productsQuery.isError}
                isLoading={productsQuery.isFetching}
                items={products}
                loadingLabel={
                  !categoryId
                    ? t("selectCategoryFirst")
                    : productsQuery.isFetchingNextPage
                      ? t("loadingMoreProducts")
                      : t("loadingProducts")
                }
                onItemSelect={selectProduct}
                onReachEnd={loadMoreProducts}
                onRetry={() => void productsQuery.refetch()}
                onSearchChange={(value) => {
                  if (selectedProduct) clearProduct();
                  setProductSearch(value);
                }}
                placeholder={
                  categoryId
                    ? t("productSearchPlaceholder")
                    : t("selectCategoryFirst")
                }
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
                retryLabel={t("tryAgain")}
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

            {selectedProduct ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  error={formatActivationRequestCreateFieldError(
                    errors.vehiclePlate?.message,
                    t,
                  )}
                  id="create-activation-request-vehicle-plate"
                  label={t("vehiclePlate")}
                >
                  <Input
                    id="create-activation-request-vehicle-plate"
                    placeholder={t("vehiclePlatePlaceholder")}
                    {...register("vehiclePlate")}
                  />
                </FormField>
                <FormField
                  error={formatActivationRequestCreateFieldError(
                    errors.vehicleModel?.message,
                    t,
                  )}
                  id="create-activation-request-vehicle-model"
                  label={t("vehicleModel")}
                >
                  <Input
                    id="create-activation-request-vehicle-model"
                    placeholder={t("vehicleModelPlaceholder")}
                    {...register("vehicleModel")}
                  />
                </FormField>
              </div>
            ) : null}

            <CategoryActivationInputFields
              control={control}
              errors={errors}
              fields={activationFields}
              register={register}
            />
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
              <div className="flex w-full items-center gap-2">
                <div className="min-w-0 flex-1">
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
                </div>
                <Button
                  aria-label={t("createNewCustomer")}
                  className="shrink-0"
                  onClick={() => setCreateCustomerDialogOpen(true)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <UserPlus aria-hidden="true" className="size-4" />
                </Button>
              </div>
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

            {selectedCustomer ? (
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
            ) : null}
          </FormSection>

          <FormSection
            description={t("createDealerDescription")}
            title={t("dealerInfo")}
          >
            <FormField
              id="create-activation-request-dealer"
              label={t("dealerSearch")}
            >
              <div className="flex w-full items-center gap-2">
                <div className="min-w-0 flex-1">
                  <SearchDropdown
                    emptyLabel={t("noDealer")}
                    getItemKey={(dealer) => dealer.id}
                    isLoading={dealersQuery.isFetching}
                    items={dealers}
                    loadingLabel={t("loadingDealers")}
                    onItemSelect={selectDealer}
                    onSearchChange={(value) => {
                      if (selectedDealer) clearDealer();
                      setDealerSearch(value);
                    }}
                    placeholder={t("dealerSearchPlaceholder")}
                    renderItem={(dealer) => (
                      <div className="min-w-0">
                        <p className="truncate font-medium">{dealer.name}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {[dealer.province, dealer.district, dealer.phone]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    )}
                    searchValue={dealerSearch}
                    selectedLabel={
                      selectedDealer
                        ? formatDealerSearchOption(selectedDealer)
                        : undefined
                    }
                  />
                </div>
                <Button
                  aria-label={t("createNewDealer")}
                  className="shrink-0"
                  onClick={() => setCreateDealerDialogOpen(true)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Building2 aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </FormField>
            <input type="hidden" {...register("dealerId")} />

            {selectedDealer ? (
              <SelectedDealerSummaryCard
                dealer={selectedDealer}
                labels={{
                  address: t("dealerAddress"),
                  district: t("dealerDistrict"),
                  phone: t("dealerPhone"),
                  province: t("dealerProvince"),
                  selected: t("dealerSelected"),
                }}
              />
            ) : null}
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
        <CreateCustomerDialog
          onOpenChange={setCreateCustomerDialogOpen}
          onSaved={(customer) => {
            selectCustomer(customer);
            setCreateCustomerDialogOpen(false);
          }}
          open={isCreateCustomerDialogOpen}
        />
        <CreateDealerDialog
          onOpenChange={setCreateDealerDialogOpen}
          onSaved={(dealer) => {
            selectDealer(dealer);
            setCreateDealerDialogOpen(false);
          }}
          open={isCreateDealerDialogOpen}
        />
      </CardContent>
    </Card>
  );
}
