import { AxiosError } from "axios";
import { HttpClientError, type HttpClientAxiosError } from "./http.types.js";

function resolveMessage(error: HttpClientAxiosError): string {
  const data = error.response?.data;

  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  if (error.message) return error.message;

  return "Request failed";
}

export function toHttpClientError(error: unknown): HttpClientError {
  if (error instanceof HttpClientError) return error;

  if (error instanceof AxiosError) {
    const axiosError = error as HttpClientAxiosError;

    return new HttpClientError({
      message: resolveMessage(axiosError),
      status: axiosError.response?.status,
      code: axiosError.code,
      details: axiosError.response?.data?.details ?? axiosError.response?.data,
      isNetworkError: !axiosError.response,
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new HttpClientError({
      message: error.message,
      isNetworkError: false,
      cause: error,
    });
  }

  return new HttpClientError({
    message: String(error),
    isNetworkError: false,
    cause: error,
  });
}
