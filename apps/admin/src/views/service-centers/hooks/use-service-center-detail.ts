"use client";

import { PERMISSIONS } from "@repo/shared/constants";
import { useAuth } from "@/src/app/providers/auth-provider";
import { usePermissions } from "@/src/hooks/use-permissions";
import { useServiceCenter } from "@/src/hooks/use-service-centers";

export function useServiceCenterDetail({
  mode,
  serviceCenterId,
}: {
  mode: "detail" | "edit";
  serviceCenterId: string | null;
}) {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const requiredPermission =
    mode === "edit"
      ? PERMISSIONS.SERVICE_CENTER_UPDATE
      : PERMISSIONS.SERVICE_CENTER_VIEW;
  const serviceCenterQuery = useServiceCenter(serviceCenterId, {
    enabled:
      Boolean(user) &&
      Boolean(serviceCenterId) &&
      hasPermission(requiredPermission),
  });

  return {
    serviceCenter: serviceCenterQuery.data ?? null,
    serviceCenterQuery,
  };
}
