"use client";

import { usePresenceHeartbeat } from "@repo/hooks";
import { useAuth } from "@/src/app/providers/auth-provider";
import { analyticsService } from "@/src/services/analytics/analytics.service";

export function PresenceTracker() {
  const { status } = useAuth();
  usePresenceHeartbeat(
    analyticsService.sendPresenceHeartbeat,
    status === "authenticated",
  );
  return null;
}
