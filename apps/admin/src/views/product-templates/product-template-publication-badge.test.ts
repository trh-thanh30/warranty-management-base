import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const badgeUrl = new URL(
  "./components/product-template-publication-badge.tsx",
  import.meta.url,
);
const tableUrl = new URL(
  "./components/product-templates-table.tsx",
  import.meta.url,
);
const summaryUrl = new URL(
  "./components/product-template-summary-card.tsx",
  import.meta.url,
);

test("product template publication uses consistent semantic badge colors", async () => {
  const [badge, table, summary] = await Promise.all([
    readFile(badgeUrl, "utf8"),
    readFile(tableUrl, "utf8"),
    readFile(summaryUrl, "utf8"),
  ]);

  assert.match(badge, /bg-green-50 text-green-500/);
  assert.match(badge, /bg-yellow-50 text-yellow-500/);
  assert.match(badge, /variant=\{isPublished \? "success" : "warning"\}/);
  assert.match(table, /ProductTemplatePublicationBadge/);
  assert.match(summary, /ProductTemplatePublicationBadge/);
  assert.doesNotMatch(
    table,
    /variant=\{template\.isPublished \? "default" : "secondary"\}/,
  );
  assert.doesNotMatch(
    summary,
    /variant=\{template\.isPublished \? "default" : "secondary"\}/,
  );
});
