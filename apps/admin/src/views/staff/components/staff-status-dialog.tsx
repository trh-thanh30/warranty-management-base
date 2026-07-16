"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import type { UserAccountSummary } from "@repo/shared";
import { ConfirmActionDialog } from "@/src/components/common/confirm-action-dialog";

type StaffStatusDialogProps = {
  isUpdating: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: UserAccountSummary | null;
};

export function StaffStatusDialog({
  isUpdating,
  onConfirm,
  onOpenChange,
  open,
  user,
}: StaffStatusDialogProps) {
  const t = useTranslations("Staff");
  const lastUserRef = useRef<UserAccountSummary | null>(null);

  if (user) {
    lastUserRef.current = user;
  }

  const currentUser = user ?? lastUserRef.current;
  const isActive = currentUser?.status === "ACTIVE";
  const displayName = currentUser?.fullName || currentUser?.username || "";

  return (
    <ConfirmActionDialog
      cancelLabel={t("cancel")}
      confirmDisabled={!user}
      confirmLabel={isActive ? t("deactivate") : t("activate")}
      description={
        isActive
          ? t("deactivateDescription", { name: displayName })
          : t("activateDescription", { name: displayName })
      }
      isLoading={isUpdating}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title={isActive ? t("deactivateTitle") : t("activateTitle")}
      variant={isActive ? "destructive" : "primary"}
    />
  );
}
