import assert from "node:assert/strict";
import test from "node:test";
import type { WarrantyClaimStatusHistorySummary } from "@repo/shared";
import {
  getClaimProgressActiveStep,
  getClaimProgressStepState,
} from "./warranty-claim-status-stepper.utils.ts";

const reviewingHistory = [
  {
    createdAt: "2026-07-24T00:00:00.000Z",
    fromStatus: "SUBMITTED",
    id: "history-1",
    toStatus: "REVIEWING",
  },
] as WarrantyClaimStatusHistorySummary[];

test("progress keeps the current sequential status active", () => {
  assert.equal(getClaimProgressActiveStep("REVIEWING"), 2);
  assert.equal(
    getClaimProgressStepState({
      currentStatus: "REVIEWING",
      history: reviewingHistory,
      stepStatus: "SUBMITTED",
    }),
    "completed",
  );
  assert.equal(
    getClaimProgressStepState({
      currentStatus: "REVIEWING",
      history: reviewingHistory,
      stepStatus: "REVIEWING",
    }),
    "active",
  );
  assert.equal(
    getClaimProgressStepState({
      currentStatus: "REVIEWING",
      history: reviewingHistory,
      stepStatus: "APPROVED",
    }),
    "upcoming",
  );
});

test("cancelled progress preserves completed steps without an active step", () => {
  const history = [
    ...reviewingHistory,
    {
      createdAt: "2026-07-24T01:00:00.000Z",
      fromStatus: "REVIEWING",
      id: "history-2",
      toStatus: "CANCELLED",
    },
  ] as WarrantyClaimStatusHistorySummary[];

  assert.equal(getClaimProgressActiveStep("CANCELLED"), 0);
  assert.equal(
    getClaimProgressStepState({
      currentStatus: "CANCELLED",
      history,
      stepStatus: "REVIEWING",
    }),
    "completed",
  );
  assert.equal(
    getClaimProgressStepState({
      currentStatus: "CANCELLED",
      history,
      stepStatus: "APPROVED",
    }),
    "upcoming",
  );
});

test("completed claims mark the full success path as completed", () => {
  assert.equal(getClaimProgressActiveStep("COMPLETED"), 0);
  assert.equal(
    getClaimProgressStepState({
      currentStatus: "COMPLETED",
      history: [],
      stepStatus: "COMPLETED",
    }),
    "completed",
  );
});
