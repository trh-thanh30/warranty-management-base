"use client";

import { PERMISSIONS } from "@repo/shared/constants";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useProduct } from "./use-products";

type UseProductDetailArgs =
  | { mode: "create"; productId?: never }
  | { mode: "detail" | "edit"; productId: string };

export function useProductDetail(args: UseProductDetailArgs) {
  const { hasPermission } = usePermissions();
  const isExisting = args.mode !== "create";
  const canReadProduct = hasPermission(PERMISSIONS.PRODUCT_VIEW);
  const productQuery = useProduct(isExisting ? args.productId : null, {
    enabled: isExisting && canReadProduct,
  });

  return {
    isExisting,
    product: productQuery.data ?? null,
    productQuery,
  };
}
