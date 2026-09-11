"use client";

import { FormField } from "@/src/components/common/form-field";
import { SearchDropdown } from "@/src/components/common/search-dropdown";
import { Link } from "@/src/i18n/navigation";
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
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCreateWarrantyClaimForm } from "../hooks/use-create-warranty-claim-form";
import { translateWarrantyClaimCreateFieldError } from "../warranty-claims.utils";
import { SelectedWarrantyClaimProductDetails } from "./selected-warranty-claim-product-details";
import { WarrantyClaimFormSection } from "./warranty-claim-form-layout";
import { WarrantyClaimProductSearchResult } from "./warranty-claim-product-search-result";
import { WarrantyClaimWarrantyFilters } from "./warranty-claim-warranty-filters";

type CreateWarrantyClaimFormCardProps = {
  onCancel: () => void;
  onCreated: (claimId: string) => void;
};

export function CreateWarrantyClaimFormCard({
  onCancel,
  onCreated,
}: CreateWarrantyClaimFormCardProps) {
  const t = useTranslations("WarrantyClaims");
  const {
    blockedWarranty,
    categories,
    categoriesQuery,
    categoryId,
    changeCategory,
    clearFilters,
    clearProductFilter,
    clearWarranty,
    customer,
    customerQuery,
    errors,
    isSaving,
    mutationIsPending,
    onSubmit,
    productSearch,
    products,
    productsQuery,
    register,
    selectedFilterProduct,
    selectedWarranty,
    selectFilterProduct,
    selectWarranty,
    setProductSearch,
    setWarrantySearch,
    warranties,
    warrantiesQuery,
    warrantySearch,
  } = useCreateWarrantyClaimForm({ onCreated });

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

          <WarrantyClaimFormSection
            description={t("createWarrantyDescription")}
            title={t("warrantyInfo")}
          >
            <WarrantyClaimWarrantyFilters
              categories={categories}
              categoriesLoading={categoriesQuery.isFetching}
              categoryId={categoryId}
              onCategoryChange={changeCategory}
              onClearFilters={clearFilters}
              onClearProduct={clearProductFilter}
              onProductSearchChange={setProductSearch}
              onProductSelect={selectFilterProduct}
              onProductsReachEnd={() => {
                if (
                  productsQuery.hasNextPage &&
                  !productsQuery.isFetchingNextPage
                ) {
                  void productsQuery.fetchNextPage();
                }
              }}
              productSearch={productSearch}
              products={products}
              productsError={productsQuery.isError}
              productsLoading={productsQuery.isFetching}
              selectedProduct={selectedFilterProduct}
            />
            <FormField
              error={translateWarrantyClaimCreateFieldError(
                errors.productId?.message,
                t,
              )}
              htmlFor="create-warranty-claim-warranty"
              label={t("warrantySearch")}
            >
              <SearchDropdown
                emptyLabel={t("noWarranty")}
                errorLabel={t("warrantySearchLoadError")}
                getItemKey={(warranty) => warranty.id}
                getItemDisabledReason={(warranty) =>
                  warranty.openClaim
                    ? t("openClaimDisabled", {
                        claimCode: warranty.openClaim.claimCode,
                      })
                    : undefined
                }
                id="create-warranty-claim-warranty"
                inputClassName="h-11 text-base sm:h-10 sm:text-sm"
                isError={warrantiesQuery.isError}
                isLoading={warrantiesQuery.isFetching}
                items={warranties}
                loadingLabel={t("loadingWarranties")}
                onItemSelect={selectWarranty}
                onReachEnd={() => {
                  if (
                    warrantiesQuery.hasNextPage &&
                    !warrantiesQuery.isFetchingNextPage
                  ) {
                    void warrantiesQuery.fetchNextPage();
                  }
                }}
                onSearchChange={(value) => {
                  if (selectedWarranty) clearWarranty();
                  setWarrantySearch(value);
                }}
                placeholder={t("warrantySearchPlaceholder")}
                renderItem={(warranty) => (
                  <WarrantyClaimProductSearchResult warranty={warranty} />
                )}
                searchValue={warrantySearch}
                selectedLabel={
                  selectedWarranty
                    ? `${selectedWarranty.warrantyCode} · ${selectedWarranty.product.displayName ?? selectedWarranty.product.name}`
                    : undefined
                }
              />
              {blockedWarranty?.openClaim ? (
                <div
                  className="mt-2 flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                  role="status"
                >
                  <span>
                    {t("openClaimNotice", {
                      claimCode: blockedWarranty.openClaim.claimCode,
                      status: t(`statuses.${blockedWarranty.openClaim.status}`),
                    })}
                  </span>
                  <Link
                    className="shrink-0 font-semibold underline underline-offset-4 outline-none transition-colors duration-200 hover:text-amber-700 focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 dark:hover:text-amber-300"
                    href={`/warranty-claims/${blockedWarranty.openClaim.id}`}
                  >
                    {t("viewOpenClaim")}
                  </Link>
                </div>
              ) : null}
            </FormField>

            <input type="hidden" {...register("warrantyCode")} />

            {selectedWarranty ? (
              <SelectedWarrantyClaimProductDetails
                customer={customer}
                isCustomerError={customerQuery.isError}
                isCustomerLoading={customerQuery.isFetching}
                warranty={selectedWarranty}
              />
            ) : null}
          </WarrantyClaimFormSection>

          <WarrantyClaimFormSection
            description={t("createRequesterDescription")}
            title={t("requesterInfo")}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                error={translateWarrantyClaimCreateFieldError(
                  errors.requesterName?.message,
                  t,
                )}
                htmlFor="create-warranty-claim-requester-name"
                label={t("requesterName")}
              >
                <Input
                  id="create-warranty-claim-requester-name"
                  placeholder={t("requesterNamePlaceholder")}
                  required
                  {...register("requesterName")}
                />
              </FormField>
              <FormField
                error={translateWarrantyClaimCreateFieldError(
                  errors.requesterPhone?.message,
                  t,
                )}
                htmlFor="create-warranty-claim-requester-phone"
                label={t("requesterPhone")}
              >
                <Input
                  id="create-warranty-claim-requester-phone"
                  placeholder={t("requesterPhonePlaceholder")}
                  required
                  type="tel"
                  {...register("requesterPhone")}
                />
              </FormField>
            </div>
          </WarrantyClaimFormSection>

          <WarrantyClaimFormSection
            description={t("createIssueDescription")}
            title={t("issueInfo")}
          >
            <FormField
              error={translateWarrantyClaimCreateFieldError(
                errors.issueTitle?.message,
                t,
              )}
              htmlFor="create-warranty-claim-issue-title"
              label={t("issueTitle")}
            >
              <Input
                id="create-warranty-claim-issue-title"
                placeholder={t("issueTitlePlaceholder")}
                {...register("issueTitle")}
              />
            </FormField>
            <FormField
              error={translateWarrantyClaimCreateFieldError(
                errors.issueDetail?.message,
                t,
              )}
              htmlFor="create-warranty-claim-issue-detail"
              label={t("issueDetail")}
            >
              <Textarea
                id="create-warranty-claim-issue-detail"
                placeholder={t("issueDetailPlaceholder")}
                rows={5}
                {...register("issueDetail")}
              />
            </FormField>
          </WarrantyClaimFormSection>

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
