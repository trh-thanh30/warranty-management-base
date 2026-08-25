import assert from "node:assert/strict";
import test from "node:test";
import { getWarrantyAdjustmentHistory } from "./warranty-adjustment-history.utils";

test("reads all adjustment history entries from warranty metadata", () => {
  const history = getWarrantyAdjustmentHistory({
    adjustmentHistory: [
      {
        adjustedAt: "2026-08-25T10:00:00.000Z",
        adjustedByUserId: "admin-1",
        adjustedByUser: {
          id: "admin-1",
          email: "admin@example.com",
          name: "Admin User",
        },
        changedFields: ["durationMonths"],
        changes: {
          durationMonths: { before: 12, after: 24 },
        },
        reason: "Gia han bao hanh",
      },
    ],
  });

  assert.deepEqual(history, [
    {
      adjustedAt: "2026-08-25T10:00:00.000Z",
      adjustedByUserId: "admin-1",
      adjustedByUser: {
        id: "admin-1",
        email: "admin@example.com",
        name: "Admin User",
      },
      changedFields: ["durationMonths"],
      changes: {
        durationMonths: { before: 12, after: 24 },
      },
      reason: "Gia han bao hanh",
    },
  ]);
});

test("normalizes actor snapshot and strips html from reason", () => {
  const [entry] = getWarrantyAdjustmentHistory({
    adjustmentHistory: [
      {
        reason: "<p>Cập nhật theo chính sách đại lý</p>",
        adjustedAt: "2026-08-25T00:00:00.000Z",
        adjustedByUserId: "admin-1",
        adjustedByUser: {
          id: "admin-1",
          email: "admin@example.com",
          name: "Admin User",
        },
        changedFields: ["terms"],
        changes: { terms: { before: "old", after: "new" } },
      },
    ],
  });

  assert.ok(entry);
  assert.equal(entry.reason, "Cập nhật theo chính sách đại lý");
  assert.deepEqual(entry.adjustedByUser, {
    id: "admin-1",
    email: "admin@example.com",
    name: "Admin User",
  });
});

test("converts legacy lastAdjustment metadata into one history entry", () => {
  assert.deepEqual(
    getWarrantyAdjustmentHistory({
      lastAdjustment: {
        adjustedAt: "2026-08-24T10:00:00.000Z",
        adjustedByUserId: "admin-legacy",
        adjustedByUser: null,
        changedFields: ["terms"],
        reason: "Cap nhat dieu khoan",
      },
    }),
    [
      {
        adjustedAt: "2026-08-24T10:00:00.000Z",
        adjustedByUserId: "admin-legacy",
        adjustedByUser: null,
        changedFields: ["terms"],
        changes: {},
        reason: "Cap nhat dieu khoan",
      },
    ],
  );
});

test("ignores malformed metadata without throwing", () => {
  assert.deepEqual(
    getWarrantyAdjustmentHistory({
      adjustmentHistory: [null, { reason: "missing fields" }],
    }),
    [],
  );
  assert.deepEqual(getWarrantyAdjustmentHistory(null), []);
});

test("hides fields whose before and after values are identical", () => {
  const [entry] = getWarrantyAdjustmentHistory({
    adjustmentHistory: [
      {
        adjustedAt: "2026-08-25T00:00:00.000Z",
        adjustedByUserId: "admin-1",
        changedFields: ["durationMonths", "terms"],
        changes: {
          durationMonths: { before: 12, after: 12 },
          terms: { before: null, after: "Updated terms" },
        },
        reason: "Cap nhat dieu khoan",
      },
    ],
  });

  assert.ok(entry);
  assert.deepEqual(entry.changedFields, ["terms"]);
});
