import assert from "node:assert/strict";
import test from "node:test";
import { getNavigationBadge } from "./app-sidebar.utils.ts";

test("hides empty and unavailable notification badges", () => {
  assert.equal(getNavigationBadge(0, false), null);
  assert.equal(getNavigationBadge(3, true), null);
});

test("formats visible notification badges", () => {
  assert.equal(getNavigationBadge(12, false), "12");
  assert.equal(getNavigationBadge(100, false), "99+");
});
