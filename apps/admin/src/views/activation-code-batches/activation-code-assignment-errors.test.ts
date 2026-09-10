import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { HttpClientError } from "@repo/shared";
import { getLocalizedApiError } from "../../lib/localized-api-error.utils.ts";

const ERROR_CODES = [
  "ACTIVATION_CODE_NOT_FOUND",
  "PRODUCT_NOT_FOUND",
  "ACTIVATION_CODE_ASSIGN_PRODUCT_INACTIVE",
  "ACTIVATION_CODE_NOT_APPLICABLE",
  "PRODUCT_WARRANTY_POLICY_MISSING",
  "ACTIVATION_CODE_NOT_ASSIGNABLE",
  "PRODUCT_ALREADY_HAS_ACTIVATION_CODE",
  "ACTIVATION_CODE_ASSIGNMENT_CONFLICT",
  "ACTIVATION_CODE_REPLACEMENT_MUST_BE_DIFFERENT",
  "PRODUCT_ACTIVATION_CODE_MISMATCH",
  "CURRENT_ACTIVATION_CODE_NOT_REPLACEABLE",
  "REPLACEMENT_ACTIVATION_CODE_NOT_ASSIGNABLE",
  "ACTIVATION_CODE_NOT_UNASSIGNABLE",
] as const;

for (const locale of ["vi", "en"] as const) {
  test(`${locale} localizes every activation-code assignment error`, async () => {
    const messages = JSON.parse(
      await readFile(
        new URL(`../../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    ) as { ApiErrors: Record<string, string> };
    const translate = Object.assign(
      (key: string) => messages.ApiErrors[key] ?? "Fallback",
      { has: (key: string) => key in messages.ApiErrors },
    );

    for (const code of ERROR_CODES) {
      const error = new HttpClientError({
        code: "BAD_REQUEST",
        details: { code },
        isNetworkError: false,
        message: "Backend English error",
      });

      const localized = getLocalizedApiError(error, () => "Fallback", {
        apiErrors: translate,
        fallbackKey: "error",
      });

      assert.equal(localized, messages.ApiErrors[code]);
      assert.notEqual(localized, "Backend English error");
      assert.ok(localized.length > 12);
    }
  });
}

test("assignment interfaces show the localized API error inline and as a toast", async () => {
  const sources = await Promise.all([
    readFile(
      new URL(
        "../products/components/assign-activation-codes-form.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "./components/activation-code-product-assignment-dialog.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  for (const source of sources) {
    assert.match(source, /getLocalizedApiError\(error, t,/);
    assert.match(source, /apiErrors: tApiErrors/);
    assert.match(source, /setErrorMessage\(message\)/);
    assert.match(source, /toast\.error\(message\)/);
    assert.match(source, /\{errorMessage\}/);
  }
});
