import type { ActivationProductOption, ProductResponse } from "@repo/shared";
import type { useTranslations } from "next-intl";
import type { AvailableActivationCode } from "@/src/services/activation-codes/activation-code-batches.types";

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

export function resolveAssignedActivationCodeForProduct(
  productId: string,
  activationCodes: AvailableActivationCode[],
) {
  return (
    activationCodes.find(
      (code) => code.selectable && code.assignedProduct?.id === productId,
    ) ?? null
  );
}

export function formatActivationProductSearchOption(product: ProductResponse) {
  return [
    getActivationProductDisplayName(product),
    product.warrantyCode,
    product.serialNumber,
    product.owner?.fullName,
  ]
    .filter(Boolean)
    .join(" · ");
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
