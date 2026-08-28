import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const navigationSources = [
  "./components/activation-request-items-table.tsx",
  "./components/warranty-activation-request-detail-card.tsx",
].map((relativePath) => ({
  relativePath,
  source: readFileSync(new URL(relativePath, import.meta.url), "utf8"),
}));

test("activation request product and warranty links preserve the active locale", () => {
  for (const { relativePath, source } of navigationSources) {
    assert.match(
      source,
      /import \{ Link \} from "@\/src\/i18n\/navigation"/,
      `${relativePath} must use the locale-aware Link`,
    );
    assert.doesNotMatch(
      source,
      /from "next\/link"/,
      `${relativePath} must not bypass locale-aware navigation`,
    );
  }
});

test("activation request warranty links use canonical internal paths", () => {
  const combinedSource = navigationSources
    .map(({ source }) => source)
    .join("\n");

  assert.match(combinedSource, /href=\{`\/products\/\$\{item\.productId\}`\}/);
  assert.match(
    combinedSource,
    /href=\{`\/warranties\/\$\{item\.warrantyId\}`\}/,
  );
  assert.match(
    combinedSource,
    /href=\{`\/warranties\/\$\{activatedWarranty\.id\}`\}/,
  );
});
