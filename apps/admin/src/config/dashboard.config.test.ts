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

test("orders product templates before physical products", () => {
  const config = getDashboardConfig((key) => key);
  const products = config.sidebarSections
    .flatMap((section) => section.items)
    .find((item) => item.title === "items.products");

  assert.equal(products?.href, undefined);
  assert.deepEqual(
    products?.children?.map((item) => [item.title, item.href]),
    [
      ["items.productTemplates", "/product-templates"],
      ["items.products", "/products"],
    ],
  );
});

test("groups warranties while keeping claims independent", () => {
  const config = getDashboardConfig((key) => key);
  const items = config.sidebarSections.flatMap((section) => section.items);
  const warranties = items.find((item) => item.title === "items.warranties");

  assert.deepEqual(
    warranties?.children?.map((item) => [item.title, item.href]),
    [
      ["items.warranties", "/warranties"],
      ["items.warrantyActivationRequests", "/warranty-activation-requests"],
    ],
  );
  assert.equal(
    items.find((item) => item.title === "items.warrantyClaims")?.href,
    "/warranty-claims",
  );
});
