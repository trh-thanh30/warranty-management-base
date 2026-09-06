import assert from "node:assert/strict";
import test from "node:test";
import { PERMISSIONS } from "@repo/shared/constants";
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

test("places contact submissions after dealers in the general sidebar section", () => {
  const config = getDashboardConfig((key) => key);
  const generalSection = config.sidebarSections.find(
    (section) => section.label === "sections.general",
  );
  const itemHrefs = generalSection?.items.map((item) => item.href);
  const contactSubmissions = generalSection?.items.find(
    (item) => item.href === "/contact-submissions",
  );

  assert.equal(
    itemHrefs?.indexOf("/contact-submissions"),
    (itemHrefs?.indexOf("/dealers") ?? -2) + 1,
  );
  assert.equal(contactSubmissions?.notificationBadgeKey, "contactSubmissions");
});

test("exposes physical products without the retired template destination", () => {
  const config = getDashboardConfig((key) => key);
  const products = config.sidebarSections
    .flatMap((section) => section.items)
    .find((item) => item.title === "items.products");

  assert.equal(products?.href, "/products");
  assert.equal(products?.requiredPermission, PERMISSIONS.PRODUCT_VIEW);
  assert.equal(products?.children, undefined);
  assert.equal(JSON.stringify(config).includes("/product-templates"), false);
});

test("groups warranties while keeping claims independent", () => {
  const config = getDashboardConfig((key) => key);
  const items = config.sidebarSections.flatMap((section) => section.items);
  const warranties = items.find((item) => item.title === "items.warranties");

  assert.deepEqual(
    warranties?.children?.map((item) => [item.title, item.href]),
    [
      ["items.warrantyList", "/warranties"],
      ["items.warrantyActivationRequests", "/warranty-activation-requests"],
    ],
  );
  assert.equal(
    items.find((item) => item.title === "items.warrantyClaims")?.href,
    "/warranty-claims",
  );
});

test("groups settings sections under dedicated routes", () => {
  const config = getDashboardConfig((key) => key);
  const settings = config.sidebarSections
    .flatMap((section) => section.items)
    .find((item) => item.title === "items.settings");

  assert.deepEqual(
    settings?.children?.map((item) => [item.title, item.href]),
    [
      ["items.settingsProfile", "/settings/profile"],
      ["items.settingsSecurity", "/settings/security"],
      ["items.settingsPermissions", "/settings/permissions"],
      [
        "items.settingsActivationCodePolicy",
        "/settings/activation-code-policy",
      ],
    ],
  );

  assert.equal(
    settings?.children?.find(
      (item) => item.href === "/settings/activation-code-policy",
    )?.requiredPermission,
    PERMISSIONS.SYSTEM_CONFIG_VIEW,
  );
});
