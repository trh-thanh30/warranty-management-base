import { HttpClientError } from "@repo/shared";

export type ApiErrorTranslator = ((
  key: string,
  values?: Record<string, string | number | Date>,
) => string) & {
  has?: (key: string) => boolean;
};

type LocalizedApiErrorOptions = {
  apiErrors?: ApiErrorTranslator;
  fallbackKey?: string;
  preferApiMessage?: boolean;
};

export function getLocalizedApiError(
  error: unknown,
  translate: ApiErrorTranslator,
  fallbackKeyOrOptions: string | LocalizedApiErrorOptions = "saveError",
) {
  const fallbackKey =
    typeof fallbackKeyOrOptions === "string"
      ? fallbackKeyOrOptions
      : (fallbackKeyOrOptions.fallbackKey ?? "saveError");

  if (!(error instanceof HttpClientError)) return translate(fallbackKey);

  const preferApiMessage =
    typeof fallbackKeyOrOptions === "object" &&
    fallbackKeyOrOptions.preferApiMessage;
  if (preferApiMessage && !error.isNetworkError && error.message.trim()) {
    return error.message;
  }

  const code = getApiErrorCode(error);
  const apiErrorTranslator =
    typeof fallbackKeyOrOptions === "object"
      ? fallbackKeyOrOptions.apiErrors
      : undefined;

  if (code && apiErrorTranslator?.has?.(code)) {
    return appendRetryAfter(
      apiErrorTranslator(code),
      error,
      apiErrorTranslator,
    );
  }

  const scopedTranslationKey = code ? `apiErrors.${code}` : undefined;
  if (scopedTranslationKey && translate.has?.(scopedTranslationKey)) {
    return appendRetryAfter(translate(scopedTranslationKey), error, translate);
  }

  return appendRetryAfter(
    error.message || translate(fallbackKey),
    error,
    translate,
  );
}

function appendRetryAfter(
  message: string,
  error: HttpClientError,
  translate: ApiErrorTranslator,
) {
  const seconds = error.retryAfterSeconds;
  if (!seconds || error.status !== 429) return message;

  const key = "RATE_LIMIT_RETRY_AFTER";
  if (translate.has?.(key)) {
    return translate(key, { seconds }).replace("{seconds}", String(seconds));
  }

  const scopedKey = `apiErrors.${key}`;
  if (translate.has?.(scopedKey)) {
    return translate(scopedKey, { seconds }).replace(
      "{seconds}",
      String(seconds),
    );
  }

  return `${message} (${seconds}s)`;
}

function getApiErrorCode(error: HttpClientError) {
  if (error.details && typeof error.details === "object") {
    const detailCode = (error.details as { code?: unknown }).code;
    if (typeof detailCode === "string") return detailCode;
  }

  return error.code;
}
