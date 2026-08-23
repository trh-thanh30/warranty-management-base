import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const detailSourceUrls = [
  new URL("./components/activation-request-items-table.tsx", import.meta.url),
  new URL(
    "./components/review-warranty-activation-request-dialog.tsx",
    import.meta.url,
  ),
  new URL(
    "./components/warranty-activation-request-detail-card.tsx",
    import.meta.url,
  ),
];

const translationKeys = [
  ...new Set(
    detailSourceUrls.flatMap((sourceUrl) =>
      [...readFileSync(sourceUrl, "utf8").matchAll(/\bt\("([^"]+)"/g)]
        .map((match) => match[1])
        .filter(
          (key): key is string => typeof key === "string" && !key.includes("."),
        ),
    ),
  ),
];

for (const locale of ["vi", "en"]) {
  test(`activation request detail copy exists in the ${locale} locale`, () => {
    const messages = JSON.parse(
      readFileSync(
        new URL(`../../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    ) as {
      WarrantyActivationRequestsAdmin?: Record<string, unknown>;
    };

    const namespace = messages.WarrantyActivationRequestsAdmin;
    assert.ok(
      namespace,
      `${locale} is missing WarrantyActivationRequestsAdmin`,
    );

    for (const key of translationKeys) {
      assert.ok(
        namespace[key],
        `${locale} is missing WarrantyActivationRequestsAdmin.${key}`,
      );
    }
  });
}
