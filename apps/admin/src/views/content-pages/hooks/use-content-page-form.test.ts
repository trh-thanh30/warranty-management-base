import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./use-content-page-form.ts", import.meta.url),
  "utf8",
);

test("edit form initializes from the loaded page instead of the general-policy fallback", () => {
  assert.match(source, /defaultValues:\s*getContentPageFormValues\(page\)/);
});
