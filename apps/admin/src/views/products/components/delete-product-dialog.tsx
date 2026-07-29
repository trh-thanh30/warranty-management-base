"use client";

import { useTranslations } from "next-intl";
import type { ProductResponse } from "@repo/shared";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";

type DeleteProductDialogProps = {
  isDeleting: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product: ProductResponse | null;
};

export function DeleteProductDialog({
  isDeleting,
  onConfirm,
  onOpenChange,
  open,
  product,
}: DeleteProductDialogProps) {
  const t = useTranslations("Products");

  return (
    <ConfirmActionDialog
      cancelLabel={t("cancel")}
      confirmDisabled={!product}
      confirmLabel={t("delete")}
      description={t("deleteDescription", { name: product?.name ?? "" })}
      isLoading={isDeleting}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title={t("deleteTitle")}
      variant="destructive"
    />
  );
}
