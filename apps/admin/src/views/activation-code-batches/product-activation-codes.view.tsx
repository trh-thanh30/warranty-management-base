"use client";

import { usePermissions } from "@/src/hooks/use-permissions";
import { PERMISSIONS } from "@repo/shared/constants";
import { Card, CardContent, Skeleton } from "@repo/ui";
import { AssignActivationCodesForm } from "../products/components/assign-activation-codes-form";
import { useProductDetail } from "../products/hooks/use-product-detail";
import { ActivationCodeDetailView } from "./activation-code-detail.view";

export function ProductActivationCodesView({
  productId,
}: {
  productId: string;
}) {
  const { hasPermission } = usePermissions();
  const { product, productQuery } = useProductDetail({
    mode: "detail",
    productId,
  });
  const canAssignCodes = hasPermission(
    PERMISSIONS.ACTIVATION_CODE_ASSIGN_PRODUCT,
  );

  return (
    <ActivationCodeDetailView
      beforeDirectory={
        canAssignCodes ? (
          <Card>
            <CardContent className="p-5 sm:p-6">
              {productQuery.isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : product ? (
                <AssignActivationCodesForm product={product} />
              ) : null}
            </CardContent>
          </Card>
        ) : null
      }
      productId={productId}
    />
  );
}
