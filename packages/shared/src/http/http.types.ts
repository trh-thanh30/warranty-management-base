import type { AxiosError, AxiosRequestConfig } from "axios";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type TokenResolver = () =>
  | Promise<string | undefined>
  | string
  | undefined;

export type UnauthorizedHandler = (
  error: HttpClientError,
) => Promise<void> | void;

export type CreateHttpClientOptions = {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  withCredentials?: boolean;
  getAccessToken?: TokenResolver;
  onUnauthorized?: UnauthorizedHandler;
};

export type HttpRequestConfig = AxiosRequestConfig;

export type HttpClient = {
  delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<T>;
  get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<T>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<T>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<T>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<T>;
};

export type HttpClientErrorPayload = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  isNetworkError: boolean;
};

export class HttpClientError extends Error {
  readonly status?: number;

  readonly code?: string;

  readonly details?: unknown;

  readonly isNetworkError: boolean;

  readonly cause?: unknown;

  constructor(payload: HttpClientErrorPayload & { cause?: unknown }) {
    super(payload.message);
    this.name = "HttpClientError";
    this.status = payload.status;
    this.code = payload.code;
    this.details = payload.details;
    this.isNetworkError = payload.isNetworkError;
    this.cause = payload.cause;
  }
}

export type HttpClientAxiosError = AxiosError<{
  message?: string;
  error?:
    | string
    | {
        code?: string;
        message?: string;
        details?: unknown;
      };
  details?: unknown;
}>;
