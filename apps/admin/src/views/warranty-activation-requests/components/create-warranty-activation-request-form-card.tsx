"use client";

import {
  FormField,
  FormSection,
  SearchDropdown,
} from "@/src/components/common";
import { formatCustomerSearchOption } from "@/src/utils";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from "@repo/ui";
import { Building2, Loader2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { CreateCustomerDialog } from "../../customers/components/create-customer-dialog";
import { EditCustomerAddressDialog } from "../../customers/components/edit-customer-address-dialog";
import { CreateDealerDialog } from "../../dealers/components/create-dealer-dialog";
import { useCreateWarrantyActivationRequestForm } from "../hooks/use-create-warranty-activation-request-form";
import {
  formatActivationProductSearchOption,
  getActivationProductOptionDisabledReason,
  getActivationProductDisplayName,
  getProductWarrantyStatusLabel,
} from "../warranty-activation-request-product.utils";
import {
  filterActivationRequestCategories,
  formatActivationRequestCreateFieldError,
  formatDealerSearchOption,
} from "../warranty-activation-requests.utils";
import { CategoryActivationInputFields } from "./category-activation-input-fields";
import { CustomerSearchResult } from "./customer-search-result";
import { ProductSearchResult } from "./product-search-result";
import { SelectedCustomerSummaryCard } from "./selected-customer-summary-card";
import { SelectedDealerSummaryCard } from "./selected-dealer-summary-card";
import { SelectedProductSummaryCard } from "./selected-product-summary-card";

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
  const [isEditCustomerAddressDialogOpen, setEditCustomerAddressDialogOpen] =
    useState(false);
  const [isCreateDealerDialogOpen, setCreateDealerDialogOpen] = useState(false);
  const {
    activationFields,
    activationFieldsQuery,
    control,
    categories,
    categoriesQuery,
    categoryId,
    clearCustomer,
    clearDealer,
    clearActivationProduct,
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
    register,
    selectedCustomer,
    selectedCategory,
    selectedDealer,
    selectedProduct,
    selectedActivationProducts,
    selectCategory,
    selectCustomer,
    selectDealer,
    selectProduct,
    selectActivationProduct,
    setCustomerSearch,
    setDealerSearch,
    setProductSearch,
    usesProductSelectors,
  } = useCreateWarrantyActivationRequestForm({ onCreated });
  const hasSelectedProduct =
    Boolean(selectedProduct) ||
    Object.keys(selectedActivationProducts).length > 0;
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
                  if (selectCategory(category.id)) setCategorySearch("");
                }}
                onSearchChange={(value) => {
                  if (selectedCategory && !selectCategory("")) return;
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

            {!usesProductSelectors && activationFieldsQuery.isSuccess ? (
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
                    getActivationProductOptionDisabledReason(product, t)
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
                      disabledReason={getActivationProductOptionDisabledReason(
                        product,
                        t,
                      )}
                      ownerName={product.owner?.fullName}
                      productCode={product.productCode}
                      productName={getActivationProductDisplayName(product)}
                      serialNumber={product.serialNumber}
                      statusLabel={getProductWarrantyStatusLabel(product, t)}
                      warrantyCode={product.warrantyCode}
                    />
                  )}
                  retryLabel={t("tryAgain")}
                  searchValue={productSearch}
                  selectedLabel={
                    selectedProduct
                      ? formatActivationProductSearchOption(selectedProduct)
                      : undefined
                  }
                />
              </FormField>
            ) : null}

            <input type="hidden" {...register("productId")} />
            <input type="hidden" {...register("productName")} />
            <input type="hidden" {...register("warrantyCode")} />

            {!usesProductSelectors && selectedProduct ? (
              <SelectedProductSummaryCard
                brand={selectedProduct.brand}
                durationMonths={selectedProduct.warranty?.durationMonths}
                endDate={selectedProduct.warranty?.endDate ?? null}
                model={selectedProduct.model}
                ownerName={selectedProduct.owner?.fullName}
                productCodeLabel={t("productCode")}
                productCode={selectedProduct.productCode}
                productName={getActivationProductDisplayName(selectedProduct)}
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

            {hasSelectedProduct ? (
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

            {categoryId && activationFieldsQuery.isLoading ? (
              <p className="text-sm text-slate-500">
                {t("loadingActivationFields")}
              </p>
            ) : null}
            {categoryId && activationFieldsQuery.isError ? (
              <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <span>{t("activationFieldsLoadError")}</span>
                <Button
                  onClick={() => void activationFieldsQuery.refetch()}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {t("tryAgain")}
                </Button>
              </div>
            ) : null}
            {activationFieldsQuery.isSuccess ? (
              <CategoryActivationInputFields
                categoryId={categoryId}
                control={control}
                errors={errors}
                fields={activationFields}
                onProductClear={clearActivationProduct}
                onProductSelect={selectActivationProduct}
                register={register}
                selectedProducts={selectedActivationProducts}
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
                  errors.customerEmail?.message ??
                  errors.customerId?.message,
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
                    onReachEnd={() => {
                      if (
                        customersQuery.hasNextPage &&
                        !customersQuery.isFetchingNextPage
                      ) {
                        void customersQuery.fetchNextPage();
                      }
                    }}
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
            <input type="hidden" {...register("customerId")} />

            {selectedCustomer ? (
              <SelectedCustomerSummaryCard
                address={selectedCustomer.address}
                addressError={formatActivationRequestCreateFieldError(
                  errors.addressDetail?.message ??
                    errors.provinceCode?.message ??
                    errors.wardCode?.message,
                  t,
                )}
                customerCode={selectedCustomer.customerCode}
                email={selectedCustomer.email}
                fullName={selectedCustomer.fullName}
                labels={{
                  address: t("address"),
                  customerCode: t("customerCode"),
                  editAddress: t("editCustomerAddress"),
                  email: t("email"),
                  phone: t("phone"),
                  selected: t("customerSelected"),
                }}
                onEditAddress={() => setEditCustomerAddressDialogOpen(true)}
                phone={selectedCustomer.phone}
              />
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
                    onReachEnd={() => {
                      if (
                        dealersQuery.hasNextPage &&
                        !dealersQuery.isFetchingNextPage
                      ) {
                        void dealersQuery.fetchNextPage();
                      }
                    }}
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

          {usesProductSelectors ? (
            <div className="flex items-center justify-between gap-2 overflow-hidden whitespace-nowrap rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-xs dark:border-slate-800 dark:bg-slate-900/50 sm:px-4 sm:text-sm sm:whitespace-normal">
              <span className="min-w-0 truncate text-slate-600 dark:text-slate-300">
                {t("selectedActivationProducts")}
              </span>
              <span className="shrink-0 whitespace-nowrap font-semibold text-slate-950 dark:text-slate-50">
                {t("productCount", {
                  count: Object.keys(selectedActivationProducts).length,
                })}
              </span>
            </div>
          ) : null}

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
        <EditCustomerAddressDialog
          customer={selectedCustomer}
          onOpenChange={setEditCustomerAddressDialogOpen}
          onSaved={selectCustomer}
          open={isEditCustomerAddressDialogOpen}
        />
      </CardContent>
    </Card>
  );
}
