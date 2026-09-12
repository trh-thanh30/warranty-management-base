import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readViewSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

const tablePolicies = [
  {
    file: "./categories/components/categories-table.tsx",
    tableClass: "min-w-[920px] whitespace-nowrap",
  },
  {
    file: "./customers/components/customers-table.tsx",
    tableClass: "min-w-[960px] whitespace-nowrap",
  },
  {
    file: "./dealers/components/dealers-table.tsx",
    tableClass: "min-w-[1080px] whitespace-nowrap",
  },
  {
    file: "./dealers/components/dealer-activated-customers-table.tsx",
    tableClass: "min-w-[960px] whitespace-nowrap",
  },
  {
    file: "./service-centers/components/service-centers-table.tsx",
    tableClass: "min-w-[980px] whitespace-nowrap",
  },
  {
    file: "./staff/components/staff-table.tsx",
    tableClass: "min-w-[900px] whitespace-nowrap",
  },
  {
    file: "./warranties/components/warranties-table.tsx",
    tableClass:
      "min-w-360 whitespace-nowrap [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap",
  },
] as const;

test("directory tables scroll instead of wrapping compact columns", () => {
  for (const policy of tablePolicies) {
    const source = readViewSource(policy.file);
    assert.ok(
      source.includes(`<Table className="${policy.tableClass}">`),
      `${policy.file} must use ${policy.tableClass}`,
    );
  }
});

test("long directory values have bounded truncation targets", () => {
  assert.match(
    readViewSource("./customers/components/customers-table.tsx"),
    /max-w-64 truncate/,
  );
  assert.match(
    readViewSource("./dealers/components/dealers-table.tsx"),
    /max-w-40 truncate/,
  );
  assert.match(
    readViewSource("./dealers/components/dealer-activated-customers-table.tsx"),
    /max-w-64 truncate/,
  );
  const serviceCentersSource = readViewSource(
    "./service-centers/components/service-centers-table.tsx",
  );
  assert.match(serviceCentersSource, /md:max-w-56/);
  assert.match(
    serviceCentersSource,
    /line-clamp-2 md:line-clamp-none md:block md:truncate/,
  );

  const staffSource = readViewSource("./staff/components/staff-table.tsx");
  assert.match(staffSource, /md:max-w-72/);
  assert.match(staffSource, /<p className="truncate font-medium">/);
  assert.match(
    readViewSource("./warranties/components/warranties-table.tsx"),
    /max-w-52 truncate/,
  );
});
