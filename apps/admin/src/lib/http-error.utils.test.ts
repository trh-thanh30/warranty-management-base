import assert from "node:assert/strict";
import test from "node:test";
import { HttpClientError } from "@repo/shared";
import {
  isForbiddenError,
  isWebsiteVersionConflict,
} from "./http-error.utils.ts";

test("forbidden HTTP client errors are recognized", () => {
  const error = new HttpClientError({
    message: "Access denied",
    status: 403,
    isNetworkError: false,
  });

  assert.equal(isForbiddenError(error), true);
  assert.equal(isForbiddenError({ status: 403 }), true);
});

test("ordinary errors are not misclassified as forbidden", () => {
  assert.equal(isForbiddenError(new Error("Request 4032 failed")), false);
  assert.equal(isForbiddenError(new Error("Something went wrong")), false);
  assert.equal(isForbiddenError(null), false);
});

test("website version conflicts are recognized by stable error code", () => {
  assert.equal(
    isWebsiteVersionConflict(
      new HttpClientError({
        code: "WEBSITE_CONFIG_VERSION_CONFLICT",
        isNetworkError: false,
        message: "Stale draft",
        status: 409,
      }),
    ),
    true,
  );
  assert.equal(isWebsiteVersionConflict(new Error("Conflict")), false);
});
