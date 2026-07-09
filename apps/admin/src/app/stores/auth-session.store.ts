import type { AuthUser } from "@repo/shared";

type AuthSession = {
  accessToken: string | null;
  user: AuthUser | null;
};

const AUTH_REDIRECT_REASON_KEY = "admin_auth_redirect_reason";

export type AuthRedirectReason = "session-expired";

let session: AuthSession = {
  accessToken: null,
  user: null,
};

const listeners = new Set<() => void>();

export function getAuthSession(): AuthSession {
  return session;
}

export function setAccessToken(accessToken: string | null) {
  session = { ...session, accessToken };
  listeners.forEach((listener) => listener());
}

export function setAuthUser(user: AuthUser | null) {
  session = { ...session, user };
  listeners.forEach((listener) => listener());
}

export function setAuthSession(nextSession: AuthSession) {
  session = nextSession;
  listeners.forEach((listener) => listener());
}

export function clearAuthSession() {
  setAuthSession({ accessToken: null, user: null });
}

export function setAuthRedirectReason(reason: AuthRedirectReason) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(AUTH_REDIRECT_REASON_KEY, reason);
}

export function consumeAuthRedirectReason(): AuthRedirectReason | null {
  if (typeof window === "undefined") return null;

  const reason = window.sessionStorage.getItem(AUTH_REDIRECT_REASON_KEY);
  window.sessionStorage.removeItem(AUTH_REDIRECT_REASON_KEY);

  return reason === "session-expired" ? reason : null;
}

export function subscribeAuthSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
