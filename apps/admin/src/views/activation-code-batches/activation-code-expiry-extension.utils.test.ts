import assert from "node:assert/strict";
import test from "node:test";
import {
  addCalendarMonthsUtc,
  canExtendActivationCode,
  parseActivationCodeExtensionMonths,
} from "./activation-code-expiry-extension.utils.ts";

test("expiry preview preserves time and clamps the day at month end", () => {
  assert.equal(
    addCalendarMonthsUtc(new Date("2027-01-31T10:30:00.000Z"), 1).toISOString(),
    "2027-02-28T10:30:00.000Z",
  );
});

test("extension month input only accepts integers from 1 to 120", () => {
  assert.equal(parseActivationCodeExtensionMonths("1"), 1);
  assert.equal(parseActivationCodeExtensionMonths("120"), 120);
  for (const value of ["", "0", "1.5", "121", "abc"]) {
    assert.equal(parseActivationCodeExtensionMonths(value), null);
  }
});

test("only unexpired, non-activated, non-revoked codes can be extended", () => {
  const now = new Date("2026-09-10T00:00:00.000Z").getTime();
  const future = "2026-09-11T00:00:00.000Z";

  assert.equal(canExtendActivationCode("AVAILABLE", future, now), true);
  assert.equal(canExtendActivationCode("PENDING_APPROVAL", future, now), true);
  assert.equal(canExtendActivationCode("REPLACED", future, now), true);
  assert.equal(canExtendActivationCode("ACTIVATED", future, now), false);
  assert.equal(canExtendActivationCode("REVOKED", future, now), false);
  assert.equal(
    canExtendActivationCode("AVAILABLE", "2026-09-10T00:00:00.000Z", now),
    false,
  );
});
