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
import {
  isAuthEntryPoint,
  shouldSendAuthCookies,
  shouldAttemptTokenRefresh,
  shouldClearSessionAfterUnauthorized,
} from "@/src/lib/admin-http-client.utils";

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
  withCredentials: false,
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

  config.withCredentials = shouldSendAuthCookies(config.url ?? "");

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
    if (
      shouldAttemptTokenRefresh(
        axiosError.response?.status,
        url,
        Boolean(config?._authRetry),
      ) &&
      config &&
      !isAuthEntryPoint(url)
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

    if (
      axiosError.response?.status === 401 &&
      shouldClearSessionAfterUnauthorized(url)
    ) {
      clearAuthSession();
    }

    throw toHttpClientError(error);
  },
);
