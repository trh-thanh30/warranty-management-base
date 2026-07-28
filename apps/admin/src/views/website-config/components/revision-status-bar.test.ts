import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const statusBarSource = readFileSync(
  new URL("./revision-status-bar.tsx", import.meta.url),
  "utf8",
);
const siteViewSource = readFileSync(
  new URL("../site/website-site-config.view.tsx", import.meta.url),
  "utf8",
);
const viMessages = JSON.parse(
  readFileSync(new URL("../../../messages/vi.json", import.meta.url), "utf8"),
) as {
  WebsiteConfig: {
    actions: Record<string, string>;
    publish: Record<string, string>;
  };
};

test("website configuration actions stay visible and save precedes publish", () => {
  assert.match(statusBarSource, /sticky top-20/);
  assert.ok(
    statusBarSource.indexOf("<Save") < statusBarSource.indexOf("<Send"),
  );
  assert.match(siteViewSource, /canSave=\{canUpdate\}/);
  assert.match(siteViewSource, /onSave=\{saveDraft\}/);
});

test("publishing is blocked until the changed draft is saved", () => {
  assert.match(
    statusBarSource,
    /const publishDisabled =[\s\S]*hasUnsavedChanges[\s\S]*!revision\.hasUnpublishedChanges/,
  );
  assert.match(statusBarSource, /disabled=\{publishDisabled\}/);
  assert.match(statusBarSource, /publish\.saveBeforePublish/);
});

test("Vietnamese website configuration actions use Vietnamese labels", () => {
  assert.equal(viMessages.WebsiteConfig.actions.saveDraft, "Lưu nháp");
  assert.equal(viMessages.WebsiteConfig.actions.publish, "Xuất bản");
  assert.equal(
    viMessages.WebsiteConfig.publish.saveBeforePublish,
    "Hãy lưu nháp trước khi xuất bản.",
  );
});
