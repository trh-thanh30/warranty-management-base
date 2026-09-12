import { publicHttpClient } from "@/src/lib/public-http-client";
import type { PresenceHeartbeatBody } from "@repo/shared";

export function sendWebPresenceHeartbeat(sessionId: string) {
  const body: PresenceHeartbeatBody = { sessionId };
  return publicHttpClient.post("/analytics/presence/web/heartbeat", body);
}
