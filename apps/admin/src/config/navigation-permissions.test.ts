import assert from "node:assert/strict";
import test from "node:test";
import { Boxes, Package } from "lucide-react";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  canAccessNavigationItem,
  getAccessibleNavigationItems,
  resolveNavigationHref,
} from "./navigation-permissions.ts";

const item = {
  href: "/products",
  requiredPermission: PERMISSIONS.PRODUCT_VIEW,
};

test("resolves product navigation only for product viewers", () => {
  const noPermissions = () => false;

  assert.equal(canAccessNavigationItem(item, noPermissions), false);
  assert.equal(resolveNavigationHref(item, noPermissions), "/products");
  assert.equal(
    canAccessNavigationItem(
      item,
      (permission) => permission === PERMISSIONS.PRODUCT_VIEW,
    ),
    true,
  );
});

test("hides product navigation without product permission", () => {
  assert.equal(
    canAccessNavigationItem(item, () => false),
    false,
  );
});

test("keeps only accessible children and hides an empty parent", () => {
  const items = [
    {
      title: "Products",
      icon: Package,
      children: [
        {
          title: "Products",
          href: "/products",
          icon: Boxes,
          requiredPermission: PERMISSIONS.PRODUCT_VIEW,
        },
      ],
    },
  ];
  const productOnly = getAccessibleNavigationItems(
    items,
    (permission) => permission === PERMISSIONS.PRODUCT_VIEW,
    () => true,
  );

  assert.deepEqual(
    productOnly[0]?.children?.map((child) => child.href),
    ["/products"],
  );
  assert.deepEqual(
    getAccessibleNavigationItems(
      items,
      () => false,
      () => true,
    ),
    [],
  );
});

test("filters role-restricted navigation recursively", () => {
  const items = [
    {
      title: "Products",
      icon: Package,
      children: [
        {
          title: "Admin products",
          href: "/products",
          icon: Boxes,
          requiredRole: "admin" as const,
        },
      ],
    },
  ];

  assert.deepEqual(
    getAccessibleNavigationItems(
      items,
      () => true,
      () => false,
    ),
    [],
  );
});
