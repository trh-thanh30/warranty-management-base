import type {
  AdminLoginBody,
  AuthUser,
  LoginResponse,
  RefreshResponse,
  UpdateProfileBody,
  ChangePasswordBody,
} from "@repo/shared";
import { unwrap } from "../service.utils.ts";
import type { AuthHttpClient } from "./auth.types";

export function createAuthService(http: AuthHttpClient) {
  return {
    async login(body: AdminLoginBody): Promise<LoginResponse> {
      return unwrap(await http.post<LoginResponse>("/auth/login-admin", body));
    },

    async refresh(): Promise<RefreshResponse> {
      return unwrap(await http.post<RefreshResponse>("/auth/refresh"));
    },

    async me(): Promise<AuthUser> {
      return unwrap(await http.get<AuthUser>("/auth/me"));
    },

    async logout(): Promise<void> {
      await http.post<void>("/auth/logout");
    },

    async updateProfile(body: UpdateProfileBody): Promise<AuthUser> {
      return unwrap(await http.patch<AuthUser>("/auth/me", body));
    },

    async updateAvatar(file: File): Promise<AuthUser> {
      const formData = new FormData();
      formData.append("file", file);
      return unwrap(await http.patch<AuthUser>("/auth/me/avatar", formData));
    },

    async changePassword(body: ChangePasswordBody): Promise<void> {
      await http.patch<void>("/auth/change-password", body);
    },
  };
}
