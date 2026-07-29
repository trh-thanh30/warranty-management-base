import assert from "node:assert/strict";
import test from "node:test";
import { resolveSelectControlLabel } from "./select-control.tsx";

const options = [
  { label: "Chính sách thanh toán", value: "PAYMENT_POLICY" },
  { label: "Câu hỏi thường gặp", value: "FAQ" },
];

test("resolves the visible label when an edit form loads a selected value", () => {
  assert.equal(
    resolveSelectControlLabel(options, "PAYMENT_POLICY"),
    "Chính sách thanh toán",
  );
});

test("leaves the label unresolved when the selected value is unavailable", () => {
  assert.equal(resolveSelectControlLabel(options, "UNKNOWN"), undefined);
});
