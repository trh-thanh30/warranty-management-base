import assert from "node:assert/strict";
import test from "node:test";
import {
  isAuthEntryPoint,
  shouldAttemptTokenRefresh,
  shouldClearSessionAfterUnauthorized,
} from "./admin-http-client.utils.ts";

test("protected API requests refresh once after an unauthorized response", () => {
  assert.equal(shouldAttemptTokenRefresh(401, "/products", false), true);
  assert.equal(shouldAttemptTokenRefresh(401, "/products", true), false);
  assert.equal(shouldAttemptTokenRefresh(403, "/products", false), false);
});

test("authentication entry points do not enter the protected request refresh flow", () => {
  for (const url of [
    "/auth/login-admin",
    "/auth/login-admin/verify-2fa",
    "/auth/login-admin/resend-2fa",
    "/auth/refresh",
    "/auth/logout",
  ]) {
    assert.equal(isAuthEntryPoint(url), true);
    assert.equal(shouldAttemptTokenRefresh(401, url, false), false);
  }
});

test("an incorrect current password remains a feature error and preserves the session", () => {
  const url = "/auth/change-password";

  assert.equal(isAuthEntryPoint(url), true);
  assert.equal(shouldAttemptTokenRefresh(401, url, false), false);
  assert.equal(shouldClearSessionAfterUnauthorized(url), false);
});

test("failed refresh responses clear an expired session", () => {
  assert.equal(shouldClearSessionAfterUnauthorized("/auth/refresh"), true);
  assert.equal(shouldClearSessionAfterUnauthorized("/products"), true);
  assert.equal(shouldClearSessionAfterUnauthorized("/auth/login-admin"), false);
});
