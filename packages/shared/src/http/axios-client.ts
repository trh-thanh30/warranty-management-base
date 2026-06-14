import axios from "axios";
import { toHttpClientError } from "./http-error.js";
import type { CreateHttpClientOptions, HttpClient } from "./http.types.js";

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
    (response) => response.data,
    async (error: unknown) => {
      const httpError = toHttpClientError(error);

      if (httpError.status === 401) {
        await options.onUnauthorized?.(httpError);
      }

      throw httpError;
    },
  );

  return client;
}
