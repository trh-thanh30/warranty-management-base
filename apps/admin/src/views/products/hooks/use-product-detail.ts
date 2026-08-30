"use client";

import { PERMISSIONS } from "@repo/shared/constants";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useProduct, useProductCloneDraft } from "./use-products";

type UseProductDetailArgs =
  | { mode: "create"; productId?: never }
  | { mode: "detail" | "edit" | "clone"; productId: string };

export function useProductDetail(args: UseProductDetailArgs) {
  const { hasPermission } = usePermissions();
  const isExisting = args.mode !== "create";
  const canReadProduct = hasPermission(PERMISSIONS.PRODUCT_VIEW);
  const productQuery = useProduct(
    isExisting && args.mode !== "clone" ? args.productId : null,
    { enabled: isExisting && canReadProduct },
  );
  const cloneQuery = useProductCloneDraft(
    args.mode === "clone" ? args.productId : null,
    { enabled: isExisting && canReadProduct },
  );

  return {
    isExisting,
    product:
      (args.mode === "clone" ? cloneQuery.data : productQuery.data) ?? null,
    productQuery: args.mode === "clone" ? cloneQuery : productQuery,
  };
}
