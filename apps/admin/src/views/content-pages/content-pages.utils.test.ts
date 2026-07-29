import assert from "node:assert/strict";
import test from "node:test";
import { HttpClientError } from "@repo/shared";
import {
  getContentPageFormValues,
  getContentPageSaveError,
  slugifyContentPageTitle,
} from "./content-pages.utils.ts";

const policyKinds = [
  "GENERAL_POLICY",
  "PRIVACY_POLICY",
  "PURCHASE_POLICY",
  "WARRANTY_RETURN_POLICY",
  "SHIPPING_POLICY",
  "PAYMENT_POLICY",
  "FAQ",
] as const;

test("maps every supported content-page kind into edit form values", () => {
  for (const kind of policyKinds) {
    const values = getContentPageFormValues({
      id: `page-${kind}`,
      slug: kind.toLowerCase().replaceAll("_", "-"),
      title: kind,
      summary: null,
      content: "<p>Policy</p>",
      faqItems: [],
      kind,
      categoryId: null,
      categoryRef: null,
      status: "PUBLISHED",
      publishedAt: "2026-07-27T00:00:00.000Z",
      createdAt: "2026-07-27T00:00:00.000Z",
      updatedAt: "2026-07-27T00:00:00.000Z",
    });

    assert.equal(values.kind, kind);
  }
});

test("creates a backend-compatible slug from a title", () => {
  assert.equal(
    slugifyContentPageTitle("  Hướng dẫn Bảo hành 2026! "),
    "huong-dan-bao-hanh-2026",
  );
});

test("maps slug conflicts to the slug field", () => {
  const error = new HttpClientError({
    message: "Content page slug already exists",
    status: 409,
    isNetworkError: false,
  });

  assert.deepEqual(getContentPageSaveError(error), {
    field: "slug",
    messageKey: "duplicateSlug",
  });
  assert.equal(getContentPageSaveError(new Error("failed")), null);
});
