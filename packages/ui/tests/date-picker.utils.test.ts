import assert from "node:assert/strict";
import test from "node:test";
import * as datePickerUtils from "../src/date-picker.utils.ts";

type ParseDateInput = (
  value: string,
  options?: { maxDate?: Date; minDate?: Date },
) => Date | undefined;
type FormatDateInput = (value: string) => string;
type ConstrainDateInput = (
  value: string,
  previousValue: string,
  options?: { maxDate?: Date; minDate?: Date },
) => string;

const parseDateInput = (
  datePickerUtils as unknown as { parseDateInput?: ParseDateInput }
).parseDateInput;
const formatDateInput = (
  datePickerUtils as unknown as { formatDateInput?: FormatDateInput }
).formatDateInput;
const constrainDateInput = (
  datePickerUtils as unknown as { constrainDateInput?: ConstrainDateInput }
).constrainDateInput;

function requireParseDateInput() {
  assert.equal(typeof parseDateInput, "function");
  return parseDateInput as ParseDateInput;
}

function requireFormatDateInput() {
  assert.equal(typeof formatDateInput, "function");
  return formatDateInput as FormatDateInput;
}

function requireConstrainDateInput() {
  assert.equal(typeof constrainDateInput, "function");
  return constrainDateInput as ConstrainDateInput;
}

test("inserts date separators while typing digits", () => {
  const formatInput = requireFormatDateInput();

  assert.equal(formatInput("1"), "1");
  assert.equal(formatInput("11"), "11/");
  assert.equal(formatInput("111"), "11/1");
  assert.equal(formatInput("1112"), "11/12/");
  assert.equal(formatInput("11122005"), "11/12/2005");
});

test("normalizes pasted date input and limits it to eight digits", () => {
  const formatInput = requireFormatDateInput();

  assert.equal(formatInput("11/12/2005"), "11/12/2005");
  assert.equal(formatInput("11-12-2005-extra"), "11/12/2005");
});

test("blocks days outside 01 through 31 while typing", () => {
  const constrainInput = requireConstrainDateInput();

  assert.equal(constrainInput("32", "3"), "3");
  assert.equal(constrainInput("00", "0"), "0");
  assert.equal(constrainInput("31", "3"), "31/");
});

test("blocks months outside 01 through 12 while typing", () => {
  const constrainInput = requireConstrainDateInput();

  assert.equal(constrainInput("31/13", "31/1"), "31/1");
  assert.equal(constrainInput("31/00", "31/0"), "31/0");
  assert.equal(constrainInput("31/12", "31/1"), "31/12/");
});

test("blocks a completed year outside the configured year range", () => {
  const constrainInput = requireConstrainDateInput();
  const range = {
    maxDate: new Date(2026, 7, 18),
    minDate: new Date(1900, 0, 1),
  };

  assert.equal(constrainInput("31/12/2027", "31/12/202", range), "31/12/202");
  assert.equal(constrainInput("31/12/1899", "31/12/189", range), "31/12/189");
  assert.equal(constrainInput("31/12/2026", "31/12/202", range), "31/12/2026");
});

test("parses strict dd/MM/yyyy input", () => {
  const parse = requireParseDateInput();
  assert.equal(parse("29/02/2000")?.getFullYear(), 2000);
  assert.equal(parse("29/02/2000")?.getMonth(), 1);
  assert.equal(parse("29/02/2000")?.getDate(), 29);
});

test("rejects invalid or incomplete manual dates", () => {
  const parse = requireParseDateInput();
  assert.equal(parse("31/02/2000"), undefined);
  assert.equal(parse("1/2/2000"), undefined);
  assert.equal(parse("not-a-date"), undefined);
});

test("rejects manual dates outside the allowed range", () => {
  const parse = requireParseDateInput();
  assert.equal(
    parse("18/08/2026", { maxDate: new Date(2026, 7, 17) }),
    undefined,
  );
  assert.equal(
    parse("31/12/1899", { minDate: new Date(1900, 0, 1) }),
    undefined,
  );
});
