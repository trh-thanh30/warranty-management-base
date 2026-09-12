import type { ActivationProductOption, ProductResponse } from "@repo/shared";
import type { useTranslations } from "next-intl";

type ActivationRequestTranslations = ReturnType<
  typeof useTranslations<"WarrantyActivationRequestsAdmin">
>;

export function getActivationProductDisplayName(
  product: Pick<ProductResponse, "displayName" | "name" | "productCode">,
) {
  return (
    product.displayName?.trim() ||
    product.name?.trim() ||
    product.productCode?.trim() ||
    ""
  );
}

export function isActivationCodeRequiredForRequest(
  selectedCategoryRule: boolean | undefined,
  selectedProductCategoryRule: boolean | undefined,
) {
  return (selectedCategoryRule ?? selectedProductCategoryRule) !== false;
}

export function formatActivationProductSearchOption(product: ProductResponse) {
  return [
    getActivationProductDisplayName(product),
    product.productCode,
    product.owner?.fullName,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function isVisibleActivationProductOption(
  product: Pick<ActivationProductOption, "deletedAt" | "activationEligibility">,
) {
  return (
    !product.deletedAt &&
    product.activationEligibility.reason !== "PRODUCT_DELETED"
  );
}

export function getActivationProductOptionDisabledReason(
  product: Pick<ActivationProductOption, "activationEligibility">,
  t: ActivationRequestTranslations,
) {
  const eligibility = product.activationEligibility;
  if (eligibility.eligible) return null;

  switch (eligibility.reason) {
    case "PRODUCT_DELETED":
      return t("activationProductUnavailableDeleted");
    case "PRODUCT_INACTIVE":
      return t("activationProductUnavailableInactive");
    case "ACTIVATION_REQUEST_PENDING":
      return t("activationProductUnavailablePendingRequest", {
        requestCode: eligibility.requestCode ?? "-",
      });
    case "ACTIVATION_REQUEST_APPROVED":
      return t("activationProductUnavailableApprovedRequest", {
        requestCode: eligibility.requestCode ?? "-",
      });
    case "WARRANTY_MISSING":
      return t("productUnavailableNoWarranty");
    case "WARRANTY_CODE_MISSING":
      return t("activationProductUnavailableNoWarrantyCode");
    case "WARRANTY_ALREADY_ACTIVATED":
      return t("activationProductUnavailableAlreadyActivated");
    case "WARRANTY_NOT_DRAFT":
      return t("activationProductUnavailableWarrantyNotDraft");
  }
}

export function getProductWarrantyStatusLabel(
  product: Pick<ProductResponse, "warranty">,
  t: ActivationRequestTranslations,
) {
  return product.warranty
    ? t(`warrantyStatuses.${product.warranty.status}`)
    : t("warrantyStatusMissing");
}
