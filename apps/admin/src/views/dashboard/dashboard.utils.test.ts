import assert from "node:assert/strict";
import test from "node:test";
import {
  getDefaultDashboardRange,
  getDashboardTrendInterval,
  toDashboardDateBoundary,
} from "./dashboard.utils.ts";

test("defaults the dashboard range to the current month", () => {
  assert.deepEqual(getDefaultDashboardRange(new Date(2026, 6, 15)), {
    from: "2026-07-01",
    to: "2026-07-15",
  });
});

test("selects a readable trend interval for the chosen range", () => {
  assert.equal(
    getDashboardTrendInterval({ from: "2026-07-01", to: "2026-07-30" }),
    "day",
  );
  assert.equal(
    getDashboardTrendInterval({ from: "2026-01-01", to: "2026-04-01" }),
    "week",
  );
  assert.equal(
    getDashboardTrendInterval({ from: "2025-01-01", to: "2026-01-01" }),
    "month",
  );
});

test("expands recent claim filters to the full local day", () => {
  const start = new Date(toDashboardDateBoundary("2026-07-15", "start") ?? "");
  const end = new Date(toDashboardDateBoundary("2026-07-15", "end") ?? "");

  assert.equal(start.getHours(), 0);
  assert.equal(start.getMinutes(), 0);
  assert.equal(end.getHours(), 23);
  assert.equal(end.getMinutes(), 59);
  assert.equal(end.getSeconds(), 59);
  assert.equal(end.getMilliseconds(), 999);
});
