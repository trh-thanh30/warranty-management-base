import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const forms = [
  {
    name: "customer",
    source: readFileSync(
      new URL("./customers/components/customer-form.tsx", import.meta.url),
      "utf8",
    ),
  },
  {
    name: "dealer",
    source: readFileSync(
      new URL("./dealers/components/dealer-form.tsx", import.meta.url),
      "utf8",
    ),
  },
  {
    name: "service center",
    source: readFileSync(
      new URL(
        "./service-centers/components/service-center-form.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
  },
];

for (const form of forms) {
  test(`${form.name} ward input exposes its dependent query loading state`, () => {
    assert.match(form.source, /loading=\{wardsQuery\.isLoading\}/);
    assert.match(form.source, /loadingLabel=\{t\("loadingWards"\)\}/);
    assert.match(
      form.source,
      /error=\{\s*wardsQuery\.isLoading\s*\? undefined/,
    );
  });
}
