"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { AdminLoginBody, AuthUser } from "@repo/shared";
import {
  clearAuthSession,
  getAuthSession,
  setAccessToken,
  setAuthSession,
  subscribeAuthSession,
} from "@/src/app/stores/auth-session.store";
import { authService } from "@/src/services/auth.service";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (body: AdminLoginBody) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const session = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSession,
    getAuthSession,
  );
  const status: AuthStatus = bootstrapping
    ? "loading"
    : session.user
      ? "authenticated"
      : "unauthenticated";

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const refreshed = await authService.refresh();
        if (!active) return;
        setAccessToken(refreshed.access_token);

        const user = await authService.me();
        if (!active) return;
        setAuthSession({ accessToken: refreshed.access_token, user });
      } catch {
        if (active) clearAuthSession();
      } finally {
        if (active) setBootstrapping(false);
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (body: AdminLoginBody) => {
    const result = await authService.login(body);
    setAuthSession({
      accessToken: result.access_token,
      user: result.user,
    });
    setBootstrapping(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearAuthSession();
    }
  }, []);

  const value = useMemo(
    () => ({ user: session.user, status, login, logout }),
    [login, logout, session.user, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
