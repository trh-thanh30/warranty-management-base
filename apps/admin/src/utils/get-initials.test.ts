import assert from "node:assert/strict";
import test from "node:test";
import { getInitials } from "./get-initials.ts";

test("returns up to two uppercase initials and ignores extra whitespace", () => {
  assert.equal(getInitials("  Nguyen   Van An  "), "NV");
  assert.equal(getInitials("admin"), "A");
});
