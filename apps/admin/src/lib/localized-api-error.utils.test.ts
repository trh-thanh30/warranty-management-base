import assert from "node:assert/strict";
import test from "node:test";
import { HttpClientError } from "@repo/shared";
import { getLocalizedApiError } from "./localized-api-error.utils.ts";

function createTranslator(
  messages: Record<string, string>,
  fallbackKeys: string[] = [],
) {
  const translate = ((key: string) => {
    if (key in messages) return messages[key];
    throw new Error(`Missing translation: ${key}`);
  }) as ((key: string) => string) & {
    has: (key: string) => boolean;
  };

  translate.has = (key: string) =>
    key in messages || fallbackKeys.includes(key);

  return translate;
}

test("uses a localized API error code when the translation exists", () => {
  const translate = createTranslator({
    "apiErrors.PRODUCT_CODE_ALREADY_EXISTS": "Mã sản phẩm đã tồn tại.",
    saveError: "Không thể lưu sản phẩm.",
  });
  const error = new HttpClientError({
    message: "Product code already exists",
    code: "PRODUCT_CODE_ALREADY_EXISTS",
    isNetworkError: false,
  });

  assert.equal(
    getLocalizedApiError(error, translate),
    "Mã sản phẩm đã tồn tại.",
  );
});

test("uses the centralized API error translator", () => {
  const translate = createTranslator({
    saveError: "Không thể lưu dữ liệu.",
  });
  const apiErrors = createTranslator({
    PRODUCT_CODE_ALREADY_EXISTS: "Mã sản phẩm đã tồn tại.",
  });
  const error = new HttpClientError({
    message: "Product code already exists",
    code: "PRODUCT_CODE_ALREADY_EXISTS",
    isNetworkError: false,
  });

  assert.equal(
    getLocalizedApiError(error, translate, { apiErrors }),
    "Mã sản phẩm đã tồn tại.",
  );
});

test("keeps the backend message when an API error code is not translated", () => {
  const translate = createTranslator({ saveError: "Không thể lưu dữ liệu." });
  const error = new HttpClientError({
    message: "Some English backend message",
    code: "UNKNOWN_BACKEND_ERROR",
    isNetworkError: false,
  });

  assert.equal(
    getLocalizedApiError(error, translate),
    "Some English backend message",
  );
});

test("uses the detail code when the API puts it in error details", () => {
  const translate = createTranslator({
    "apiErrors.WARRANTY_CODE_NOT_FOUND": "Không tìm thấy mã bảo hành.",
    saveError: "Không thể xử lý yêu cầu.",
  });
  const error = new HttpClientError({
    message: "Warranty code not found",
    details: { code: "WARRANTY_CODE_NOT_FOUND" },
    isNetworkError: false,
  });

  assert.equal(
    getLocalizedApiError(error, translate),
    "Không tìm thấy mã bảo hành.",
  );
});

test("prefers a specific detail code over a generic HTTP error code", () => {
  const translate = createTranslator({
    "apiErrors.WARRANTY_NOT_ACTIVE": "Warranty is not active in Vietnamese.",
    saveError: "Unable to process request.",
  });
  const error = new HttpClientError({
    message: "Warranty is not active",
    code: "BAD_REQUEST",
    details: { code: "WARRANTY_NOT_ACTIVE" },
    isNetworkError: false,
  });

  assert.equal(
    getLocalizedApiError(error, translate),
    "Warranty is not active in Vietnamese.",
  );
});

test("uses the fallback key for non-HTTP errors", () => {
  const translate = createTranslator({
    genericError: "Đã xảy ra lỗi.",
  });

  assert.equal(
    getLocalizedApiError(new Error("English error"), translate, "genericError"),
    "Đã xảy ra lỗi.",
  );
});
