import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { formatDateTimeInput } from "@repo/ui/date-time-picker";

const formSource = readFileSync(
  new URL(
    "./components/create-warranty-activation-request-form-card.tsx",
    import.meta.url,
  ),
  "utf8",
);
const pickerSource = readFileSync(
  new URL(
    "../../../../../packages/ui/src/date-time-picker.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("installation date uses the shared shadcn date-time picker", () => {
  assert.match(formSource, /<DateTimePicker/);
  assert.doesNotMatch(formSource, /type="datetime-local"/);
});

test("installation date keeps a direct text input alongside the picker", () => {
  assert.match(pickerSource, /<Input/);
  assert.match(pickerSource, /onChange=\{\(event\)/);
  assert.match(pickerSource, /formatDateTimeInput\(event\.target\.value\)/);
  assert.match(pickerSource, /resetLabel/);
  assert.match(formSource, /onValueChange=\{field\.onChange\}/);
});

test("installation date formats digits as the user types", () => {
  assert.equal(formatDateTimeInput("12112005"), "12/11/2005");
  assert.equal(formatDateTimeInput("121120051430"), "12/11/2005 14:30");
});

test("new activation requests initialize installation date to now", () => {
  const hookSource = readFileSync(
    new URL(
      "./hooks/use-create-warranty-activation-request-form.ts",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    hookSource,
    /installedAt: formatActivationRequestDateTimeInput\(new Date\(\)\.toISOString\(\)\)/,
  );
});
