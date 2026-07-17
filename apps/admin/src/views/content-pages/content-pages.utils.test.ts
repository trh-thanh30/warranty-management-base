import assert from "node:assert/strict";
import test from "node:test";
import { HttpClientError } from "@repo/shared";
import {
  getContentPageSaveError,
  slugifyContentPageTitle,
} from "./content-pages.utils.ts";

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
