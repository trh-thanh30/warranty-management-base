"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { SearchDropdown } from "@/src/components/common/search-dropdown";
import { FormField } from "@/src/components/common/form-field";
import { formatProductSearchOption } from "@/src/utils";
import { useCreateWarrantyClaimForm } from "../hooks/use-create-warranty-claim-form";
import { translateWarrantyClaimCreateFieldError } from "../warranty-claims.utils";
import { WarrantyClaimFormSection } from "./warranty-claim-form-layout";
import { SelectedWarrantyClaimProductDetails } from "./selected-warranty-claim-product-details";
import { WarrantyClaimProductSearchResult } from "./warranty-claim-product-search-result";

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
    clearProduct,
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
    selectedProduct,
    selectProduct,
    setProductSearch,
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
            <FormField
              error={translateWarrantyClaimCreateFieldError(
                errors.productId?.message,
                t,
              )}
              htmlFor="create-warranty-claim-product"
              label={t("productSearch")}
            >
              <SearchDropdown
                emptyLabel={t("noProduct")}
                getItemKey={(product) => product.id}
                id="create-warranty-claim-product"
                inputClassName="h-11 text-base sm:h-10 sm:text-sm"
                isLoading={productsQuery.isFetching}
                items={products}
                loadingLabel={t("loadingProducts")}
                onItemSelect={selectProduct}
                onSearchChange={(value) => {
                  if (selectedProduct) clearProduct();
                  setProductSearch(value);
                }}
                placeholder={t("productSearchPlaceholder")}
                renderItem={(product) => (
                  <WarrantyClaimProductSearchResult
                    product={product}
                    productStatus={t(`productStatuses.${product.status}`)}
                    warrantyStatus={
                      product.warranty?.status
                        ? t(`warrantyStatuses.${product.warranty.status}`)
                        : "-"
                    }
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

            <input type="hidden" {...register("warrantyCode")} />

            {selectedProduct ? (
              <SelectedWarrantyClaimProductDetails
                customer={customer}
                isCustomerError={customerQuery.isError}
                isCustomerLoading={customerQuery.isFetching}
                product={selectedProduct}
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
