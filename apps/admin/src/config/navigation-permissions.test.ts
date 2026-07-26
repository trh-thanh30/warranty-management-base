import assert from "node:assert/strict";
import test from "node:test";
import { Boxes, Layers3, Package } from "lucide-react";
import { PERMISSIONS, type PermissionKey } from "@repo/shared/constants";
import {
  canAccessNavigationItem,
  getAccessibleNavigationItems,
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

test("keeps only accessible children and hides an empty parent", () => {
  const items = [
    {
      title: "Products",
      icon: Package,
      children: [
        {
          title: "Templates",
          href: "/product-templates",
          icon: Layers3,
          requiredPermission: PERMISSIONS.PRODUCT_TEMPLATE_VIEW,
        },
        {
          title: "Products",
          href: "/products",
          icon: Boxes,
          requiredPermission: PERMISSIONS.PRODUCT_VIEW,
        },
      ],
    },
  ];
  const templateOnly = getAccessibleNavigationItems(
    items,
    (permission) => permission === PERMISSIONS.PRODUCT_TEMPLATE_VIEW,
    () => true,
  );

  assert.deepEqual(
    templateOnly[0]?.children?.map((child) => child.href),
    ["/product-templates"],
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
