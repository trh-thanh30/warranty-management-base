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

test("homepage tab mounts the visual editor instead of legacy preview UI", () => {
  assert.match(form, /import \{ HomepageVisualEditor \}/);
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

test("homepage editor provides a fullscreen canvas toggle", () => {
  const source = readFileSync(
    "src/views/website-config/site/components/homepage-visual-editor.tsx",
    "utf8",
  );
  assert.match(source, /setIsFullscreen\(\(current\) => !current\)/);
  assert.match(source, /fixed inset-0 z-50/);
  assert.match(source, /homepageEditor\.openFullscreen/);
});
