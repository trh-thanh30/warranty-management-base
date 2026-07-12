"use client";

import { useTranslations } from "next-intl";
import type { CategoryResponse } from "@repo/shared";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";

type DeactivateCategoryDialogProps = {
  category: CategoryResponse | null;
  isDeactivating: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function DeactivateCategoryDialog({
  category,
  isDeactivating,
  onConfirm,
  onOpenChange,
  open,
}: DeactivateCategoryDialogProps) {
  const t = useTranslations("Categories");

  return (
    <ConfirmActionDialog
      cancelLabel={t("cancel")}
      confirmDisabled={!category}
      confirmLabel={t("deactivate")}
      description={t("deactivateDescription", {
        name: category?.name ?? "",
      })}
      isLoading={isDeactivating}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title={t("deactivateTitle")}
      variant="destructive"
    />
  );
}
