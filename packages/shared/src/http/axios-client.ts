import axios from "axios";
import { toHttpClientError } from "./http-error.ts";
import type {
  CreateHttpClientOptions,
  HttpClient,
  HttpRequestConfig,
} from "./http.types.ts";

export function createHttpClient(
  options: CreateHttpClientOptions = {},
): HttpClient {
  const client = axios.create({
    baseURL: options.baseURL,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
    timeout: options.timeout,
    withCredentials: options.withCredentials,
  });

  client.interceptors.request.use(async (config) => {
    const token = await options.getAccessToken?.();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      const httpError = toHttpClientError(error);

      if (httpError.status === 401) {
        await options.onUnauthorized?.(httpError);
      }

      throw httpError;
    },
  );

  return {
    delete: <T = unknown>(url: string, config?: HttpRequestConfig) =>
      client.delete<T>(url, config).then((response) => response.data),
    get: <T = unknown>(url: string, config?: HttpRequestConfig) =>
      client.get<T>(url, config).then((response) => response.data),
    patch: <T = unknown>(
      url: string,
      data?: unknown,
      config?: HttpRequestConfig,
    ) => client.patch<T>(url, data, config).then((response) => response.data),
    post: <T = unknown>(
      url: string,
      data?: unknown,
      config?: HttpRequestConfig,
    ) => client.post<T>(url, data, config).then((response) => response.data),
    put: <T = unknown>(
      url: string,
      data?: unknown,
      config?: HttpRequestConfig,
    ) => client.put<T>(url, data, config).then((response) => response.data),
  };
}
