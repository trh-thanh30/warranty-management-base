"use client";

import { useEffect } from "react";

import { startPresenceHeartbeat } from "./presence-heartbeat.utils";

export function usePresenceHeartbeat(
  sendHeartbeat: (sessionId: string) => Promise<unknown>,
  enabled = true,
) {
  useEffect(() => {
    if (enabled) return startPresenceHeartbeat(sendHeartbeat);
  }, [enabled, sendHeartbeat]);
}
