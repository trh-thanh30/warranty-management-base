import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webSourceRoot = path.join(process.cwd(), "apps", "web", "src");
const pageLayoutFiles = [
  "views/contact/contact.view.tsx",
  "views/dealers/dealers.view.tsx",
  "views/guide/guide.view.tsx",
  "views/home/components/gallery-section.tsx",
  "views/product-detail/product-detail.view.tsx",
  "views/products/products.view.tsx",
  "views/support-centers/support-centers.view.tsx",
  "views/warranty/components/warranty-action-cards.tsx",
  "views/warranty/components/warranty-page-hero.tsx",
  "views/warranty/components/warranty-service-page-shell.tsx",
  "views/warranty/warranty-hub.view.tsx",
];

const hardcodedOuterContainer =
  /className="[^"]*mx-auto[^"]*max-w-\[(?:1000|1200|1400|1640|1720)px\][^"]*px-[^"]*"/g;

test("page layouts use the shared Container for width and responsive gutters", async () => {
  const violations = [];
  const containerSource = await readFile(
    path.join(webSourceRoot, "components/common/container.tsx"),
    "utf8",
  );

  if (!containerSource.includes("cn(")) {
    violations.push(
      "components/common/container.tsx: class overrides are not merged",
    );
  }

  for (const relativePath of pageLayoutFiles) {
    const source = await readFile(
      path.join(webSourceRoot, relativePath),
      "utf8",
    );

    if (!source.includes('components/common/container"')) {
      violations.push(`${relativePath}: missing Container import`);
    }

    for (const match of source.matchAll(hardcodedOuterContainer)) {
      violations.push(`${relativePath}: ${match[0]}`);
    }
  }

  assert.deepEqual(violations, []);
});
