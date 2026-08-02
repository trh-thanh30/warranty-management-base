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
import type {
  AdminLoginBody,
  AdminLoginChallengeResponse,
  AdminLoginStartResponse,
  AdminTwoFactorMethod,
  AdminResendTwoFactorResponse,
  AuthUser,
} from "@repo/shared";
import {
  clearAuthSession,
  getAuthSession,
  setAccessToken,
  setAuthSession,
  subscribeAuthSession,
} from "@/src/app/stores/auth-session.store";
import { authService } from "@/src/services/auth/auth.service";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isLoggingOut: boolean;
  login: (body: AdminLoginBody) => Promise<AdminLoginStartResponse>;
  selectTwoFactorMethod: (
    challengeId: string,
    method: AdminTwoFactorMethod,
  ) => Promise<AdminLoginChallengeResponse>;
  verifyTwoFactor: (challengeId: string, code: string) => Promise<void>;
  resendTwoFactor: (
    challengeId: string,
  ) => Promise<AdminResendTwoFactorResponse>;
  setupPin: (
    challengeId: string,
    pin: string,
    confirmPin: string,
  ) => Promise<void>;
  verifyPin: (challengeId: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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
    return authService.login(body);
  }, []);

  const selectTwoFactorMethod = useCallback(
    async (challengeId: string, method: AdminTwoFactorMethod) => {
      return authService.selectTwoFactorMethod({ challengeId, method });
    },
    [],
  );

  const verifyTwoFactor = useCallback(
    async (challengeId: string, code: string) => {
      const result = await authService.verifyTwoFactor({ challengeId, code });
      setAuthSession({
        accessToken: result.access_token,
        user: result.user,
      });
      setBootstrapping(false);
    },
    [],
  );

  const resendTwoFactor = useCallback(async (challengeId: string) => {
    return authService.resendTwoFactor({ challengeId });
  }, []);

  const setupPin = useCallback(
    async (challengeId: string, pin: string, confirmPin: string) => {
      const result = await authService.setupPin({
        challengeId,
        pin,
        confirmPin,
      });
      setAuthSession({ accessToken: result.access_token, user: result.user });
      setBootstrapping(false);
    },
    [],
  );

  const verifyPin = useCallback(async (challengeId: string, pin: string) => {
    const result = await authService.verifyPin({ challengeId, pin });
    setAuthSession({ accessToken: result.access_token, user: result.user });
    setBootstrapping(false);
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      clearAuthSession();
      setIsLoggingOut(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user: session.user,
      status,
      isLoggingOut,
      login,
      selectTwoFactorMethod,
      verifyTwoFactor,
      resendTwoFactor,
      setupPin,
      verifyPin,
      logout,
    }),
    [
      isLoggingOut,
      login,
      logout,
      resendTwoFactor,
      selectTwoFactorMethod,
      setupPin,
      session.user,
      status,
      verifyTwoFactor,
      verifyPin,
    ],
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
