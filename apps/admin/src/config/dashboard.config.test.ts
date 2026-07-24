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
