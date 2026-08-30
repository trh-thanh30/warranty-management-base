import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readViewSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

const tablePolicies = [
  {
    file: "./content-pages/components/content-pages-directory.tsx",
    tableClass: "min-w-[900px] whitespace-nowrap",
  },
  {
    file: "./warranty-activation-requests/components/warranty-activation-requests-table.tsx",
    tableClass: "min-w-[1180px] whitespace-nowrap",
  },
  {
    file: "./warranty-claims/components/warranty-claims-table.tsx",
    tableClass: "min-w-[1360px] whitespace-nowrap",
  },
] as const;

test("secondary data tables scroll instead of wrapping compact columns", () => {
  for (const policy of tablePolicies) {
    const source = readViewSource(policy.file);
    assert.ok(
      source.includes(`<Table className="${policy.tableClass}">`),
      `${policy.file} must use ${policy.tableClass}`,
    );
  }
});

test("secondary table long values use bounded truncation", () => {
  assert.match(
    readViewSource("./content-pages/components/content-pages-directory.tsx"),
    /max-w-sm truncate font-mono/,
  );
  const activationRequestsSource = readViewSource(
    "./warranty-activation-requests/components/warranty-activation-requests-table.tsx",
  );
  assert.match(activationRequestsSource, /block max-w-52 truncate font-mono/);
  assert.match(activationRequestsSource, /max-w-52 truncate font-mono text-xs/);

  const activationItemsSource = readViewSource(
    "./warranty-activation-requests/components/activation-request-items-table.tsx",
  );
  assert.match(activationItemsSource, /block max-w-52 truncate/);
  assert.match(activationItemsSource, /block max-w-64 truncate/);

  const warrantyClaimsSource = readViewSource(
    "./warranty-claims/components/warranty-claims-table.tsx",
  );
  assert.match(warrantyClaimsSource, /max-w-52 truncate font-mono/);
  assert.match(warrantyClaimsSource, /block max-w-52 truncate/);

  assert.match(
    readViewSource("./dashboard/components/dashboard-recent-claims.tsx"),
    /block max-w-44 truncate/,
  );
});
