"use client";

import { useTranslations } from "next-intl";
import type { ProductResponse } from "@repo/shared";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";

type RestoreProductDialogProps = {
  isRestoring: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product: ProductResponse | null;
};

export function RestoreProductDialog({
  isRestoring,
  onConfirm,
  onOpenChange,
  open,
  product,
}: RestoreProductDialogProps) {
  const t = useTranslations("Products");

  return (
    <ConfirmActionDialog
      cancelLabel={t("cancel")}
      confirmDisabled={!product}
      confirmLabel={t("restore")}
      description={t("restoreDescription", { name: product?.name ?? "" })}
      isLoading={isRestoring}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title={t("restoreTitle")}
    />
  );
}
