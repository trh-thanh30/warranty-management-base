import assert from "node:assert/strict";
import test from "node:test";
import { getDashboardConfig } from "./dashboard.config.ts";

test("places content pages first in the other sidebar section", () => {
  const config = getDashboardConfig((key) => key);
  const otherSection = config.sidebarSections.find(
    (section) => section.label === "sections.other",
  );

  assert.deepEqual(
    otherSection?.items.map((item) => item.title),
    [
      "items.contentPages",
      "items.notifications",
      "items.system",
      "items.settings",
    ],
  );
});

test("groups website configuration routes under one sidebar parent", () => {
  const config = getDashboardConfig((key) => key);
  const websiteSection = config.sidebarSections.find(
    (section) => section.label === "sections.website",
  );
  const websiteConfig = websiteSection?.items[0];

  assert.equal(websiteSection?.items.length, 1);
  assert.equal(websiteConfig?.title, "items.websiteConfig");
  assert.deepEqual(
    websiteConfig?.children?.map((item) => item.href),
    ["/website-config", "/website-config/site", "/website-config/navigation"],
  );
});
