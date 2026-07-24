import assert from "node:assert/strict";
import test from "node:test";
import { clampPercentage, formatBytes, formatCount } from "./system.utils.ts";

test("formats storage bytes with a readable binary unit", () => {
  assert.equal(formatBytes(5 * 1024 * 1024, "en"), "5 MB");
  assert.equal(formatBytes(0, "en"), "0 B");
});

test("formats object counts using the active locale", () => {
  assert.equal(formatCount(1234, "en"), "1,234");
});

test("clamps capacity progress to its visual range", () => {
  assert.equal(clampPercentage(null), 0);
  assert.equal(clampPercentage(-5), 0);
  assert.equal(clampPercentage(84.5), 84.5);
  assert.equal(clampPercentage(120), 100);
});
