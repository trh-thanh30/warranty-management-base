import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/date-picker.tsx", import.meta.url),
  "utf8",
);
const calendarSource = readFileSync(
  new URL("../src/calendar.tsx", import.meta.url),
  "utf8",
);

test("DatePicker keeps manual input opt-in", () => {
  assert.match(source, /allowManualInput\?: boolean/);
  assert.match(source, /allowManualInput = false/);
  assert.match(source, /if \(allowManualInput\)/);
});

test("manual date input validates on blur and Enter", () => {
  assert.match(source, /formatDateInput\(event\.target\.value\)/);
  assert.match(source, /parseDateInput\(inputValue, \{ maxDate, minDate \}\)/);
  assert.match(source, /onBlur=\{commitManualInput\}/);
  assert.match(source, /event\.key === "Enter"/);
  assert.match(source, /event\.key === "Backspace"/);
  assert.match(source, /role="alert"/);
});

test("manual date input blocks invalid segments and validates complete dates immediately", () => {
  assert.match(source, /constrainDateInput\(/);
  assert.match(source, /nextValue\.length === 10/);
  assert.match(source, /parseDateInput\(nextValue, \{ maxDate, minDate \}\)/);
});

test("DatePicker forwards month and year navigation options", () => {
  assert.match(source, /captionLayout=\{captionLayout\}/);
  assert.match(source, /endMonth=\{endMonth\}/);
  assert.match(source, /startMonth=\{startMonth\}/);
});

test("Calendar limits custom month and year dropdowns to about ten items", () => {
  assert.match(calendarSource, /dropdowns: cn\(/);
  assert.match(calendarSource, /Dropdown: CalendarDropdown/);
  assert.match(calendarSource, /viewportClassName="max-h-80"/);
});
