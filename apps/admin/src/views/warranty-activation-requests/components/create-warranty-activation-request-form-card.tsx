"use client";

import {
  FormField,
  FormSection,
  SearchDropdown,
} from "@/src/components/common";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";
import { ActivationCodeStatusBadge } from "@/src/components/activation-code-status-badge";
import { usePermissions } from "@/src/hooks/use-permissions";
import { formatCustomerSearchOption } from "@/src/utils";
import { PERMISSIONS } from "@repo/shared/constants";
import type { WarrantyActivationRequestSummary } from "@repo/shared";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DateTimePicker,
  Input,
  Textarea,
} from "@repo/ui";
import { Building2, KeyRound, Loader2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import { useMemo, useState } from "react";
import { CreateCustomerDialog } from "../../customers/components/create-customer-dialog";
import { CreateDealerDialog } from "../../dealers/components/create-dealer-dialog";
import { AssignActivationCodesDialog } from "../../products/components/assign-activation-codes-dialog";
import { useCreateWarrantyActivationRequestForm } from "../hooks/use-create-warranty-activation-request-form";
import {
  formatActivationProductSearchOption,
  getActivationProductDisplayName,
  getActivationProductOptionDisabledReason,
  getProductWarrantyStatusLabel,
} from "../warranty-activation-request-product.utils";
import {
  filterActivationRequestCategories,
  formatActivationRequestCreateFieldError,
  formatDealerSearchOption,
} from "../warranty-activation-requests.utils";
import { CategoryActivationInputFields } from "./category-activation-input-fields";
import { ActivationCodeBatchSelectField } from "./activation-code-batch-select-field";
import { CustomerSearchResult } from "./customer-search-result";
import { EditActivationRequestCustomerDialog } from "./edit-activation-request-customer-dialog";
import { ProductSearchResult } from "./product-search-result";
import { SelectedCustomerSummaryCard } from "./selected-customer-summary-card";
import { SelectedDealerSummaryCard } from "./selected-dealer-summary-card";
import { SelectedProductSummaryCard } from "./selected-product-summary-card";

type CreateWarrantyActivationRequestFormCardProps = {
  onCancel: () => void;
  onSaved: () => void;
  activationCodeId?: string;
  activationCode?: string;
  assignedProductId?: string;
  initialRequest?: WarrantyActivationRequestSummary;
};

export function CreateWarrantyActivationRequestFormCard({
  onCancel,
  onSaved,
  activationCodeId,
  activationCode,
  assignedProductId,
  initialRequest,
}: CreateWarrantyActivationRequestFormCardProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const { hasPermission } = usePermissions();
  const [categorySearch, setCategorySearch] = useState("");
  const [isCreateCustomerDialogOpen, setCreateCustomerDialogOpen] =
    useState(false);
  const [isEditCustomerDialogOpen, setEditCustomerDialogOpen] = useState(false);
  const [isCreateDealerDialogOpen, setCreateDealerDialogOpen] = useState(false);
  const [isAssignActivationCodeDialogOpen, setAssignActivationCodeDialogOpen] =
    useState(false);
  const {
    activationCodeSearch,
    activationCodeBatchId,
    activationFields,
    activationFieldsQuery,
    activationCodesQuery,
    availableActivationCodes,
    cancelCategoryChange,
    control,
    categories,
    categoriesQuery,
    categoryChangePending,
    categoryId,
    clearCustomer,
    clearDealer,
    clearActivationProduct,
    clearActivationCode,
    customers,
    customersQuery,
    customerSearch,
    dealerSearch,
    dealers,
    dealersQuery,
    clearProduct,
    errors,
    isSaving,
    isHydratingEditRequest,
    isEditHydrationError,
    isActivationCodeSearchPending,
    loadMoreProducts,
    mutationIsPending,
    onSubmit,
    productSearch,
    products,
    productsQuery,
    register,
    requiresActivationCode,
    selectedCustomer,
    selectedCategory,
    selectedDealer,
    selectedProduct,
    selectedActivationProducts,
    selectedItemActivationCodes,
    selectedActivationCode,
    updateCustomerProfile,
    confirmCategoryChange,
    selectCategory,
    selectCustomer,
    updateCustomerSnapshot,
    selectDealer,
    selectProduct,
    selectActivationCode,
    selectActivationCodeBatch,
    selectActivationProduct,
    selectItemActivationCode,
    setCustomerSearch,
    setActivationCodeSearch,
    setDealerSearch,
    setProductSearch,
    usesProductSelectors,
    showItemActivationCodeSelectors,
    clearItemActivationCode,
    retryEditHydration,
  } = useCreateWarrantyActivationRequestForm({
    onSaved,
    activationCodeId,
    assignedProductId,
    initialRequest,
  });
  const hasSelectedProduct =
    Boolean(selectedProduct) ||
    Object.keys(selectedActivationProducts).length > 0;
  const isProductLockedByActivationCode = Boolean(activationCodeId);
  const canAssignActivationCode = hasPermission(
    PERMISSIONS.ACTIVATION_CODE_ASSIGN_PRODUCT,
  );
  const canUpdateCustomerProfile = hasPermission(PERMISSIONS.CUSTOMER_UPDATE);
  const filteredCategories = useMemo(
    () => filterActivationRequestCategories(categories, categorySearch),
    [categories, categorySearch],
  );
  const selectableActivationCodes = useMemo(
    () => availableActivationCodes.filter((code) => code.selectable),
    [availableActivationCodes],
  );
  const displayedActivationCodes = isActivationCodeSearchPending
    ? []
    : selectableActivationCodes;
  const hasSelectableActivationCodes = availableActivationCodes.some(
    (code) => code.selectable,
  );
  if (isEditHydrationError) {
    return (
      <Card className="min-w-0 w-full max-w-full">
        <CardContent className="flex min-h-96 items-center justify-center">
          <div className="space-y-4 text-center text-sm">
            <p className="font-medium text-red-700 dark:text-red-300">
              {t("editDataLoadError")}
            </p>
            <Button
              onClick={() => void retryEditHydration()}
              type="button"
              variant="outline"
            >
              {t("tryAgain")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (isHydratingEditRequest) {
    return (
      <Card className="min-w-0 w-full max-w-full">
        <CardContent className="flex min-h-96 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("loadingEditData")}
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="min-w-0 w-full max-w-full">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>{t(initialRequest ? "editTitle" : "createTitle")}</CardTitle>
        <CardDescription className="mt-1.5">
          {t(initialRequest ? "editDescription" : "createDescription")}
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

          <input type="hidden" {...register("activationCodeId")} />

          {activationCodeId ? (
            <div className="space-y-3">
              <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
                {t("activationCodeLockedProduct")}
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t("activationCodeLabel")}
                </p>
                <p className="mt-1  text-sm font-semibold text-slate-950 dark:text-slate-50">
                  {activationCode ?? activationCodeId}
                </p>
              </div>
            </div>
          ) : null}
          {
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
                  disabled={isProductLockedByActivationCode}
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
                    disabled={isProductLockedByActivationCode}
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
                    onItemSelect={(product) => {
                      selectProduct(product);
                      setActivationCodeSearch("");
                    }}
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
                        activationCodeCounts={product.activationCodeCounts}
                        activationCodeSummary={t("activationCodeCount", {
                          available:
                            product.activationCodeCounts?.AVAILABLE ?? 0,
                          total: Object.values(
                            product.activationCodeCounts ?? {},
                          ).reduce((sum, count) => sum + (count ?? 0), 0),
                        })}
                        productCode={product.productCode}
                        productName={getActivationProductDisplayName(product)}
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
                  categoryName={selectedProduct.categoryRef.name}
                  durationMonths={
                    selectedProduct.warrantyDurationMonths ??
                    selectedProduct.warranty?.durationMonths
                  }
                  endDate={selectedProduct.warranty?.endDate ?? null}
                  model={selectedProduct.model}
                  productCodeLabel={t("productCode")}
                  productCode={selectedProduct.productCode}
                  productName={getActivationProductDisplayName(selectedProduct)}
                  productStatusLabel={t(
                    `productStatuses.${selectedProduct.status}`,
                  )}
                  sku={selectedProduct.sku}
                  skuLabel={t("sku")}
                  startDate={selectedProduct.warranty?.startDate ?? null}
                  statusLabel={getProductWarrantyStatusLabel(
                    selectedProduct,
                    t,
                  )}
                  summaryLabels={{
                    activationStartPending: t("activationStartPending"),
                    brandModel: `${t("brand")} / ${t("model")}`,
                    category: t("category"),
                    durationMonths: t("durationMonths"),
                    monthUnit: t("monthUnit"),
                    productStatus: t("productStatus"),
                    warrantyPeriod: t("warrantyPeriod"),
                  }}
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
                  <FormField
                    error={formatActivationRequestCreateFieldError(
                      errors.installedAt?.message,
                      t,
                    )}
                    id="create-activation-request-installed-at"
                    label={t("installedAt")}
                  >
                    <Controller
                      control={control}
                      name="installedAt"
                      render={({ field }) => (
                        <DateTimePicker
                          ariaLabel={t("installedAt")}
                          calendarAriaLabel={t("installedAtCalendar")}
                          clearLabel={t("installedAtClear")}
                          hourLabel={t("installedAtHour")}
                          id="create-activation-request-installed-at"
                          invalid={Boolean(errors.installedAt?.message)}
                          minuteLabel={t("installedAtMinute")}
                          onValueChange={field.onChange}
                          placeholder={t("installedAtPlaceholder")}
                          resetLabel={t("installedAtReset")}
                          value={field.value}
                        />
                      )}
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
                  onActivationCodeClear={clearItemActivationCode}
                  onActivationCodeSelect={selectItemActivationCode}
                  onProductClear={clearActivationProduct}
                  onProductSelect={selectActivationProduct}
                  register={register}
                  selectedActivationCodes={selectedItemActivationCodes}
                  selectedProducts={selectedActivationProducts}
                  showActivationCodeSelectors={showItemActivationCodeSelectors}
                />
              ) : null}
            </FormSection>
          }

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
                  errors.addressDetail?.message,
                  t,
                )}
                customerCode={selectedCustomer.customerCode}
                email={selectedCustomer.email}
                fullName={selectedCustomer.fullName}
                labels={{
                  address: t("address"),
                  customerCode: t("customerCode"),
                  editCustomer: t("editCustomer"),
                  email: t("email"),
                  noInformation: t("noInformation"),
                  phone: t("phone"),
                  selected: t("customerSelected"),
                }}
                onEditCustomer={() => setEditCustomerDialogOpen(true)}
                phone={selectedCustomer.phone}
              />
            ) : null}

            {!activationCodeId && requiresActivationCode ? (
              <>
                <FormField
                  id="create-activation-request-activation-code-batch"
                  label={t("activationCodeBatchLabel")}
                >
                  <ActivationCodeBatchSelectField
                    id="create-activation-request-activation-code-batch"
                    onChange={selectActivationCodeBatch}
                    productId={selectedProduct?.id}
                    value={activationCodeBatchId}
                  />
                </FormField>
                <FormField
                  id="create-activation-request-activation-code"
                  label={t("activationCodeLabel")}
                >
                  <SearchDropdown
                    disabled={!selectedProduct}
                    emptyLabel={
                      activationCodeSearch.trim()
                        ? t("noMatchingActivationCode")
                        : t("noAvailableActivationCodes")
                    }
                    errorLabel={t("activationCodesLoadError")}
                    getItemKey={(code) => code.id}
                    id="create-activation-request-activation-code"
                    isError={activationCodesQuery.isError}
                    isLoading={
                      isActivationCodeSearchPending ||
                      activationCodesQuery.isFetching
                    }
                    items={displayedActivationCodes}
                    loadingLabel={t("loadingActivationCodes")}
                    onItemSelect={(code) => {
                      selectActivationCode(code);
                      setActivationCodeSearch("");
                    }}
                    onReachEnd={() => {
                      if (
                        activationCodesQuery.hasNextPage &&
                        !activationCodesQuery.isFetchingNextPage
                      ) {
                        void activationCodesQuery.fetchNextPage();
                      }
                    }}
                    onRetry={() => void activationCodesQuery.refetch()}
                    onSearchChange={(value) => {
                      if (selectedActivationCode) clearActivationCode();
                      setActivationCodeSearch(value);
                    }}
                    placeholder={
                      selectedProduct
                        ? t("activationCodeOptionalPlaceholder")
                        : t("selectProductBeforeActivationCode")
                    }
                    renderItem={(code) => (
                      <div className="flex w-full min-w-0 items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-mono font-semibold text-slate-950 dark:text-slate-50">
                            {code.maskedCode}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                            {code.batchName}
                          </p>
                        </div>
                        <ActivationCodeStatusBadge
                          className="shrink-0"
                          status={code.status}
                        />
                      </div>
                    )}
                    retryLabel={t("tryAgain")}
                    searchValue={activationCodeSearch}
                    selectedLabel={selectedActivationCode?.maskedCode}
                  />
                  {selectedProduct && selectedActivationCode ? (
                    <Button
                      className="mt-1 h-auto px-0 text-sm text-blue-700 hover:bg-transparent hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                      onClick={() => {
                        clearActivationCode();
                        setActivationCodeSearch("");
                      }}
                      type="button"
                      variant="ghost"
                    >
                      {t("chooseDifferentActivationCode")}
                    </Button>
                  ) : selectedProduct &&
                    !activationCodeSearch.trim() &&
                    activationCodesQuery.isSuccess &&
                    !hasSelectableActivationCodes ? (
                    <div
                      className="mt-2 flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50/70 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200 sm:flex-row sm:items-center sm:justify-between"
                      role="status"
                    >
                      <span>{t("activationCodeNotAssignedToProduct")}</span>
                      {canAssignActivationCode ? (
                        <Button
                          className="shrink-0 self-start sm:self-auto hover:bg-amber-50 border border-amber-400 cursor-pointer"
                          onClick={() =>
                            setAssignActivationCodeDialogOpen(true)
                          }
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <KeyRound aria-hidden="true" className="size-4" />
                          {t("assignActivationCode")}
                        </Button>
                      ) : (
                        <span className="text-xs text-amber-700 dark:text-amber-300">
                          {t("activationCodeAssignmentPermissionRequired")}
                        </span>
                      )}
                    </div>
                  ) : null}
                </FormField>
              </>
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
              {mutationIsPending
                ? t("saving")
                : t(initialRequest ? "saveChanges" : "createSubmit")}
            </Button>
          </div>
        </form>
        <ConfirmActionDialog
          cancelLabel={t("cancel")}
          confirmLabel={t("confirmCategoryChange")}
          description={t("categoryChangeConfirm")}
          onConfirm={confirmCategoryChange}
          onOpenChange={(open) => {
            if (!open) cancelCategoryChange();
          }}
          open={categoryChangePending}
          title={t("categoryChangeTitle")}
          variant="destructive"
        />
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
        <EditActivationRequestCustomerDialog
          canUpdateCustomerProfile={canUpdateCustomerProfile}
          customer={selectedCustomer}
          onOpenChange={setEditCustomerDialogOpen}
          onSaved={updateCustomerSnapshot}
          open={isEditCustomerDialogOpen}
          updateCustomerProfile={updateCustomerProfile}
        />
        <AssignActivationCodesDialog
          onAssigned={async () => {
            await activationCodesQuery.refetch();
          }}
          onOpenChange={setAssignActivationCodeDialogOpen}
          open={isAssignActivationCodeDialogOpen}
          product={selectedProduct}
        />
      </CardContent>
    </Card>
  );
}
