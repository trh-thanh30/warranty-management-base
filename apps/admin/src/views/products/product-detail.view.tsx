"use client";

import { Copy, PackageSearch, Pencil, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import { AssignOwnerDialog } from "./components/assign-owner-dialog";
import {
  ProductDetailCard,
  ProductDetailSkeleton,
} from "./components/product-detail-card";
import { useProductDetail } from "./hooks/use-product-detail";

type ProductDetailViewProps = {
  productId: string;
};

export function ProductDetailView({ productId }: ProductDetailViewProps) {
  const t = useTranslations("Products");
  const { hasPermission } = usePermissions();
  const { product, productQuery } = useProductDetail({
    mode: "detail",
    productId,
  });
  const [assignOpen, setAssignOpen] = useState(false);
  const canEdit = hasPermission(PERMISSIONS.PRODUCT_UPDATE);
  const canCreate = hasPermission(PERMISSIONS.PRODUCT_CREATE);
  const canAssignOwner = hasPermission(PERMISSIONS.PRODUCT_ASSIGN_OWNER);

  return (
    <PermissionGuard permissions={[PERMISSIONS.PRODUCT_VIEW]}>
      <FormPageShell
        backHref="/products"
        backLabel={t("backToDirectory")}
        description={t("detailDescription")}
        descriptionAccessory={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {canAssignOwner ? (
              <Button
                className="w-full sm:w-auto"
                disabled={!product}
                onClick={() => setAssignOpen(true)}
                type="button"
                variant="secondary"
              >
                <UserPlus className="size-4" />
                {t("assignOwner")}
              </Button>
            ) : null}
            {canEdit ? (
              <Button
                asChild
                className="w-full sm:w-auto"
                disabled={!product}
                variant="secondary"
              >
                <Link href={`/products/${productId}/edit`}>
                  <Pencil className="size-4" />
                  {t("edit")}
                </Link>
              </Button>
            ) : null}
            {canCreate ? (
              <Button asChild className="w-full sm:w-auto" variant="secondary">
                <Link href={`/products/create?cloneFrom=${productId}`}>
                  <Copy className="size-4" />
                  {t("clone")}
                </Link>
              </Button>
            ) : null}
          </div>
        }
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={t("detailTitle")}
      >
        {productQuery.isLoading ? (
          <ProductDetailSkeleton />
        ) : productQuery.isError || !product ? (
          <StatePanel
            action={
              <Button
                onClick={() => {
                  void productQuery.refetch();
                }}
                variant="secondary"
              >
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={PackageSearch}
            title={t("loadErrorTitle")}
          />
        ) : (
          <ProductDetailCard product={product} />
        )}

        <AssignOwnerDialog
          onOpenChange={setAssignOpen}
          open={assignOpen}
          product={product}
        />
      </FormPageShell>
    </PermissionGuard>
  );
}
