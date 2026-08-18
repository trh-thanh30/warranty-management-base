import type { ProductResponse } from "@repo/shared";
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

export function getProductSelectDisabledReason(
  product: Pick<ProductResponse, "warranty">,
  t: ActivationRequestTranslations,
) {
  if (!product.warranty) return t("productUnavailableNoWarranty");
  if (product.warranty.status !== "DRAFT") {
    return t("productUnavailableWarrantyStatus", {
      status: getProductWarrantyStatusLabel(product, t),
    });
  }

  return null;
}

export function getProductWarrantyStatusLabel(
  product: Pick<ProductResponse, "warranty">,
  t: ActivationRequestTranslations,
) {
  return product.warranty
    ? t(`warrantyStatuses.${product.warranty.status}`)
    : t("warrantyStatusMissing");
}
