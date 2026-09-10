import type { ProductResponse } from "@repo/shared";

export function formatProductSearchOption(product: ProductResponse) {
  return [product.name, product.warrantyCode].filter(Boolean).join(" · ");
}
