import assert from "node:assert/strict";
import test from "node:test";
import { addCalendarMonths } from "../src/utils/date.ts";

test("adding a month clamps the result to the last day of a shorter month", () => {
  const result = addCalendarMonths(new Date(2025, 0, 31, 10, 15), 1);

  assert.equal(result.getFullYear(), 2025);
  assert.equal(result.getMonth(), 1);
  assert.equal(result.getDate(), 28);
  assert.equal(result.getHours(), 10);
  assert.equal(result.getMinutes(), 15);
});

test("adding a month uses February 29 during a leap year", () => {
  const result = addCalendarMonths(new Date(2024, 0, 31, 8, 30), 1);

  assert.equal(result.getFullYear(), 2024);
  assert.equal(result.getMonth(), 1);
  assert.equal(result.getDate(), 29);
});

test("adding calendar months does not mutate the input date", () => {
  const input = new Date(2026, 6, 8, 10, 10);
  const originalTime = input.getTime();

  const result = addCalendarMonths(input, 36);

  assert.equal(input.getTime(), originalTime);
  assert.notEqual(result, input);
});
