import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

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

export type HttpClient = AxiosInstance;

export type HttpRequestConfig = AxiosRequestConfig;

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
  error?: string;
  details?: unknown;
}>;
