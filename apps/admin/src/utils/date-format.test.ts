import assert from "node:assert/strict";
import test from "node:test";
import { formatDate } from "@repo/shared";

test("formats dates using the requested locale", () => {
  const createdAt = "2026-08-07T00:00:00.000Z";

  assert.equal(formatDate(createdAt, { locale: "vi-VN" }), "7 thg 8, 2026");
  assert.equal(formatDate(createdAt, { locale: "en-US" }), "Aug 7, 2026");
});

test("formats date and time when requested", () => {
  const createdAt = "2026-08-07T10:30:00.000Z";

  assert.match(
    formatDate(createdAt, { locale: "en-US", showTime: true }),
    /Aug 7, 2026/,
  );
});
