"use client";

import { useTranslations } from "next-intl";
import type { ServiceCenterSummary } from "@repo/shared";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";

type DeactivateServiceCenterDialogProps = {
  isDeactivating: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  serviceCenter: ServiceCenterSummary | null;
};

export function DeactivateServiceCenterDialog({
  isDeactivating,
  onConfirm,
  onOpenChange,
  open,
  serviceCenter,
}: DeactivateServiceCenterDialogProps) {
  const t = useTranslations("ServiceCenters");

  return (
    <ConfirmActionDialog
      cancelLabel={t("cancel")}
      confirmDisabled={!serviceCenter}
      confirmLabel={t("deactivate")}
      description={t("deactivateDescription", {
        name: serviceCenter?.name ?? "",
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
