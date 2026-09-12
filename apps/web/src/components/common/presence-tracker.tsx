"use client";

import { usePresenceHeartbeat } from "@repo/hooks";
import { sendWebPresenceHeartbeat } from "@/src/services/analytics/analytics.service";

export function PresenceTracker() {
  usePresenceHeartbeat(sendWebPresenceHeartbeat);
  return null;
}
