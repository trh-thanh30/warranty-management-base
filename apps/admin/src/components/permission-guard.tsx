"use client";

import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { PermissionKey } from "@repo/shared/constants";
import type { AuthUserRole } from "@repo/shared";
import { StatePanel } from "@/src/components/common/state-panel";
import { usePermissions } from "@/src/hooks/use-permissions";

type PermissionGuardProps = {
  children: ReactNode;
  mode?: "all" | "any";
  permissions: PermissionKey[];
  requiredRole?: Exclude<AuthUserRole, null>;
};

export function PermissionGuard({
  children,
  mode = "all",
  permissions,
  requiredRole,
}: PermissionGuardProps) {
  const t = useTranslations("Common");
  const { hasPermissions, hasRole } = usePermissions();

  if (
    (requiredRole && !hasRole(requiredRole)) ||
    !hasPermissions(permissions, mode)
  ) {
    return (
      <StatePanel
        description={t("accessDeniedDescription")}
        icon={ShieldAlert}
        title={t("accessDeniedTitle")}
      />
    );
  }

  return children;
}
