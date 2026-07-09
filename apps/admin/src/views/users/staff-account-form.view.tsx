"use client";

import { UserRoundX } from "lucide-react";
import { useTranslations } from "next-intl";
import { PERMISSIONS, type PermissionKey } from "@repo/shared/constants";
import { Button } from "@repo/ui";
import { FormPageShell } from "@/src/components/common/form-page-shell";
import { PermissionGuard } from "@/src/components/permission-guard";
import { StatePanel } from "@/src/components/common/state-panel";
import {
  StaffAccountFormCard,
  StaffAccountFormSkeleton,
} from "./components/staff-account-form-card";
import { StaffPermissionsDialog } from "./components/staff-permissions-dialog";
import { TemporaryPasswordDialog } from "./components/temporary-password-dialog";
import { useStaffAccountDetail } from "./use-staff-account-detail";
import { useStaffAccountWorkflow } from "./use-staff-account-workflow";

type StaffAccountFormViewProps =
  | {
      mode: "create";
      userId?: never;
    }
  | {
      mode: "edit";
      userId: string;
    };

export function StaffAccountFormView({
  mode,
  userId,
}: StaffAccountFormViewProps) {
  const t = useTranslations("Staff");
  const workflow = useStaffAccountWorkflow();
  const { formUser, isEditing, userQuery } = useStaffAccountDetail(
    mode === "edit" ? { mode: "edit", userId } : { mode: "create" },
  );
  const requiredPermission: PermissionKey = isEditing
    ? PERMISSIONS.USER_UPDATE
    : PERMISSIONS.USER_CREATE;
  const title = isEditing ? t("editTitle") : t("createTitle");
  const description = isEditing ? t("editDescription") : t("createDescription");

  return (
    <PermissionGuard permissions={[requiredPermission]} requiredRole="admin">
      <FormPageShell
        backHref="/users"
        backLabel={t("backToDirectory")}
        description={description}
        eyebrow={t("eyebrow")}
        title={title}
      >
        {isEditing && userQuery.isLoading ? (
          <StaffAccountFormSkeleton description={description} title={title} />
        ) : isEditing && (userQuery.isError || !formUser) ? (
          <StatePanel
            action={
              <Button
                onClick={() => {
                  void userQuery.refetch();
                }}
                variant="secondary"
              >
                {t("tryAgain")}
              </Button>
            }
            description={t("loadErrorDescription")}
            icon={UserRoundX}
            title={t("loadErrorTitle")}
          />
        ) : (
          <StaffAccountFormCard
            description={description}
            onCancel={workflow.goBackToDirectory}
            onSaved={workflow.handleSaved}
            title={title}
            user={formUser}
          />
        )}

        <StaffPermissionsDialog
          onOpenChange={workflow.handlePermissionsOpenChange}
          open={workflow.permissionsOpen}
          user={workflow.savedUser}
        />
        <TemporaryPasswordDialog
          actionLabel={
            workflow.canManagePermissions ? undefined : t("backToDirectory")
          }
          onOpenChange={workflow.handleTemporaryPasswordOpenChange}
          open={workflow.temporaryPasswordOpen}
          password={workflow.temporaryPassword}
        />
      </FormPageShell>
    </PermissionGuard>
  );
}
