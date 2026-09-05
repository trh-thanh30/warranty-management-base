import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readViewSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

test("remaining directory tables keep compact columns on one line", () => {
  assert.match(
    readViewSource("./notifications/components/admin-notification-list.tsx"),
    /<Table className="min-w-\[980px\] whitespace-nowrap">/,
  );
  const contactSubmissionsSource = readViewSource(
    "./contact-submissions/components/contact-submissions-directory-card.tsx",
  );
  assert.match(
    contactSubmissionsSource,
    /<TableCell className="whitespace-nowrap">\s*\{formatDate/,
  );
  assert.match(
    contactSubmissionsSource,
    /<TableCell className="whitespace-nowrap text-right">/,
  );
});

test("remaining long table values are bounded without changing mobile cards", () => {
  const productsSource = readViewSource(
    "./products/components/products-table.tsx",
  );
  assert.match(productsSource, /lg:max-w-64/);
  assert.match(productsSource, /block truncate font-medium/);
  assert.match(productsSource, /block max-w-64 truncate/);

  assert.match(
    readViewSource("./customers/customer-products.view.tsx"),
    /block max-w-64 truncate/,
  );

  const contactSubmissionsSource = readViewSource(
    "./contact-submissions/components/contact-submissions-directory-card.tsx",
  );
  assert.match(contactSubmissionsSource, /md:max-w-64/);
  assert.match(contactSubmissionsSource, /line-clamp-2/);
});

test("detail tables continue wrapping long values", () => {
  assert.match(
    readViewSource("./contact-submissions/contact-submission-detail.view.tsx"),
    /break-words/,
  );
  assert.match(
    readViewSource(
      "./warranty-claims/components/warranty-claim-detail-content.tsx",
    ),
    /break-words/,
  );
});
