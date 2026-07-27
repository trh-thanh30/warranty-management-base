"use client";

import { useTranslations } from "next-intl";
import type { ProductTemplateSummary } from "@repo/shared";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";

export function DeactivateProductTemplateDialog({
  isDeactivating,
  onConfirm,
  onOpenChange,
  open,
  template,
}: {
  isDeactivating: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  template: ProductTemplateSummary | null;
}) {
  const t = useTranslations("ProductTemplates");
  return (
    <ConfirmActionDialog
      cancelLabel={t("cancel")}
      confirmDisabled={!template}
      confirmLabel={t("deactivate")}
      description={t("deactivateDescription", {
        name: template?.name ?? "",
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
