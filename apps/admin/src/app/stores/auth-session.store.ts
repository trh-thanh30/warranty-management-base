import type { AuthUser } from "@repo/shared";

type AuthSession = {
  accessToken: string | null;
  user: AuthUser | null;
};

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

export function subscribeAuthSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
