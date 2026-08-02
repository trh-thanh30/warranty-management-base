import type {
  AdminLoginBody,
  AdminLoginChallengeResponse,
  AdminLoginStartResponse,
  AdminSelectTwoFactorMethodBody,
  AdminResendTwoFactorBody,
  AdminResendTwoFactorResponse,
  AdminVerifyTwoFactorBody,
  AdminSetupPinBody,
  AdminVerifyPinBody,
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
    async login(body: AdminLoginBody): Promise<AdminLoginStartResponse> {
      return unwrap(
        await http.post<AdminLoginStartResponse>("/auth/login-admin", body),
      );
    },

    async selectTwoFactorMethod(
      body: AdminSelectTwoFactorMethodBody,
    ): Promise<AdminLoginChallengeResponse> {
      return unwrap(
        await http.post<AdminLoginChallengeResponse>(
          "/auth/login-admin/select-method",
          body,
        ),
      );
    },

    async verifyTwoFactor(
      body: AdminVerifyTwoFactorBody,
    ): Promise<LoginResponse> {
      return unwrap(
        await http.post<LoginResponse>("/auth/login-admin/verify-2fa", body),
      );
    },

    async resendTwoFactor(
      body: AdminResendTwoFactorBody,
    ): Promise<AdminResendTwoFactorResponse> {
      return unwrap(
        await http.post<AdminResendTwoFactorResponse>(
          "/auth/login-admin/resend-2fa",
          body,
        ),
      );
    },

    async setupPin(body: AdminSetupPinBody): Promise<LoginResponse> {
      return unwrap(
        await http.post<LoginResponse>("/auth/login-admin/setup-pin", body),
      );
    },

    async verifyPin(body: AdminVerifyPinBody): Promise<LoginResponse> {
      return unwrap(
        await http.post<LoginResponse>("/auth/login-admin/verify-pin", body),
      );
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
