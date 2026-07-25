"use client";

import { PackageSearch, Pencil, UserPlus } from "lucide-react";
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
import { ProductPublicationToggle } from "./components/product-publication-toggle";

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
  const canAssignOwner = hasPermission(PERMISSIONS.PRODUCT_ASSIGN_OWNER);

  return (
    <PermissionGuard permissions={[PERMISSIONS.PRODUCT_VIEW]}>
      <FormPageShell
        backHref="/products"
        backLabel={t("backToDirectory")}
        description={t("detailDescription")}
        eyebrow={t("eyebrow")}
        maxWidthClassName="max-w-5xl"
        title={t("detailTitle")}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {canAssignOwner ? (
            <Button
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
            <Button asChild disabled={!product} variant="secondary">
              <Link href={`/products/${productId}/edit`}>
                <Pencil className="size-4" />
                {t("edit")}
              </Link>
            </Button>
          ) : null}
        </div>

        {productQuery.isLoading ? (
          <ProductDetailSkeleton
            description={t("detailDescription")}
            title={t("detailTitle")}
          />
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
          <>
            {canEdit ? <ProductPublicationToggle product={product} /> : null}
            <ProductDetailCard
              description={t("detailDescription")}
              product={product}
              title={t("detailTitle")}
            />
          </>
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
