import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  HttpClientError,
  toHttpClientError,
  type ApiResponse,
  type RefreshResponse,
} from "@repo/shared";
import {
  clearAuthSession,
  getAuthSession,
  setAccessToken,
  setAuthRedirectReason,
} from "@/src/app/stores/auth-session.store";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export const adminHttpClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: "application/json",
    "x-auth-context": "admin",
  },
  timeout: 15_000,
  withCredentials: true,
});

let refreshRequest: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshRequest) {
    refreshRequest = adminHttpClient
      .post<ApiResponse<RefreshResponse>>("/auth/refresh")
      .then((response) => {
        const accessToken = response.data.data.access_token;
        setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

adminHttpClient.interceptors.request.use((config) => {
  const accessToken = getAuthSession().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

adminHttpClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as AxiosError;
    const config = axiosError.config as RetryableRequestConfig | undefined;
    const url = config?.url ?? "";
    const isAuthEntryPoint =
      url.includes("/auth/login-admin") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (
      axiosError.response?.status === 401 &&
      config &&
      !config._authRetry &&
      !isAuthEntryPoint
    ) {
      config._authRetry = true;

      try {
        const accessToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${accessToken}`;
        return adminHttpClient.request(config);
      } catch {
        setAuthRedirectReason("session-expired");
        clearAuthSession();
        throw new HttpClientError({
          message: "Your session has expired. Please sign in again.",
          status: 401,
          isNetworkError: false,
          cause: error,
        });
      }
    }

    throw toHttpClientError(error);
  },
);
