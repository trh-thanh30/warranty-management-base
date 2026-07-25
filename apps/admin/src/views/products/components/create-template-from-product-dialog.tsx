"use client";

import { useTranslations } from "next-intl";
import type { ProductResponse } from "@repo/shared";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";

export function CreateTemplateFromProductDialog({
  isCreating,
  onConfirm,
  onOpenChange,
  open,
  product,
}: {
  isCreating: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product: ProductResponse | null;
}) {
  const t = useTranslations("Products");
  return (
    <ConfirmActionDialog
      cancelLabel={t("cancel")}
      confirmDisabled={!product}
      confirmLabel={t("createTemplateConfirm")}
      description={t("createTemplateFromProductDescription", {
        name: product?.name ?? "",
      })}
      isLoading={isCreating}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title={t("createTemplateFromProductTitle")}
    />
  );
}
