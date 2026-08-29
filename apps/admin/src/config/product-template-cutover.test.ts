import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const legacyRouteFiles = [
  "../../app/[locale]/(dashboard)/product-templates/page.tsx",
  "../../app/[locale]/(dashboard)/product-templates/create/page.tsx",
  "../../app/[locale]/(dashboard)/product-templates/[templateId]/page.tsx",
  "../../app/[locale]/(dashboard)/product-templates/[templateId]/edit/page.tsx",
];

test("redirects every legacy Product Template route to physical products", () => {
  for (const relativePath of legacyRouteFiles) {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");

    assert.match(source, /redirect\(`\/\$\{locale\}\/products`\)/);
    assert.doesNotMatch(source, /ProductTemplate(?:s|Form|Detail)View/);
  }
});
