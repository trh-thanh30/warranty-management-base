import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const tableSource = readFileSync(
  new URL(
    "./components/warranty-activation-requests-table.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("activation request table renders warranty codes and products as compact badge lists", () => {
  assert.match(
    tableSource,
    /import \{ CompactBadgeList \} from "@\/src\/components\/common"/,
  );
  assert.match(tableSource, /getActivationRequestWarrantyCodes\(request\)/);
  assert.match(tableSource, /getActivationRequestProductNames\(request\)/);
  assert.equal(tableSource.match(/showItemTooltip/g)?.length, 2);
  assert.doesNotMatch(tableSource, /t\("warrantyCodeCount"/);
});
