import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const detailViews = [
  "./service-centers/service-center-detail.view.tsx",
  "./warranty-activation-requests/warranty-activation-request-detail.view.tsx",
  "./warranties/warranty-detail.view.tsx",
] as const;

test("admin detail views keep actions beside their descriptions on desktop", async () => {
  for (const relativePath of detailViews) {
    const source = await readFile(
      new URL(relativePath, import.meta.url),
      "utf8",
    );

    assert.match(source, /descriptionAccessory=\{/);
  }
});

test("admin detail view actions remain full width only on mobile", async () => {
  for (const relativePath of detailViews) {
    const source = await readFile(
      new URL(relativePath, import.meta.url),
      "utf8",
    );

    assert.match(source, /flex w-full flex-col gap-2 sm:w-auto sm:flex-row/);
    assert.match(source, /className="[^"]*w-full[^"]*sm:w-auto[^"]*"/);
  }
});
