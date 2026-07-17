import type {
  AdminLoginBody,
  AuthUser,
  LoginResponse,
  RefreshResponse,
  UpdateProfileBody,
  ChangePasswordBody,
} from "@repo/shared";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type HttpResponse<T> = {
  data: ApiEnvelope<T>;
};

export type AuthHttpClient = {
  get<T>(url: string): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
  patch<T>(url: string, body?: unknown): Promise<HttpResponse<T>>;
};

function unwrap<T>(response: HttpResponse<T>): T {
  return response.data.data;
}

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
