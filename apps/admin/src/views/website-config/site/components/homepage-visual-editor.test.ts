import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const form = readFileSync(
  "src/views/website-config/site/components/website-site-config-form.tsx",
  "utf8",
);
const view = readFileSync(
  "src/views/website-config/site/website-site-config.view.tsx",
  "utf8",
);
const styles = readFileSync("app/globals.css", "utf8");

test("homepage tab opens the dedicated editor instead of mounting it inline", () => {
  assert.doesNotMatch(form, /HomepageVisualEditor/);
  assert.match(form, /target="_blank"/);
  assert.match(form, /homepage-editor/);
  assert.doesNotMatch(form, /HomepageContentEditor/);
  assert.doesNotMatch(view, /HomepagePreviewDialog|PreviewDataDialog/);
});

test("admin canvas loads homepage design tokens", () => {
  assert.match(styles, /--color-premium-red:\s*#db2114/);
  assert.match(styles, /--color-deep-black:\s*#040708/);
  assert.match(styles, /--font-heading:/);
});

test("admin canvas renders in the host document for local assets and styles", () => {
  const source = readFileSync(
    "src/views/website-config/site/components/homepage-visual-editor.tsx",
    "utf8",
  );
  assert.match(source, /iframe=\{\{ enabled: false \}\}/);
});

test("homepage editor is hosted on a dedicated route", () => {
  const source = readFileSync(
    "src/views/website-config/site/homepage-editor.view.tsx",
    "utf8",
  );
  assert.match(source, /HomepageVisualEditor/);
  assert.match(source, /standalone/);
  assert.doesNotMatch(source, /RevisionStatusBar/);
});

test("homepage image fallback resolves against the public web origin", () => {
  const source = readFileSync(
    "src/views/website-config/site/homepage-editor.view.tsx",
    "utf8",
  );
  assert.match(source, /toPreviewUrl\(/);
  assert.match(source, /\/hero\/hero_5\.jpg/);
});
