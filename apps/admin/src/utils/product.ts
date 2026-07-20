import type { ProductResponse } from "@repo/shared";

export function formatProductSearchOption(product: ProductResponse) {
  return [
    product.name,
    product.warrantyCode,
    product.serialNumber,
    product.owner?.fullName,
  ]
    .filter(Boolean)
    .join(" · ");
}
