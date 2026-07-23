"use client";

import { useTranslations } from "next-intl";
import type { DealerResponse } from "@repo/shared";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";

type DeactivateDealerDialogProps = {
  dealer: DealerResponse | null;
  isDeactivating: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function DeactivateDealerDialog({
  dealer,
  isDeactivating,
  onConfirm,
  onOpenChange,
  open,
}: DeactivateDealerDialogProps) {
  const t = useTranslations("Dealers");

  return (
    <ConfirmActionDialog
      cancelLabel={t("cancel")}
      confirmDisabled={!dealer || isDeactivating}
      confirmLabel={t("deactivate")}
      description={t("deactivateDescription", { name: dealer?.name ?? "" })}
      isLoading={isDeactivating}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title={t("deactivateTitle")}
      variant="destructive"
    />
  );
}
