import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const viewUrl = new URL("./activation-code-detail.view.tsx", import.meta.url);
const batchesViewUrl = new URL(
  "./activation-code-batches.view.tsx",
  import.meta.url,
);
const repositoryUrl = new URL(
  "../../../../api/src/modules/activation-codes/repository/activation-code-batches.repository.ts",
  import.meta.url,
);

test("activation code details request 10 items and render pagination controls", async () => {
  const source = await readFile(viewUrl, "utf8");

  assert.match(source, /const PAGE_SIZE = 10;/);
  assert.match(source, /page,/);
  assert.match(source, /<PaginationControls/);
  assert.doesNotMatch(source, /variant="compact"/);
  assert.doesNotMatch(source, /limit:\s*1000/);
});

test("activation code rows reveal available codes and group actions in a dropdown", async () => {
  const source = await readFile(viewUrl, "utf8");

  assert.match(source, /group-hover\/code:opacity-100/);
  assert.match(source, /revealedCodeId === item\.id && item\.copyCode/);
  assert.match(source, /<DropdownMenu>/);
  assert.match(source, /<DropdownMenuItem/);
});

test("activation code rows expose product assignment through permissioned actions", async () => {
  const source = await readFile(viewUrl, "utf8");

  assert.match(source, /PERMISSIONS\.ACTIVATION_CODE_ASSIGN_PRODUCT/);
  assert.match(source, /columns\.product/);
  assert.match(source, /<ActivationCodeProductAssignmentDialog/);
  assert.match(source, /item\.assignedProduct/);
  assert.match(source, /activationCodeId=\$\{encodeURIComponent\(code\.id\)\}/);
  assert.match(source, /productId=\$\{encodeURIComponent/);
});

test("activation code detail uses the shared detail-page shell", async () => {
  const source = await readFile(viewUrl, "utf8");

  assert.match(source, /<FormPageShell/);
  assert.match(source, /backHref="\/activation-code-batches"/);
  assert.doesNotMatch(source, /<PageHeader/);
});

test("activation code repository paginates in the database", async () => {
  const source = await readFile(repositoryUrl, "utf8");

  assert.match(
    source,
    /activationCode\.findMany\(\{[\s\S]*?skip,[\s\S]*?take,/,
  );
  assert.match(source, /activationCode\.count\(\{ where \}\)/);
  assert.match(source, /code_hash: this\.crypto\.hash\(search\)/);
  assert.doesNotMatch(source, /items\.slice\(skip, skip \+ take\)/);
});

test("activation batch directory uses the shared default pagination", async () => {
  const source = await readFile(batchesViewUrl, "utf8");

  assert.match(source, /<PaginationControls/);
  assert.doesNotMatch(source, /variant="compact"/);
});
