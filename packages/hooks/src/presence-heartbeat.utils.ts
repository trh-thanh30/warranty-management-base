const HEARTBEAT_INTERVAL_MS = 30_000;
const SESSION_STORAGE_KEY = "presence_session_id";

export function getPresenceSessionId() {
  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY) ?? "";
    if (
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
        existing,
      )
    )
      return existing;
    const sessionId = window.crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
  } catch {
    try {
      return window.crypto.randomUUID();
    } catch {
      // Older/insecure browser contexts must not break either app.
      return null;
    }
  }
}

export function startPresenceHeartbeat(
  sendHeartbeat: (sessionId: string) => Promise<unknown>,
) {
  const sessionId = getPresenceSessionId();
  if (!sessionId) return () => {};
  let pending = false;
  let lastSentAt = -Infinity;
  const heartbeat = () => {
    if (
      pending ||
      document.visibilityState !== "visible" ||
      !navigator.onLine ||
      Date.now() - lastSentAt < HEARTBEAT_INTERVAL_MS
    )
      return;
    pending = true;
    lastSentAt = Date.now();
    void (async () => {
      try {
        await sendHeartbeat(sessionId);
      } catch {
        // Presence must never interrupt navigation or show request-error toasts.
      } finally {
        pending = false;
      }
    })();
  };
  heartbeat();
  const interval = window.setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);
  document.addEventListener("visibilitychange", heartbeat);
  window.addEventListener("online", heartbeat);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", heartbeat);
    window.removeEventListener("online", heartbeat);
  };
}
