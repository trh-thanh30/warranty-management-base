"use client";

import {
  Copy,
  KeyRound,
  PackageSearch,
  Pencil,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import { AssignOwnerDialog } from "./components/assign-owner-dialog";
import { AssignActivationCodesDialog } from "./components/assign-activation-codes-dialog";
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
  const [assignCodesOpen, setAssignCodesOpen] = useState(false);
  const canEdit = hasPermission(PERMISSIONS.PRODUCT_UPDATE);
  const canCreate = hasPermission(PERMISSIONS.PRODUCT_CREATE);
  const canAssignOwner = hasPermission(PERMISSIONS.PRODUCT_ASSIGN_OWNER);
  const canAssignCodes = hasPermission(
    PERMISSIONS.ACTIVATION_CODE_ASSIGN_PRODUCT,
  );

  return (
    <PermissionGuard permissions={[PERMISSIONS.PRODUCT_VIEW]}>
      <FormPageShell
        backHref="/products"
        backLabel={t("backToDirectory")}
        description={t("detailDescription")}
        descriptionAccessory={
          <div className="flex w-full justify-end sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={t("actions")}
                  className="w-full sm:w-auto"
                  type="button"
                  variant="secondary"
                >
                  <MoreHorizontal className="size-4" />
                  {t("actions")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canAssignCodes ? (
                  <DropdownMenuItem
                    disabled={
                      !product ||
                      product.status !== "ACTIVE" ||
                      !product.warrantyDurationMonths
                    }
                    onSelect={() => setAssignCodesOpen(true)}
                  >
                    <KeyRound className="mr-2 size-4" />
                    {t("assignActivationCodes")}
                  </DropdownMenuItem>
                ) : null}
                {canAssignOwner ? (
                  <DropdownMenuItem
                    disabled={!product}
                    onSelect={() => setAssignOpen(true)}
                  >
                    <UserPlus className="mr-2 size-4" />
                    {t("assignOwner")}
                  </DropdownMenuItem>
                ) : null}
                {canEdit ? (
                  <DropdownMenuItem asChild disabled={!product}>
                    <Link href={`/products/${productId}/edit`}>
                      <Pencil className="mr-2 size-4" />
                      {t("edit")}
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {canCreate ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/products/create?cloneFrom=${productId}`}>
                      <Copy className="mr-2 size-4" />
                      {t("clone")}
                    </Link>
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
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
        <AssignActivationCodesDialog
          onOpenChange={setAssignCodesOpen}
          open={assignCodesOpen}
          product={product}
        />
      </FormPageShell>
    </PermissionGuard>
  );
}
