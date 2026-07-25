import assert from "node:assert/strict";
import test from "node:test";
import { PERMISSIONS, type PermissionKey } from "@repo/shared/constants";
import {
  canAccessNavigationItem,
  resolveNavigationHref,
} from "./navigation-permissions.ts";

const item = {
  href: "/products",
  permissionHrefs: [
    { permission: PERMISSIONS.PRODUCT_VIEW, href: "/products" },
    {
      permission: PERMISSIONS.PRODUCT_TEMPLATE_VIEW,
      href: "/product-templates",
    },
  ],
  requiredAnyPermissions: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_TEMPLATE_VIEW,
  ],
};

test("resolves product navigation to the first permitted page", () => {
  const templateOnly = (permission: PermissionKey) =>
    permission === PERMISSIONS.PRODUCT_TEMPLATE_VIEW;

  assert.equal(canAccessNavigationItem(item, templateOnly), true);
  assert.equal(resolveNavigationHref(item, templateOnly), "/product-templates");
});

test("hides grouped navigation without either product permission", () => {
  assert.equal(
    canAccessNavigationItem(item, () => false),
    false,
  );
});
