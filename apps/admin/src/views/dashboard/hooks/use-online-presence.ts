"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/src/services/analytics/analytics.service";
import { usePermissions } from "@/src/hooks/use-permissions";
import { PERMISSIONS } from "@repo/shared/constants";

export function useOnlinePresence() {
  const { hasPermission } = usePermissions();
  return useQuery({
    queryKey: ["analytics", "presence", "online"],
    queryFn: analyticsService.onlinePresence,
    enabled: hasPermission(PERMISSIONS.DASHBOARD_VIEW),
    refetchInterval: 30_000,
    retry: false,
  });
}
