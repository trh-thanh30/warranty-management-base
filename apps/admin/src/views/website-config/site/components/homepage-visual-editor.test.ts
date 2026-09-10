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

test("homepage tab mounts the visual editor instead of legacy preview UI", () => {
  assert.match(form, /import \{ HomepageVisualEditor \}/);
  assert.doesNotMatch(form, /HomepageContentEditor/);
  assert.doesNotMatch(view, /HomepagePreviewDialog|PreviewDataDialog/);
});
