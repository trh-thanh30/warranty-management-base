import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const warrantyRoot = path.join(
  process.cwd(),
  "apps",
  "web",
  "src",
  "views",
  "warranty",
);

test("warranty form pages compose the shared page shell and primitives", async () => {
  const viewFiles = [
    "activate.view.tsx",
    "lookup.view.tsx",
    "request.view.tsx",
    "track.view.tsx",
  ];
  const views = await Promise.all(
    viewFiles.map((filename) =>
      readFile(path.join(warrantyRoot, filename), "utf8"),
    ),
  );
  const [shell, hero, heading, formCard] = await Promise.all(
    [
      "warranty-service-page-shell.tsx",
      "warranty-page-hero.tsx",
      "warranty-page-heading.tsx",
      "warranty-form-card.tsx",
    ].map((filename) =>
      readFile(path.join(warrantyRoot, "components", filename), "utf8"),
    ),
  );

  for (const [index, source] of views.entries()) {
    assert.match(source, /<WarrantyServicePageShell/, viewFiles[index]);
    assert.match(source, /<WarrantyFormCard/, viewFiles[index]);
    assert.doesNotMatch(
      source,
      /708986914_976804048389364_3900113787497783781_n\.jpg/,
      viewFiles[index],
    );
  }

  for (const [index, source] of views.entries()) {
    assert.match(source, /<WarrantyPageHeading/, viewFiles[index]);
  }

  assert.match(shell, /<WarrantyPageHero/);
  assert.match(shell, /<WarrantyBackLink\s*\/>/);
  assert.match(shell, /<WarrantyPolicyShortcut\s*\/>/);
  assert.match(hero, /next\/image/);
  assert.match(heading, /text-center/);
  assert.match(formCard, /rounded-md border border-border-gray/);
});
