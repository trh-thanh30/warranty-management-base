import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DateRangeValue } from "@repo/ui/date-range-picker";
import {
  getDefaultDashboardRange,
  getDashboardTrendInterval,
  resolveDashboardRangeStateOnGlobalChange,
  resolveDashboardWidgetRange,
  toDashboardDateBoundary,
} from "./dashboard.utils";

describe("dashboard range utilities", () => {
  it("defaults the dashboard range to the current month", () => {
    assert.deepEqual(getDefaultDashboardRange(new Date(2026, 6, 15)), {
      from: "2026-07-01",
      to: "2026-07-15",
    });
  });

  it("selects a readable trend interval for the chosen range", () => {
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

  it("expands recent claim filters to the full local day", () => {
    const start = new Date(
      toDashboardDateBoundary("2026-07-15", "start") ?? "",
    );
    const end = new Date(toDashboardDateBoundary("2026-07-15", "end") ?? "");

    assert.equal(start.getHours(), 0);
    assert.equal(start.getMinutes(), 0);
    assert.equal(end.getHours(), 23);
    assert.equal(end.getMinutes(), 59);
    assert.equal(end.getSeconds(), 59);
    assert.equal(end.getMilliseconds(), 999);
  });

  it("uses the dashboard range when a widget does not have a local override", () => {
    const dashboardRange: DateRangeValue = {
      from: "2026-07-19",
      to: "2026-07-25",
    };

    assert.deepEqual(resolveDashboardWidgetRange(null, dashboardRange), {
      from: "2026-07-19",
      to: "2026-07-25",
    });
  });

  it("uses the widget local range when it has an override", () => {
    const dashboardRange: DateRangeValue = {
      from: "2026-07-01",
      to: "2026-07-25",
    };
    const widgetRange: DateRangeValue = {
      from: "2026-07-19",
      to: "2026-07-25",
    };

    assert.deepEqual(
      resolveDashboardWidgetRange(widgetRange, dashboardRange),
      widgetRange,
    );
  });

  it("clears widget overrides when the dashboard global range changes", () => {
    const nextDashboardRange: DateRangeValue = {
      from: "2026-07-01",
      to: "2026-07-25",
    };

    assert.deepEqual(
      resolveDashboardRangeStateOnGlobalChange(nextDashboardRange),
      {
        activationRequestRange: null,
        range: nextDashboardRange,
        warrantyRange: null,
      },
    );
  });
});
