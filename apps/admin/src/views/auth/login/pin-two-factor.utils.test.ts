import assert from "node:assert/strict";
import test from "node:test";
import { HttpClientError } from "@repo/shared";
import { resolvePinErrorMessage } from "./pin-two-factor.utils.ts";

const translate = (key: string, values?: Record<string, unknown>) =>
  `${key}:${JSON.stringify(values ?? {})}`;

test("invalid PIN errors are translated with the remaining attempt count", () => {
  const error = new HttpClientError({
    code: "INVALID_PIN",
    details: { remainingAttempts: 4 },
    isNetworkError: false,
    message: "Invalid PIN. 4 attempts remaining.",
  });

  assert.equal(
    resolvePinErrorMessage(error, translate),
    'pinInvalid:{"remainingAttempts":4}',
  );
});

test("PIN lock and unknown errors use localized messages", () => {
  const lockedError = new HttpClientError({
    code: "PIN_VERIFICATION_LOCKED",
    isNetworkError: false,
    message: "PIN verification is locked for 15 minutes.",
  });

  assert.equal(resolvePinErrorMessage(lockedError, translate), "pinLocked:{}");
  assert.equal(
    resolvePinErrorMessage(new Error("server text"), translate),
    "pinGenericError:{}",
  );
});
