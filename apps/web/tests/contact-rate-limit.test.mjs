import assert from "node:assert/strict";
import test from "node:test";
import { HttpClientError } from "@repo/shared";
import {
  getContactRateLimitSeconds,
  getRemainingRateLimitSeconds,
} from "../src/components/common/contact-message-form.utils.ts";

test("contact rate limit uses the server retry time", () => {
  const error = new HttpClientError({
    message: "Too many requests",
    status: 429,
    retryAfterSeconds: 60,
    isNetworkError: false,
  });

  assert.equal(getContactRateLimitSeconds(error), 60);
  assert.equal(getRemainingRateLimitSeconds(61_000, 1_000), 60);
  assert.equal(getRemainingRateLimitSeconds(61_000, 31_001), 30);
  assert.equal(getRemainingRateLimitSeconds(61_000, 61_000), 0);
});

test("contact rate limit falls back to response details and never invents a wait", () => {
  const withDetails = new HttpClientError({
    message: "Too many requests",
    status: 429,
    details: { retryAfterSeconds: 15 },
    isNetworkError: false,
  });
  const withoutTime = new HttpClientError({
    message: "Too many requests",
    status: 429,
    isNetworkError: false,
  });

  assert.equal(getContactRateLimitSeconds(withDetails), 15);
  assert.equal(getContactRateLimitSeconds(withoutTime), undefined);
});
