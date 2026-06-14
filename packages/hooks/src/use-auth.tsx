import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

export type AuthStatus = "authenticated" | "loading" | "unauthenticated";

export type BaseAuthUser = {
  email?: string | null;
  id: string;
  permissions?: string[];
  role?: string | null;
};

export type AuthContextValue<TUser extends BaseAuthUser = BaseAuthUser> = {
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  role: string | null;
  status: AuthStatus;
  user: TUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps<TUser extends BaseAuthUser = BaseAuthUser> = {
  children: ReactNode;
  permissions?: string[];
  status?: AuthStatus;
  user: TUser | null;
};

export function AuthProvider<TUser extends BaseAuthUser = BaseAuthUser>({
  children,
  permissions,
  status,
  user,
}: AuthProviderProps<TUser>) {
  const value = useMemo<AuthContextValue<TUser>>(() => {
    const nextStatus = status ?? (user ? "authenticated" : "unauthenticated");

    return {
      isAuthenticated: nextStatus === "authenticated",
      isLoading: nextStatus === "loading",
      permissions: permissions ?? user?.permissions ?? [],
      role: user?.role ?? null,
      status: nextStatus,
      user,
    };
  }, [permissions, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth<TUser extends BaseAuthUser = BaseAuthUser>() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context as AuthContextValue<TUser>;
}
