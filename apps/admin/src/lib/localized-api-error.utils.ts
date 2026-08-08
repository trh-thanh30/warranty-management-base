import { HttpClientError } from "@repo/shared";

export type ApiErrorTranslator = ((key: string) => string) & {
  has?: (key: string) => boolean;
};

type LocalizedApiErrorOptions = {
  apiErrors?: ApiErrorTranslator;
  fallbackKey?: string;
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

  const code = getApiErrorCode(error);
  const apiErrorTranslator =
    typeof fallbackKeyOrOptions === "object"
      ? fallbackKeyOrOptions.apiErrors
      : undefined;

  if (code && apiErrorTranslator?.has?.(code)) {
    return apiErrorTranslator(code);
  }

  const scopedTranslationKey = code ? `apiErrors.${code}` : undefined;
  if (scopedTranslationKey && translate.has?.(scopedTranslationKey)) {
    return translate(scopedTranslationKey);
  }

  return error.message || translate(fallbackKey);
}

function getApiErrorCode(error: HttpClientError) {
  if (error.details && typeof error.details === "object") {
    const detailCode = (error.details as { code?: unknown }).code;
    if (typeof detailCode === "string") return detailCode;
  }

  return error.code;
}
