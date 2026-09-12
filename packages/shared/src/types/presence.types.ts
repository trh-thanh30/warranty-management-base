export type PresenceHeartbeatBody = {
  sessionId: string;
};

export type OnlinePresenceSummary = {
  web: number;
  admin: number;
  windowSeconds: number;
};
