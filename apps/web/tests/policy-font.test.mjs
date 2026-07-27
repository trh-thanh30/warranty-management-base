import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

test("policy pages and global font tokens use Maven Pro without serif overrides", async () => {
  const [globals, policyDirectory, policyDocument] = await Promise.all([
    readFile(path.join(process.cwd(), "apps/web/app/globals.css"), "utf8"),
    readFile(
      path.join(process.cwd(), "apps/web/src/views/policy/policy.view.tsx"),
      "utf8",
    ),
    readFile(
      path.join(process.cwd(), "packages/ui/src/policy-document.tsx"),
      "utf8",
    ),
  ]);

  assert.match(
    globals,
    /--font-sans:\s*var\(--font-maven-pro\), ["']Maven Pro["'], sans-serif;/,
  );
  assert.match(
    globals,
    /--font-serif:\s*var\(--font-maven-pro\), ["']Maven Pro["'], sans-serif;/,
  );
  assert.match(
    globals,
    /--font-condensed:\s*var\(--font-maven-pro\), ["']Maven Pro["'], sans-serif;/,
  );
  assert.doesNotMatch(policyDirectory, /\bfont-serif\b/);
  assert.doesNotMatch(policyDocument, /\bfont-serif\b/);
});
