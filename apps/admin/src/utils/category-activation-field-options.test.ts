import assert from "node:assert/strict";
import test from "node:test";
import { parseActivationFieldOptionsText } from "./category-activation-field-options.ts";

test("parseActivationFieldOptionsText parses label and value pairs", () => {
  assert.deepEqual(
    parseActivationFieldOptionsText("Kinh lái|windshield\nKính lưng|rear"),
    [
      { label: "Kinh lái", value: "windshield" },
      { label: "Kính lưng", value: "rear" },
    ],
  );
});

test("parseActivationFieldOptionsText falls back to label when value is blank", () => {
  assert.deepEqual(
    parseActivationFieldOptionsText("Kinh lái\n\n Kính lưng | "),
    [
      { label: "Kinh lái", value: "Kinh lái" },
      { label: "Kính lưng", value: "Kính lưng" },
    ],
  );
});
